// 응답/관리자 화면 노출용 사업자등록번호 마스킹.
// 평문 저장은 유지하고 노출 시점에만 마스킹 (Phase 9 D-2 절충).
// 1234567890 -> 123-45-****0
export const maskBusinessNumber = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 10) return raw;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-****${digits.slice(9)}`;
};
