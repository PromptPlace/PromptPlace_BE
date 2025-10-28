import { Request, Response } from "express";
import { passwordService } from "../services/password.service";

export const passwordController = {
    async sendCode(req: Request, res: Response) {
        try {
            const { email } = req.body;
            await passwordService.sendResetCode({ email });
            res.success({ message: "인증번호가 발송되었습니다." });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).fail({ message: error.message });
            }
            res.status(500).fail({ message: "비밀번호 찾기 요청 중 오류가 발생했습니다." });
        }
    },

    async verifyCode(req: Request, res: Response) {
        try {
            const { email, code } = req.body;
            const tempToken = await passwordService.verifyResetCode({ email, code }); 
            
            res.success({ 
                message: "인증이 완료되었습니다. 새 비밀번호를 설정해주세요.",
                tempToken: tempToken 
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).fail({ message: error.message });
            }
            res.status(500).fail({ message: "인증번호 확인 중 오류가 발생했습니다." });
        }
    },

    async resetPassword(req: Request, res: Response) {
        try {
            const { email, newPassword, confirmPassword, tempToken } = req.body;
            
            if (newPassword !== confirmPassword) {
             throw new Error("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            }
            
            await passwordService.resetPassword({ email, newPassword, tempToken });
            
            res.success({ message: "비밀번호가 성공적으로 변경되었습니다." });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).fail({ message: error.message });
            }
            res.status(500).fail({ message: "비밀번호 재설정 중 오류가 발생했습니다." });
        }
    }
};