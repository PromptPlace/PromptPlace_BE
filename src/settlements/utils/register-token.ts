import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppError } from '../../errors/AppError';
import redisClient from '../../config/redis';
import { SellerKind, BusinessKind } from '../dtos/settlement.dto';

const TOKEN_TTL_SECONDS = 5 * 60;
const ISSUER = 'promptplace';
const AUDIENCE = 'seller-register';

const getSecret = (): string => {
  const secret = process.env.REGISTER_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new AppError('서버 설정 오류입니다.', 500, 'InternalServerError');
  return secret;
};

export interface RegisterTokenPayload {
  userId: number;
  sellerType: SellerKind;
  businessType?: BusinessKind;
  name: string;
  birthDate?: string;
  businessNumber?: string;
  bank: string;
  accountNumber: string;
  holderName: string;
  billingTranId?: string | null;  // Payple 정산지급대행 빌링키 (#491). 발급 안 됐을 수 있음
  jti: string;
}

export const issueRegisterToken = (
  payload: Omit<RegisterTokenPayload, 'jti'>,
): { token: string; expiresIn: number } => {
  const jti = crypto.randomUUID();
  const fullPayload: RegisterTokenPayload = { ...payload, jti };
  const token = jwt.sign(fullPayload, getSecret(), {
    expiresIn: TOKEN_TTL_SECONDS,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  return { token, expiresIn: TOKEN_TTL_SECONDS };
};

export class InvalidRegisterTokenError extends AppError {
  constructor(message = '등록 토큰이 만료되었거나 유효하지 않습니다. 계좌 인증을 다시 진행해 주세요.') {
    super(message, 401, 'InvalidRegisterToken');
    this.name = 'InvalidRegisterTokenError';
  }
}

export class RegisterTokenAlreadyUsedError extends AppError {
  constructor(message = '이미 사용된 등록 토큰입니다. 계좌 인증을 다시 진행해 주세요.') {
    super(message, 409, 'RegisterTokenAlreadyUsed');
    this.name = 'RegisterTokenAlreadyUsedError';
  }
}

// 토큰 검증 + 1회용 소비 (Redis blacklist).
// 동일 jti가 두 번째로 들어오면 RegisterTokenAlreadyUsedError.
export const consumeRegisterToken = async (token: string): Promise<RegisterTokenPayload> => {
  let payload: RegisterTokenPayload;
  try {
    payload = jwt.verify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    }) as RegisterTokenPayload;
  } catch {
    throw new InvalidRegisterTokenError();
  }

  const blacklistKey = `register_token_used:${payload.jti}`;
  const setRes = await redisClient.set(blacklistKey, '1', {
    NX: true,
    EX: TOKEN_TTL_SECONDS + 60,
  });
  if (setRes !== 'OK') {
    throw new RegisterTokenAlreadyUsedError();
  }
  return payload;
};
