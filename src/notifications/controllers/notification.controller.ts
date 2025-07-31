import { Request, Response } from 'express';
import {
    createSubscriptionService,
} from '../services/notification.service';


  export const toggleNotificationSubscription= async (
    req: Request,
    res: Response
  ): Promise<void> => {
    console.log('req.user:', req.user); 
    if (!req.user) {
      res.fail({
        statusCode: 401,
        error: 'no user',
        message: '로그인이 필요합니다.',
      });
      return;
    }

    try {
      const userId = (req.user as { user_id: number }).user_id;
      const prompterId = (req.params.prompterId)?.toString();

    if (!prompterId) {
      res.status(400).json({ message: 'prompterId가 없습니다.' });
      return;
    }

    const result = await createSubscriptionService(prompterId, userId);

    if(result.subscribed === true){
        res.success({
            message: '해당 프롬프터 알림을 등록했습니다.',
            ...result,
        });
    } else {
        res.success({
            message: '해당 프롬프터 알림을 취소했습니다.',
            ...result,
        });
    }
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '리뷰 작성 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500,
    });
  }
};