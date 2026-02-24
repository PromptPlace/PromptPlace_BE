import { PaymentMethod, PaymentProvider } from '@prisma/client'; 
import { AppError } from '../../errors/AppError';

// 결제 수단 매핑
export function normalizePaymentMethod(input: string): PaymentMethod {
  const code = input.toUpperCase().replace(/\s+/g, ''); 

  if (code === 'PaymentMethodCard') return 'CARD';
  if (code === 'PaymentMethodVirtualAccount') return 'VIRTUAL_ACCOUNT';
  if (code === 'PaymentMethodEasyPay') return 'TRANSFER';
  if (code === 'PaymentMethodTransfer') return 'MOBILE';
  if (code === 'PaymentMethodMobile') return 'EASY_PAY';

  throw new AppError(`지원하지 않는 결제 수단입니다: ${input}`, 400, 'UnsupportedPaymentMethod');
}