import bcrypt from "bcryptjs";
import { signupRepository } from "../repositories/signup.repository";
import { SendEmailDto, VerifyCodeDto, RegisterUserDto } from "../dtos/signup.dto";
import { sendVerificationEmail } from "../../utils/email";
import { v4 as uuidv4 } from 'uuid';

const emailCodeMap = new Map<string, string>();
const emailTempTokenMap = new Map<string, { token: string, expiry: number }>();

// 비밀번호 정책: 영문 소문자 + 숫자 + 특수문자 + 8자 이상
function validatePasswordPolicy(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

function generateTempToken(email: string): string {
    const token = uuidv4();
    const expiryTime = Date.now() + (10 * 60 * 1000); 
    emailTempTokenMap.set(email, { token, expiry: expiryTime });
    
    return token;
}

export const signupService = {
  async sendVerificationCode({ email }: SendEmailDto) {
    const existingUser = await signupRepository.findUserByEmail(email);
    if (existingUser) throw new Error("이미 가입된 이메일입니다.");

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리
    emailCodeMap.set(email, code);

    await sendVerificationEmail(email, code); 

    return true;
  },

  async verifyCode({ email, code }: VerifyCodeDto) {
    const savedCode = emailCodeMap.get(email);
    if (!savedCode || savedCode !== code) {
      throw new Error("인증번호가 일치하지 않습니다.");
    }

    emailCodeMap.delete(email); 
    const tempToken = generateTempToken(email); 
    
    return tempToken;
  },

  async registerUser({ email, password, consents, tempToken }: RegisterUserDto) {
    const tokenData = emailTempTokenMap.get(email);

    if (!tokenData || tokenData.token !== tempToken || tokenData.expiry < Date.now()) {
     
      throw new Error("유효하지 않거나 만료된 회원가입 토큰입니다. 인증을 다시 진행해주세요.");
    }
    
    emailTempTokenMap.delete(email);

    const REQUIRED_CONSENTS = [
        'SERVICE_TERMS_REQUIRED',
        'PRIVACY_POLICY_REQUIRED',
        'OVER_14_REQUIRED',
    ];

    REQUIRED_CONSENTS.forEach(requiredType => {
        const consent = consents.find(c => c.type === requiredType);
        if (!consent || !consent.isAgreed) {
            throw new Error(`필수 약관에 모두 동의해야 합니다.`);
        }
    });

    const isValid = validatePasswordPolicy(password);
    if (!isValid) throw new Error("비밀번호 정책을 만족하지 않습니다.");

    const hashed = await bcrypt.hash(password, 10);
    return signupRepository.createUser(email, hashed, consents);
  },
};