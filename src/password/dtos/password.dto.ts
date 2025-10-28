export interface SendResetCodeDto {
    email: string;
}

export interface VerifyResetCodeDto {
    email: string;
    code: string;
}

export interface ResetPasswordDto {
    email: string;
    newPassword: string;
    tempToken: string;
}