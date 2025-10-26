import { Request, Response } from 'express';
import {
    createSubscriptionService,
    findUserNotificationsService,
    getPrompterNotificationStatusService,
    getNotificationHasNewStatusService,
} from '../services/notification.service';


  export const toggleNotificationSubscription= async (
    req: Request,
    res: Response
  ): Promise<void> => {
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
            ...result,
        }, 
        "프롬프터 알림이 성공적으로 등록되었습니다."
      );
    } else {
        res.success({
            ...result,
        },
        "해당 프롬프터 알림이 성공적으로 취소되었습니다."
      );
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

// 알림 목록 조회
export const getNotificationList = async (
  req: Request,
  res: Response
): Promise<void> => {
  if(!req.user) {
    res.fail({
      statusCode: 401,
      error: 'no user',
      message: '로그인이 필요합니다.',
    });
    return;
  }
  try{
    const userId = (req.user as { user_id: number }).user_id;
    const cursor = req.query.cursor as string | undefined;
    const limit = req.query.limit as string | undefined;
    
    const notifications = await findUserNotificationsService(userId, cursor, limit);
    
    res.success({
      ...notifications
    },
     "내 알림 목록을 성공적으로 불러왔습니다."
  )
  } catch (err: any){
    res.fail({
      error: err.name || 'InternalServerError',
      message: err.message || '사용자 알림 목록을 불러오는 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500,
    });
  }
};

// 프롬프터 알림 설정 여부 조회
export const getPrompterNotificationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const subscribed = await getPrompterNotificationStatusService(
      userId,
      prompterId
    );

    res.success(
      {
        ...subscribed,
      },
      '프롬프터 알림 설정 여부를 성공적으로 조회했습니다.'
    );
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.name || 'InternalServerError',
      message:
        err.message ||
        '프롬프터 알림 설정 여부를 조회하는 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500,
    });
  }
};

// 사용자 새 알림 여부 조회
export const getNotificationHasNewStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    const hasNew = await getNotificationHasNewStatusService(userId);

    res.success(
      {
        ...hasNew,
      },
      '사용자의 새 알림 상태를 성공적으로 조회했습니다.'
    );
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.name || 'InternalServerError',
      message:
        err.message ||
        '사용자의 새 알림 상태를 조회하는 중 오류가 발생했습니다.',
      statusCode: err.statusCode || 500,
    });
  }
}