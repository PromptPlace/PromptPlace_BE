// 정산 수수료 계산.
// 정책 (#491): 정산금 = 판매가 - (수수료 10% + VAT 1%) = 판매가 × 89%.
// 단일 fee 컬럼에 수수료+VAT 합산 저장 (회계 분리 필요 시 별도 이슈에서 VAT 컬럼 분리).
export const COMMISSION_RATE = 0.1;            // 수수료 10%
export const VAT_RATE_ON_COMMISSION = 0.1;     // VAT는 수수료의 10%
export const TOTAL_DEDUCT_RATE = COMMISSION_RATE * (1 + VAT_RATE_ON_COMMISSION); // 0.11

export interface FeeBreakdown {
  fee: number;            // 수수료 + VAT 합계 (Settlement.fee 컬럼에 저장)
  settledAmount: number;  // 판매자 정산금 (Settlement.amount 컬럼)
}

export const calculateSettlementFee = (salePrice: number): FeeBreakdown => {
  const fee = Math.floor(salePrice * TOTAL_DEDUCT_RATE);
  return {
    fee,
    settledAmount: salePrice - fee,
  };
};
