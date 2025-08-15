import {
    mapToSubscribeResponse,
    CreateNotificationParams,
    UserNotificationListDTO,
    prompterNotificationStatusDto
} from '../dtos/notification.dto';

import {
    findFollowing,
    findSubscription,
    createSubscription,
    deleteSubscription,
    createNotification,
    findUserByUserId,
    findUsersSubscribedToPrompter,
    findNotificationsByUserId,
} from '../repositories/notification.repository';

import { NotificationType } from '@prisma/client';

import eventBus from '../../config/eventBus';



export const createSubscriptionService = async (
    rawPrompterId: string,
    userId: number
) => {
    if (!rawPrompterId || isNaN(Number(rawPrompterId))) {
        throw new Error('유효하지 않은 prompterId입니다.');
    }

    const prompterId = Number(rawPrompterId);

    // 자기 자신 알림 설정 방지
    if(userId === prompterId){
        throw new Error('자기 자신은 알림을 받을 수 없습니다.');
    }


    // 기존 알림 설정 확인
    const existingSubscription = await findSubscription(userId, prompterId);
    let subscribed: boolean;

    // 이미 알림 설정 -> 알림 설정 취소
    if(existingSubscription){ 
        await deleteSubscription(userId, prompterId);
        subscribed = false; 
    } 

    // 알림 설정 하지 않은 경우
    else { 
        // 팔로우 여부 확인
        const isFollowing = await findFollowing(userId, prompterId);
        if (!isFollowing) { // 팔로우하지 않은 경우 
            throw new Error('프롬프터를 팔로우한 사용자만 알림 등록이 가능합니다.');
        } 
        // 알림 등록
        await createSubscription(userId, prompterId);
        subscribed = true; 
    }

    return mapToSubscribeResponse(userId, prompterId, subscribed) // 객체로 반환
}

// 알림 접수(공통)
export const createNotificationService = async (
  params: CreateNotificationParams
) => {
  return createNotification(params);
};

// 신고 접수 알림 
export const createReportNotification = async (userId: number) => {
  return createNotificationService({
    userId,
    type: NotificationType.REPORT,
    content: '신고가 접수되었습니다.',
    linkUrl: null,
    actorId: null,
  });
};

// 공지사항 등록 알림
export const createAnnouncementNotification = async (
  announcementId: number
) => {
  await createNotificationService({
    userId: null, // 모든 사용자 대상이므로 null
    type: NotificationType.ANNOUNCEMENT,
    content: '새로운 공지사항이 등록되었습니다.',
    linkUrl: `/announcements/${announcementId}`,
    actorId: null,
  });
};

// 새로운 팔로워 알림
export const createFollowNotification = async (
  followerId: number,
  followingId: number
) => {
  
  // 팔로워 Id로 팔로워 닉네임 조회
  const user = await findUserByUserId(followerId);
  if (!user) {
    throw new Error('팔로워 정보를 찾을 수 없습니다.');
  } 
  const followerNickname = user.nickname; 

  // 팔로워 알림 정보를 알림db에 저장
  await createNotificationService({
    userId: followingId,
    type: NotificationType.FOLLOW,
    content: `‘${followerNickname}’님이 회원님을 팔로우합니다.`,
    linkUrl: `/profile/${followerId}`,
    actorId: followerId,
  });
};

// 새로운 문의 등록 알림
export const createInquiryNotification = async (
  receiverId: number,
  senderId: number
) => {
  await createNotificationService({
    userId: receiverId, 
    type: NotificationType.INQUIRY_REPLY,
    content: '프롬프트에 새로운 문의가 도착했습니다.',
    linkUrl: `/inquiries/${receiverId}`,
    actorId: senderId,
  });
};

// 새로운 프롬프트 업로드 알림
export const createPromptNotification = async (
  prompterId: number,
  promptId: number
) => {
  // 프롬프터를 알림설정한 사용자 아이디 목록 추출
  const subscribedUserIds: number[] = await findUsersSubscribedToPrompter(prompterId);

  // 프롬프터 Id로 프롬프터 닉네임 조회
  const prompter = await findUserByUserId(prompterId);
  if (!prompter) {
    throw new Error('프롬프터 정보를 찾을 수 없습니다.');
  } 
  const prompterNickname = prompter.nickname; 


  await Promise.all(
    subscribedUserIds.map((userId) => 
      createNotificationService({
        userId,
        type: NotificationType.NEW_PROMPT,
        content: `‘${prompterNickname}’님이 새 프롬프트를 업로드하셨습니다.`,
        linkUrl: `/prompt/${promptId}`,
        actorId: prompterId,
      })
    )
  );
};

// 알림 목록 조회
export const findUserNotificationsService = async (
  userId: number,
  rawCursor?: string,
  rawLimit?: string
) => {
    const cursor = rawCursor ? parseInt(rawCursor, 10) : undefined;
    const limit = rawLimit ? parseInt(rawLimit, 10) : 10;
  
    if (cursor !== undefined && isNaN(cursor)) throw new Error('cursor값이 적절하지 않습니다');
    if (isNaN(limit)) throw new Error('limit값이 적절하지 않습니다');
  
    const rawNotifications = await findNotificationsByUserId(userId, cursor, limit);
    return UserNotificationListDTO(rawNotifications, limit);
}

// 프롬프터 알림 설정 여부 조회
export const getPrompterNotificationStatusService = async (
  userId: number,
  rawPrompterId: string
) => {
  if (!rawPrompterId || isNaN(Number(rawPrompterId))) {
    throw new Error('유효하지 않은 prompterId입니다.');
  }
  const prompterId = Number(rawPrompterId);

  if (userId === prompterId) {
    // 자기 자신은 구독 불가지만, 상태 조회는 false로 응답
    return { subscribed: false };
  }

  const subscription = await findSubscription(userId, prompterId);
  let existing: boolean = false;
  if (subscription) // 구독중이라면 true 반환 
    existing = true;

  return await prompterNotificationStatusDto(userId, prompterId, existing);
};