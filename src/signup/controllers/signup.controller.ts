import { Request, Response } from "express";
import { signupService } from "../services/signup.service";

export const signupController = {
  async sendCode(req: Request, res: Response) {
        try {
            const { email } = req.body;
            await signupService.sendVerificationCode({ email });
            res.success({ message: "인증번호가 발송되었습니다." });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).fail({ message: error.message });
            }
            res.status(500).fail({ message: "인증번호 발송 중 알 수 없는 오류가 발생했습니다." });
        }
    },

  async verifyCode(req: Request, res: Response) {
        try {
            const { email, code } = req.body;
            const tempToken = await signupService.verifyCode({ email, code }); 
            
            res.success({ 
                message: "인증이 완료되었습니다. 약관 동의 화면으로 이동합니다.",
                tempToken: tempToken 
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).fail({ message: error.message });
            }
            res.status(500).fail({ message: "인증 중 알 수 없는 오류가 발생했습니다." });
        }
    },

  async register(req: Request, res: Response) {
        const { email, password, consents, tempToken } = req.body; 
        
        try {
            const user = await signupService.registerUser({ 
                email, 
                password, 
                consents,
                tempToken
            });
            
            res.status(201).success({ 
                message: "회원가입이 완료되었습니다.", 
                user 
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).fail({ message: error.message });
            }
            res.status(500).fail({ message: "회원가입 중 알 수 없는 오류가 발생했습니다." });
        }
    },
};