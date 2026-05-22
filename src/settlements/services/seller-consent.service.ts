import prisma from '../../config/prisma';

export const SELLER_REGISTRATION_CONSENT_TYPE = 'SELLER_REGISTRATION_PERSONAL_INFO';

// 판매자 등록 개인정보 수집 동의를 verify-account 호출 시점에 선기록.
// 등록(register/*)이 최종 실패하더라도 동의 이력은 보존되어야 PIPA 증빙 가능.
export const recordSellerRegistrationConsent = async (params: {
  userId: number;
}): Promise<void> => {
  const { userId } = params;
  await prisma.userConsent.upsert({
    where: { user_id_consent_type: { user_id: userId, consent_type: SELLER_REGISTRATION_CONSENT_TYPE } },
    update: { is_agreed: true },
    create: { user_id: userId, consent_type: SELLER_REGISTRATION_CONSENT_TYPE, is_agreed: true },
  });
};
