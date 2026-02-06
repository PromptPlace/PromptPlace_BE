import { PaymentMethod, PaymentProvider } from '@prisma/client'; 
import { AppError } from '../../errors/AppError';

// 1. 결제 수단 매핑
export function normalizePaymentMethod(input: string): PaymentMethod {
  const code = input.toUpperCase().replace(/\s+/g, ''); 

  if (code === 'CARD' || code.includes('카드')) return 'CARD';
  if (code === 'VIRTUAL_ACCOUNT' || code.includes('가상계좌')) return 'VIRTUAL_ACCOUNT';
  if (code === 'TRANSFER' || code.includes('계좌이체')) return 'TRANSFER';
  if (code === 'MOBILE' || code.includes('MOBILE_PHONE') || code.includes('휴대폰')) return 'MOBILE';
  if (code === 'EASY_PAY' || code.includes('간편결제')) return 'EASY_PAY';

  throw new AppError(`지원하지 않는 결제 수단입니다: ${input}`, 400, 'UnsupportedPaymentMethod');
}

// 2. 제공자 (Provider) 매핑
export function normalizePaymentProvider(input: string, method: PaymentMethod): PaymentProvider {
  const code = (input || '').toUpperCase().replace(/\s+/g, '');

  if (code.includes('KAKAO') || code.includes('카카오')) {
    return 'KAKAOPAY';
  }
  if (code.includes('TOSSPAY') || code.includes('토스')) {
    return 'TOSSPAY';
  }
  if (
    code.includes('NAVER') || code.includes('네이버') ||
    code.includes('SAMSUNG') || code.includes('삼성') ||
    code.includes('APPLE') || code.includes('애플') ||
    code.includes('PAYCO') || code.includes('페이코') ||
    code.includes('LPAY') || code.includes('엘페이') ||
    code.includes('SSG') || code.includes('에스에스지') ||
    code.includes('PINPAY') || code.includes('핀페이')
  ) {
    throw new AppError(`현재 지원하지 않는 간편결제사입니다: ${input}`, 400, 'ProviderNotSupported');
  }
  if (method !== 'EASY_PAY') {
      return 'TOSSPAYMENTS';
  }
  throw new AppError(`식별할 수 없는 결제 제공자입니다: ${input}`, 400, 'UnknownPaymentProvider');
}