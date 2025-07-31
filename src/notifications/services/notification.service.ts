import {
    mapToSubscribeResponse
} from '../dtos/notification.dto';

import {
    findFollowing,
    findSubscription,
    createSubscription,
    deleteSubscription,
} from '../repositories/notification.repository';


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

    // 팔로우 여부 확인
    const isFollowing = await findFollowing(userId, prompterId);
    if (!isFollowing) {
        throw new Error('프롬프터를 팔로우한 사용자만 알림 설정이 가능합니다.');
    }

    // 기존 알림 설정 확인
    const existingSubscription = await findSubscription(userId, prompterId);

    let subscribed: boolean;
    let subscription;
    if(existingSubscription){
        // 이미 알림 설정 -> 알림 설정 취소
        subscription = await deleteSubscription(userId, prompterId);
        subscribed = false; // 알림 설정 취소하기
    } else {
        // 알림 설정 하지 않은 경우 -> 알림 설정 등록
        subscription = await createSubscription(userId, prompterId);
        subscribed = true; // 알림 설정 등록하기
    }

    return mapToSubscribeResponse(userId, prompterId, subscribed) // 객체로 반환
}

