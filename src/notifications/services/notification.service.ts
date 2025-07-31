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

