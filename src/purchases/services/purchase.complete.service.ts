import { PromptPurchaseCompleteRequestDTO, PromptPurchaseCompleteResponseDTO } from '../dtos/purchase.complete.dto';
import { PurchaseRepository } from '../repositories/purchase.request.repository';
import { AppError } from '../../errors/AppError';
import prisma from '../../config/prisma';
import { fetchAndVerifyPortonePayment } from '../utils/portone';

function mapPgProvider(pg: string | undefined): 'kakaopay' | 'tosspayments' {
  const src = (pg || '').toLowerCase();
  if (src.includes('kakaopay')) return 'kakaopay';
  if (src.includes('toss')) return 'tosspayments';
  
  return 'tosspayments';
}

export const PurchaseCompleteService = {
  async completePurchase(userId: number, dto: PromptPurchaseCompleteRequestDTO): Promise<PromptPurchaseCompleteResponseDTO> {
    const { imp_uid, merchant_uid } = dto;

    // (A) 결제 대상 프롬프트/가격 확보(서버 기준 기대금액)
    // - custom_data를 신뢰하지 말고, merchant_uid로 자체 매칭하거나,
    //   결제 시작 단계에서 저장한 컨텍스트를 조회하는 게 베스트.
    // - 여기서는 간단히 PortOne.custom_data.prompt_id를 쓸 수 있게 하되,
    //   기대금액은 서버 데이터에서 가져오자.
    //   (필요 시 PurchaseRepository에 prompt 가격 조회 메서드 사용)
   
    // 임시: 포트원 검증 전에 prompt_id를 모르므로 1차 조회 후 prompt 재조회 플로우로 진행

    // 1) PortOne에서 결제 조회 후 상태/주문번호/금액 검증
    //    기대 금액은 우선 0으로 넣고, 아래에서 prompt 로드 후 다시 크로스체크
    const prelim = await fetchAndVerifyPortonePayment(imp_uid, {
      merchant_uid,
      amount: 0, // 일단 0(임시), 아래에서 실제 금액으로 재검증
    });

    // 2) 프롬프트 + 판매자 조회
    const safeCustom = prelim.custom_data || {};
    const promptId = Number(safeCustom.prompt_id);
    if (!promptId) throw new AppError('잘못된 결제 요청입니다.(prompt_id 누락)', 400, 'BadRequest');

    const prompt = await PurchaseRepository.findPromptWithSeller(promptId);
    if (!prompt) throw new AppError('프롬프트를 찾을 수 없습니다.', 404, 'NotFound');
    if (prompt.is_free) throw new AppError('무료 프롬프트는 결제할 수 없습니다.', 400, 'BadRequest');

    // 서버 기준 기대금액
    const expectedAmount = Number((prompt as any).price ?? prompt.price ?? 0);
    if (!expectedAmount) throw new AppError('결제 금액 산정 실패', 400, 'BadRequest');

    // (재검증) 포트원 금액 vs 서버 기대금액
    if (Number(prelim.amount) !== expectedAmount) {
      throw new AppError('결제 금액 검증 실패(서버 기대금액 불일치)', 400, 'BadRequest');
    }

    // 이미 구매했는지(성공 결제 존재) 체크
    const already = await PurchaseRepository.findExistingPurchase(userId, prompt.prompt_id);
    if (already) {
      return {
        message: '이미 구매한 프롬프트입니다.',
        status: 'Succeed',
        purchase_id: already.purchase_id,
        statusCode: 200,
      };
    }

    const seller_id = prompt.user_id;
    const amount = expectedAmount;
    const pg = mapPgProvider(prelim.pg_provider);

    // 3) 트랜잭션: Purchase → Payment → Settlement
    const { purchase_id } = await prisma.$transaction(async (tx) => {
      // 구매 생성
      const purchase = await PurchaseRepository.createPurchaseTx(tx, {
        user_id: userId,
        prompt_id: prompt.prompt_id,
        seller_id,
        amount,
        is_free: false,
      });

      // 결제 생성 (DB enum: 'SUCCEED'로 가정)
      const payment = await PurchaseRepository.createPaymentTx(tx, {
        purchase_id: purchase.purchase_id,
        merchant_uid,
        pg,
        status: 'Succeed', 
        imp_uid,
      });

      // 정산 upsert (결제 단위)
     await PurchaseRepository.upsertSettlementForPaymentTx(tx, {
        sellerId: seller_id,
        paymentId: payment.payment_id,
        amount,
        fee: 0,
        status: 'Succeed',
      });
      return { purchase_id: purchase.purchase_id };
    });

    return {
      message: '결제가 성공적으로 완료되었습니다.',
      status: 'Succeed',
      purchase_id,
      statusCode: 200,
    };
  },
};