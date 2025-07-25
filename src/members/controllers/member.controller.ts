import { Request, Response, NextFunction } from 'express';
import { MemberService } from '../services/member.service';
import { CreateSnsDto } from '../dtos/create-sns.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AppError } from '../../errors/AppError';

export class MemberController {
  private memberService: MemberService;

  constructor() {
    this.memberService = new MemberService();
  }

  public async createSns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as any;
      const createSnsDto = plainToInstance(CreateSnsDto, req.body);
      const errors = await validate(createSnsDto);

      if (errors.length > 0) {
        const message = errors.map((error) => Object.values(error.constraints || {})).join(', ');
        throw new AppError('BadRequest', message, 400);
      }

      const sns = await this.memberService.createSns(user.user_id, createSnsDto);

      res.status(201).json({
        message: 'SNS가 성공적으로 작성되었습니다.',
        sns_id: sns.sns_id,
        url: sns.url,
        description: sns.description,
        created_at: sns.created_at,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  }
} 