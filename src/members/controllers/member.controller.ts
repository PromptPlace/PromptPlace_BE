import { Request, Response, NextFunction } from 'express';
import { MemberService } from '../services/member.service';
import { CreateSnsDto } from '../dtos/create-sns.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AppError } from '../../errors/AppError';
import { UpdateSnsDto } from '../dtos/update-sns.dto';

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

  public async updateSns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as any;
      const snsId = parseInt(req.params.snsId, 10);

      if (isNaN(snsId)) {
        throw new AppError('BadRequest', '유효하지 않은 SNS ID입니다.', 400);
      }

      const updateSnsDto = plainToInstance(UpdateSnsDto, req.body);
      const errors = await validate(updateSnsDto);

      if (errors.length > 0) {
        const message = errors.map((error) => Object.values(error.constraints || {})).join(', ');
        throw new AppError('BadRequest', message, 400);
      }

      const updatedSns = await this.memberService.updateSns(user.user_id, snsId, updateSnsDto);

      res.status(200).json({
        message: 'SNS가 성공적으로 수정되었습니다.',
        sns_id: updatedSns.sns_id,
        url: updatedSns.url,
        description: updatedSns.description,
        updated_at: updatedSns.updated_at,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteSns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as any;
      const snsId = parseInt(req.params.snsId, 10);

      if (isNaN(snsId)) {
        throw new AppError('BadRequest', '유효하지 않은 SNS ID입니다.', 400);
      }

      await this.memberService.deleteSns(user.user_id, snsId);

      res.status(200).json({
        message: 'SNS 정보가 삭제되었습니다.',
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }
} 