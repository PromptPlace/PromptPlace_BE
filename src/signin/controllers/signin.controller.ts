import { Request, Response } from "express";
import { signinService } from "../services/signin.service";

export const signinController = {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await signinService.login({ email, password });

            res.success({ 
                message: "로그인 성공", 
                data: result 
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(401).fail({ message: error.message });
            }
            res.status(500).fail({ message: "로그인 처리 중 알 수 없는 오류가 발생했습니다." });
        }
    },

    async initialSetup(req: Request, res: Response) {
        try {
            const userId = (req as any).user.user_id; 
            const { nickname, intro } = req.body;

            const updatedUser = await signinService.completeInitialSetup({ 
                userId, 
                nickname, 
                intro 
            });

            res.success({ 
                message: "최초 설정이 완료되었습니다.", 
                data: updatedUser 
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).fail({ message: error.message });
            }
            res.status(500).fail({ message: "초기 설정 중 알 수 없는 오류가 발생했습니다." });
        }
    }
};