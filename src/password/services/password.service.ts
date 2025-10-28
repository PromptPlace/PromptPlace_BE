import bcrypt from "bcryptjs";
import { SendResetCodeDto, VerifyResetCodeDto, ResetPasswordDto } from "../dtos/password.dto";
import { passwordRepository } from "../repositories/password.repository";
import { sendVerificationEmail } from "../../utils/email"; 
import { v4 as uuidv4 } from 'uuid';

const resetCodeMap = new Map<string, string>(); 
const resetTokenMap = new Map<string, { token: string, expiry: number }>(); 

// 비밀번호 정책: 영어(소문자), 숫자, 특수문자 조합, 8자 이상
function validatePasswordPolicy(password: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
}

function generateTempToken(email: string): string {
    const token = uuidv4();
    const expiryTime = Date.now() + (10 * 60 * 1000); // 10분 유효 시간
    resetTokenMap.set(email, { token, expiry: expiryTime });
    return token;
}

export const passwordService = {
    // 1. 인증번호 발송
    async sendResetCode({ email }: SendResetCodeDto) {
        const user = await passwordRepository.findUserByEmail(email);
        if (!user) {
            // 보안을 위해 이메일 존재 유무를 외부에 노출하지 않지만, 여기서는 편의상 에러 발생
            throw new Error("가입된 이메일 주소가 아닙니다."); 
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        resetCodeMap.set(email, code);

        await sendVerificationEmail(email, code); 
        return true;
    },

    async verifyResetCode({ email, code }: VerifyResetCodeDto): Promise<string> {
        const savedCode = resetCodeMap.get(email);
        if (!savedCode || savedCode !== code) {
            throw new Error("인증번호가 일치하지 않습니다.");
        }
        
        resetCodeMap.delete(email); 
        const tempToken = generateTempToken(email);
        
        return tempToken;
    },

    async resetPassword({ email, newPassword, tempToken }: ResetPasswordDto) {
        const tokenData = resetTokenMap.get(email);
        if (!tokenData || tokenData.token !== tempToken || tokenData.expiry < Date.now()) {
            throw new Error("유효하지 않거나 만료된 토큰입니다. 인증을 다시 진행해주세요.");
        }
        resetTokenMap.delete(email); 

        const cleanPassword = newPassword.toLowerCase();
        
        if (!validatePasswordPolicy(cleanPassword)) {
            throw new Error("비밀번호는 영문(소문자), 숫자, 특수문자 조합으로 8자 이상이어야 합니다.");
        }

        const user = await passwordRepository.findUserByEmail(email);
        if (!user) {
            throw new Error("사용자 정보를 찾을 수 없습니다."); 
        }

        const hashed = await bcrypt.hash(cleanPassword, 10);
        await passwordRepository.updatePassword(user.user_id, hashed);

        return true;
    },
};