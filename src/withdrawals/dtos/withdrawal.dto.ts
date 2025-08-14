export interface WithdrawalRequestDto {
  amount: number;
}

export interface WithdrawalResponseDto {
  message: string;
  status: string;
  requested_at: string;
  statusCode: number;
}

export interface ErrorResponseDto {
  error: string;
  message: string;
  statusCode: number;
}