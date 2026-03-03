import axios from 'axios';
import { PORTONE_BANKS } from '../constants/bank';
import { VerifyAccountDto } from '../dtos/settlement.dto';
import { SettlementRepository}  from '../repositories/settlement.repository';

export const verifyAndSaveAccount = async (userId: number, dto: VerifyAccountDto) => {
  const { name, bank, accountNumber, holderName } = dto;

  // 1. 필수 입력값 검증 (400)
  if (!name || !bank || !accountNumber || !holderName) {
    throw { status: 400, type: "ValidationError", message: "필수 입력값(은행, 계좌번호, 실명/대표자명, 예금주명)이 모두 입력되지 않았습니다." };
  }

  // 2. 지원하는 은행 코드인지 검증 (400)
  if (!PORTONE_BANKS[bank]) {
    throw { status: 400, type: "InvalidAccountInfo", message: "유효하지 않은 계좌번호이거나 지원하지 않는 은행입니다." };
  }

  // 3. 실명과 예금주명 일치 여부 1차 검증 (400)
  if (name !== holderName) {
    throw { status: 400, type: "NameMismatch", message: "입력하신 실명/대표자명과 예금주명이 일치하지 않습니다." };
  }

  try {
    // 4. 포트원 계좌 실명 조회 API 호출
    const portoneUrl = `https://api.portone.io/platform/bank-accounts/${bank}/${accountNumber}/holder`;
    const response = await axios.get(portoneUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `PortOne ${process.env.PORTONE_API_SECRET}`
      }
    });

    const portoneHolderName = response.data.holderName;

    // 5. 실제 예금주명 비교 (400)
    if (portoneHolderName !== holderName) {
      throw { status: 400, type: "AccountHolderMismatch", message: "인증 실패: 실제 계좌의 예금주명과 다릅니다." };
    }

  } catch (error: any) {
    if (error.status) throw error; 
    
    // 포트원 API 응답 에러 처리
    if (error.response?.status === 400 || error.response?.status === 404) {
      throw { status: 400, type: "InvalidAccountInfo", message: "유효하지 않은 계좌번호이거나 지원하지 않는 은행입니다." };
    }
    
    throw { status: 500, type: "InternalServerError", message: "알 수 없는 오류가 발생했습니다." };
  }

  // 6. 모든 검증을 통과했다면 DB에 저장
  await SettlementRepository.upsertSettlementAccount(userId, bank, accountNumber, holderName);

  return { message: "계좌 인증이 완료되었습니다." };
};