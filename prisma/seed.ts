import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 사용자 3명 존재한다고 가정
  const userIds = [1, 2, 3];

  // 1. prompt 테이블
  const prompts = [];
  for (let i=0; i<5; i++){
    const prompt = await prisma.prompt.create({
      data: {
        user_id: userIds[i % userIds.length],
        title: `프롬프트 ${i+1}`,
        prompt: `프롬프트 입력 ${i+1}`,
        prompt_result: `프롬프트 결과 ${i+1}`,
        has_image: i%2 === 0,
        description: `설명 ${i + 1}`,
        usage_guide: `사용 가이드 ${i + 1}`,
        price: i * 1000,
        is_free: i % 2 === 0,
        download_url: `https://example.com/download/prompt-${i + 1}`,
        downloads: i * 10,
        views: i * 100,
        likes: i * 5,
        review_counts: 0,
        rating_avg: 0.0,
      },
    });
    prompts.push(prompt);
  }

  // 2. Model 
  const models = [];
  for (let i=0; i<5; i++){
    const model = await prisma.model.create({
      data: {
        name: `모델 이름 ${i+1}`,
      },
    });
    models.push(model);
  }

  // 3. promptModel
  const promptModels = [];
  for (let i=0; i<5; i++){
    const promptModel = await prisma.promptModel.create({
      data: {
        prompt_id: prompts[i].prompt_id,
        model_id: models[i].model_id,
      },
    });
  }

  // 4. tag
  const tags = [];
  for (let i=0; i<5; i++){
    const tag = await prisma.tag.create({
      data: {
        name: `태그 ${i+1}`,
      },
    });
    tags.push(tag);
  }

  // 5. promptTag
  const promptTags = [];
  for (let i=0; i<5; i++){
    const promptTag = await prisma.promptTag.create({
      data: {
        prompt_id: prompts[i].prompt_id,
        tag_id: tags[i].tag_id,
      },
    });
    promptTags.push(promptTag);
  }

  // 6. promptImage
  const promptImages = [];
  for (let i=0; i<5; i++){
    const promptImage = await prisma.promptImage.create({
      data: {
        prompt_id: prompts[i].prompt_id,
        image_url: `https://example.com/image${i+1}.jpg`,
        order_index: i
      },
    });
    promptImages.push(promptImage);
  }

  // 7. message
  const messages = [];
  for (let i=0; i<5; i++){
    const message = await prisma.message.create({
      data: {
       sender_id: userIds[i % userIds.length],
       receiver_id: userIds[(i+1) % userIds.length],
       title: `메시지 제목 ${i+1}`,
       body: `메시지 내용 ${i+1}`,
       is_read: i % 2 === 0,
       is_deleted: i % 2 === 0,
      },
    });
    messages.push(message);
  }

  // 8. userSNS
  const userSNSList = [];
  for (let i=0; i<5; i++){
    const userSNS = await prisma.userSNS.create({
      data: {
        user_id: userIds[i % userIds.length],
        url: `https://example.com/sns${i+1}`,
        description: `SNS 설명 ${i+1}`,
      },
    });
    userSNSList.push(userSNS);
  }

  

  // 9. userProfile->이미 존재하므로 생략

  // 10. following
  const followings = [];
  for (let i=0; i<5; i++){
    const following = await prisma.following.create({
      data : {
        follower_id: userIds[i % userIds.length],
        following_id: userIds[(i + 1) % userIds.length],
      },
    });
    followings.push(following);
  }

  // 11. inquery
  const inquiries = [];
  for (let i=0; i<5; i++){
    const inquiry = await prisma.inquiry.create({
      data: {
        sender_id: userIds[i % userIds.length],
        receiver_id: userIds[(i + 1) % userIds.length],
        type: i % 2 === 0 ? 'buyer' : 'non_buyer',
        status: (i+1) % 2 === 0 ? 'waiting' : 'read',
        title: `문의 제목 ${i+1}`,
        content: `문의 내용 ${i+1}`,
      },
    });
    inquiries.push(inquiry);
  }

  // 12. inquiryReply
  const inquiryReplies = [];
  for (let i=0; i<5; i++){
    const inquiryReply = await prisma.inquiryReply.create({
      data: {
        inquiry_id: inquiries[i].inquiry_id,
        receiver_id: userIds[i % userIds.length],
        content: `답변 내용 ${i+1}`,
      },
    });
    inquiryReplies.push(inquiryReply);
  }
  // 13. announcement
  const announcement = [];
  for (let i=0; i<5; i++){
    const notice = await prisma.announcement.create({
      data: {
        writer_id: userIds[i % userIds.length],
        title: `공지 제목 ${i+1}`,
        content: `공지 내용 ${i+1}`,
        is_visible: i % 2 === 0,
        updated_at: new Date(),
        file_url: `https://example.com/announcement${i+1}.pdf`
      },
    });
    announcement.push(notice);
  }

  // 12. Tip
  const tips = [];
  for (let i = 0; i < 5; i++) {
    const tip = await prisma.tip.create({
      data: {
        writer_id: userIds[i % userIds.length],
        title: `꿀팁 제목 ${i + 1}`,
        content: `꿀팁 내용 ${i + 1}`,
        is_visible: i % 2 === 0, // true, false 반복
      },
    });
    tips.push(tip);
  }

  // 13. notification(알림)
  const notifications = [];
  for (let i = 0; i < 5; i++) {
    const notification = await prisma.notification.create({
      data: {
        user_id: userIds[i % userIds.length],
        content: `알림 내용 ${i + 1}`,
      },
    });
    notifications.push(notification);
  }

  // 14. review (리뷰)
  const reviews = [];
  for (let i = 0; i < 5; i++) {
    const review = await prisma.review.create({
      data: {
        user_id: userIds[i % userIds.length],
        prompt_id: prompts[i].prompt_id,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 ~ 5.0
        content: `리뷰 내용 ${i + 1}`,
      },
    });
    reviews.push(review);
  }

  // 15. reportCategory
  const reportCategories = [];
  for (let i = 0; i < 4; i++) {
    const reportCategory = await prisma.reportCategory.create({
      data: {
        name: `신고 카테고리 ${i + 1}`,
      },
    });
    reportCategories.push(reportCategory);
  }

  // 16. reportCategoryDetail
  const reportCategoryDetails = [];
  for (let i = 0; i < 3; i++) {
    const reportCategoryDetail = await prisma.reportCategoryDetail.create({
      data: {
        category_id: reportCategories[i].category_id,
        content: `신고 세부 내용 ${i + 1}`,
      },
    });
    reportCategoryDetails.push(reportCategoryDetail);
  }

    // 17. promptReport 
  const promptReports = [];
  for (let i = 0; i < 2; i++) {
    const promptReport = await prisma.promptReport.create({
      data: {
        user_id: userIds[i],
        prompt_id: prompts[i].prompt_id,
        category_id: (i % 2 === 0) ? reportCategories[0].category_id : reportCategories[1].category_id,
        content: `신고 내용 ${i + 1}`,
      },
    });
    promptReports.push(promptReport);
  }

  // 18. purchase
  const purchases = [];
  for (let i = 0; i < 5; i++) {
    const purchase = await prisma.purchase.create({
      data: {
        user_id: userIds[i % userIds.length],
        prompt_id: prompts[i].prompt_id,
        amount: (i + 1) * 1000,
        is_free: (i % 2 === 0),
      },
    });
    purchases.push(purchase);
  }

  // 19. payment
  const payments = [];
  for (let i = 0; i < purchases.length; i++) {
    const payment = await prisma.payment.create({
      data: {
        purchase_id: purchases[i].purchase_id,
        status: 'Succeed',
        provider: 'kakao',
        iamport_uid: `imp_${i + 1}`,
        merchant_uid: `order_${i + 1}`,
      },
    });
    payments.push(payment);
  }

  // 20. settlement
  const settlements = [];
  for (let i = 0; i < payments.length; i++) {
    const settlement = await prisma.settlement.create({
      data: {
        payment_id: payments[i].payment_id,
        amount: purchases[i].amount,
        fee: Math.floor(purchases[i].amount * 0.1), // 예: 수수료 10%
        status: 'Succeed',
      },
    });
    settlements.push(settlement);
  }

  // 21. withdrawRequest
  const withdrawRequests = [];
  for (let i = 0; i < userIds.length; i++) {
    const withdrawRequest = await prisma.withdrawRequest.create({
      data: {
        user_id: userIds[i],
        amount: (i + 1) * 1000,
        status: 'Pending',
      },
    });
    withdrawRequests.push(withdrawRequest);
  }

  // 22. promptLike (좋아요)
const promptLikes = [];
for (let i = 0; i < 5; i++) {
  const like = await prisma.promptLike.create({
    data: {
      user_id: userIds[i % userIds.length],
      prompt_id: prompts[i].prompt_id,
    },
  });
  promptLikes.push(like);
}
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });