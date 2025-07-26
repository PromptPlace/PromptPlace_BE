import { Request, Response, NextFunction } from 'express';
import { MemberService } from '../services/member.service';
import { MemberRepository } from '../repositories/member.repository';

export class MemberController {
  private memberService: MemberService;

  constructor() {
    this.memberService = new MemberService(new MemberRepository());
  }

  public async getFollowers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const memberId = parseInt(req.params.memberId, 10);
      const followers = await this.memberService.getFollowers(memberId);
      res.status(200).json({
        message: '팔로워 목록 조회 완료',
        data: followers,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }

  public async followUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const followerId = (req.user as any).user_id;
      const followingId = parseInt(req.params.memberId, 10);
      await this.memberService.followUser(followerId, followingId);
      res.status(201).json({ message: '팔로우 성공' });
    } catch (error) {
      next(error);
    }
  }

  public async unfollowUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const followerId = (req.user as any).user_id;
      const followingId = parseInt(req.params.memberId, 10);
      await this.memberService.unfollowUser(followerId, followingId);
      res.status(200).json({ message: '언팔로우 성공' });
    } catch (error) {
      next(error);
    }
  }

  public async getFollowings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const memberId = parseInt(req.params.memberId, 10);
      const followings = await this.memberService.getFollowings(memberId);
      res.status(200).json({
        message: '팔로잉 목록 조회 완료',
        data: followings,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }
} 