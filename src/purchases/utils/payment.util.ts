import { AppError } from "../../errors/AppError";

export function mapPgProvider(provider: string | undefined): 'kakaopay' | 'tosspay' {
  const src = (provider || '').toLowerCase();
  if (src.includes('kakao')) return 'kakaopay';
  if (src.includes('toss')) return 'tosspay';

  throw new AppError(`지원하지 않는 결제 수단입니다. (Provider: ${provider})`, 400, 'InvalidPaymentMethod');
}