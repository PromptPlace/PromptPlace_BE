export type SellerKind = 'INDIVIDUAL' | 'BUSINESS';
export type BusinessKind = 'PERSONAL' | 'CORPORATE';

// 계좌 인증 요청 — 개인 / 개인사업자 / 법인사업자를 sellerType + businessType으로 구분
export interface VerifyAccountRequestDto {
  sellerType: SellerKind;
  businessType?: BusinessKind;        // sellerType === 'BUSINESS'일 때 필수
  name: string;                       // 실명(INDIVIDUAL) / 대표자명(BUSINESS)
  birthDate?: string;                 // YYMMDD 6자리. INDIVIDUAL / BUSINESS+PERSONAL 필수
  businessNumber?: string;            // 10자리 숫자. BUSINESS+CORPORATE 필수
  bank: string;                       // Payple bank_code_std 3자리
  accountNumber: string;
  holderName: string;                 // 법인은 법인명, 그 외엔 실명/대표자명과 일치
}

export interface VerifyAccountResponseDto {
  message: string;
  registerToken: string;
  expiresIn: number;
  statusCode: number;
}

// 등록 요청 — 인증 결과는 registerToken(JWT)에 인코딩됨
export interface RegisterIndividualSellerRequestDto {
  registerToken: string;
  isTermsAgreed: boolean;
}

export interface RegisterBusinessSellerRequestDto {
  registerToken: string;
  companyName: string;
  businessLicenseUrl: string;         // S3 업로드 응답으로 받은 URL (Phase 9에서 key로 전환 예정)
  isTermsAgreed: boolean;
}

export interface AccountDataDto {
  bank: string;
  accountNumber: string;
  holderName: string;
}

export interface ViewAccountResponseDto {
  message: string;
  data: AccountDataDto;
  statusCode: number;
}

export interface UpdateAccountRequestDto {
  name: string;
  bank: string;
  accountNumber: string;
  holderName: string;
}
