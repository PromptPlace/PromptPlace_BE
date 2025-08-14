export interface WithdrawalAvailableResponseDto {
  message: string;
  available_amount: number;
  statusCode: number;
}

export interface ErrorResponseDto {
  error: string;
  message: string;
  statusCode: number;
}