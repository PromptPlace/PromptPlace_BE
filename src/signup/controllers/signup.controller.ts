import { Request, Response } from "express";
import { signupService } from "../services/signup.service";

export const signupController = {
  async sendCode(req: Request, res: Response) {
    const { email } = req.body;
    await signupService.sendVerificationCode({ email });
    res.success({ message: "인증번호가 발송되었습니다." });
  },

  async verifyCode(req: Request, res: Response) {
    const { email, code } = req.body;
    await signupService.verifyCode({ email, code });
    res.success({ message: "인증이 완료되었습니다." });
  },

  async register(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await signupService.registerUser({ email, password });
    res.status(201).success({ message: "회원가입이 완료되었습니다.", user });
  },
};