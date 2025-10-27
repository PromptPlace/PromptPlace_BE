import bcrypt from "bcryptjs";
import { signupRepository } from "../repositories/signup.repository";
import { SendEmailDto, VerifyCodeDto, RegisterUserDto } from "../dtos/signup.dto";
import { sendVerificationEmail } from "../../utils/email";

const emailCodeMap = new Map<string, string>(); // in-memory, 추후 Redis로 대체 가능

export const signupService = {
  async sendVerificationCode({ email }: SendEmailDto) {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리
    emailCodeMap.set(email, code);

    await sendVerificationEmail(email, code); // 이메일 발송

    return true;
  },

  async verifyCode({ email, code }: VerifyCodeDto) {
    const savedCode = emailCodeMap.get(email);
    if (!savedCode || savedCode !== code) {
      throw new Error("인증번호가 일치하지 않습니다.");
    }
    return true;
  },

  async registerUser({ email, password }: RegisterUserDto) {
    const isValid = validatePasswordPolicy(password);
    if (!isValid) throw new Error("비밀번호 정책을 만족하지 않습니다.");

    const hashed = await bcrypt.hash(password, 10);
    return signupRepository.createUser(email, hashed);
  },
};

// 비밀번호 정책: 영문 소문자 + 숫자 + 특수문자 + 8자 이상
function validatePasswordPolicy(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}