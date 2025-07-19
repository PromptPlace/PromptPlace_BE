import AuthRepository from '../repositories/auth.repository';
import jwt from 'jsonwebtoken';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async generateTokens(user: any): Promise<Tokens> {
    const accessToken = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });
    const refreshToken = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET!, {
      expiresIn: '14d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    await AuthRepository.saveRefreshToken(refreshToken, user.user_id, expiresAt);

    return { accessToken, refreshToken };
  }

  async logout(userId: number): Promise<void> {
    await AuthRepository.deleteRefreshTokensByUserId(userId);
  }
}

export default new AuthService(); 