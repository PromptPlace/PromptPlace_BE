export interface SendEmailDto {
  email: string;
}

export interface VerifyCodeDto {
  email: string;
  code: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
  consents: { type: string, isAgreed: boolean }[];
  tempToken: string;
}