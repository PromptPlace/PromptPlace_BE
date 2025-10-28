import bcrypt from "bcryptjs";
import AuthService from "../../auth/services/auth.service";
import { signinRepository } from "../repositories/signin.repository";
import { SignInDto, InitialSetupDto } from "../dtos/signin.dto";

export const signinService = {
    async login({ email, password }: SignInDto) {
        const user = await signinRepository.findUserByEmail(email);

        if (!user || user.status === false) {
            throw new Error("가입되지 않은 이메일이거나 비활성 상태의 계정입니다.");
        }

        if (user.password === null) {
        throw new Error("비밀번호 정보가 없습니다. 소셜 로그인을 이용해주세요.");
    }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("비밀번호가 일치하지 않습니다.");
        }

        const tokens = await AuthService.generateTokens(user);
       
        return {
            ...tokens,
            user: {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
                isInitialSetupRequired: user.is_initial_setup_required, 
            }
        };
    },

    async completeInitialSetup({ userId, nickname, intro }: InitialSetupDto) {
        const updatedUser = await signinRepository.completeInitialSetup(userId, nickname, intro);

        return {
            user_id: updatedUser.user_id,
            nickname: updatedUser.nickname,
        };
    },
};