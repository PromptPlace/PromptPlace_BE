export interface VerifyAccountRequestDto {
  name: string;
  bank: string;
  accountNumber: string;
  holderName: string;
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

export interface RegisterIndividualSellerRequestDto {
  name: string;
  bank: string;
  accountNumber: string;
  holderName: string;
  isTermsAgreed: boolean;
}
