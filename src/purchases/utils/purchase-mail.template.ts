export interface PurchaseMailData {
  buyerName: string;
  orderId: string;       // 주문번호 (Payment.pcd_pay_oid)
  paidAt: Date;          // 주문(결제)일시
  promptTitle: string;
  promptPrice: number;
  sellerName: string;
  amount: number;        // 결제금액
  payMethod: string;     // 결제수단 (예: "신용카드 (현대카드)")
  orderHistoryUrl: string;
}

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );

const formatWon = (n: number) => `${n.toLocaleString('ko-KR')}원`;

// 서버 TZ와 무관하게 항상 한국 시간으로 표기
export const formatKst = (date: Date) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

/** Payple PCD_PAY_TYPE(card | transfer) + 카드사명을 사람이 읽는 결제수단으로 변환 */
export const toPayMethodLabel = (payType?: string | null, cardName?: string | null) => {
  switch (payType) {
    case 'card':
      return cardName ? `신용카드 (${cardName})` : '신용카드';
    case 'transfer':
      return '계좌이체';
    default:
      return payType || '-';
  }
};

export const buildPurchaseCompleteMail = (d: PurchaseMailData) => {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;color:#888;width:110px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;color:#222;">${value}</td>
    </tr>`;

  const html = `
  <div style="font-family:Arial,'Apple SD Gothic Neo',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222;">
    <h2 style="margin:0 0 8px;">결제가 완료되었습니다</h2>
    <p style="margin:0 0 24px;color:#555;">${escapeHtml(d.buyerName)}님, PromptPlace를 이용해 주셔서 감사합니다.</p>

    <h3 style="margin:0 0 4px;font-size:15px;">주문 정보</h3>
    <table style="width:100%;border-collapse:collapse;border-top:2px solid #222;font-size:14px;">
      ${row('주문번호', escapeHtml(d.orderId))}
      ${row('주문일시', escapeHtml(formatKst(d.paidAt)))}
    </table>

    <h3 style="margin:24px 0 4px;font-size:15px;">프롬프트 정보</h3>
    <table style="width:100%;border-collapse:collapse;border-top:2px solid #222;font-size:14px;">
      ${row('프롬프트명', escapeHtml(d.promptTitle))}
      ${row('가격', formatWon(d.promptPrice))}
      ${row('판매자', escapeHtml(d.sellerName))}
    </table>

    <h3 style="margin:24px 0 4px;font-size:15px;">결제 정보</h3>
    <table style="width:100%;border-collapse:collapse;border-top:2px solid #222;font-size:14px;">
      ${row('결제금액', `<b>${formatWon(d.amount)}</b>`)}
      ${row('결제수단', escapeHtml(d.payMethod))}
    </table>

    <div style="text-align:center;margin:32px 0 16px;">
      <a href="${escapeHtml(d.orderHistoryUrl)}"
         style="display:inline-block;padding:12px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
        주문내역 바로가기
      </a>
    </div>
    <p style="font-size:12px;color:#999;text-align:center;">본 메일은 발신 전용입니다.</p>
  </div>`;

  const text = [
    `[PromptPlace] 결제가 완료되었습니다`,
    `주문번호: ${d.orderId}`,
    `주문일시: ${formatKst(d.paidAt)}`,
    `프롬프트: ${d.promptTitle} / ${formatWon(d.promptPrice)} / 판매자 ${d.sellerName}`,
    `결제금액: ${formatWon(d.amount)}`,
    `결제수단: ${d.payMethod}`,
    `주문내역: ${d.orderHistoryUrl}`,
  ].join('\n');

  return {
    subject: `[PromptPlace] 결제 완료 안내 (주문번호 ${d.orderId})`,
    html,
    text,
  };
};
