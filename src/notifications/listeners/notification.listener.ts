import eventBus from '../../config/eventBus';
import { 
  createReportNotification,
  createAnnouncementNotification,
} from "../services/notification.service";


// 신고 알림 리스너
eventBus.on('report.created', async (userId: number) => {
  try {
    await createReportNotification(userId); // 나에게 알림 생성
  } catch (err) {
    console.error('[알림 리스너 오류]: 신고 알림 생성 실패', err);
  }
});


// 공지 알림 리스너
eventBus.on('announcement.created', async (announcementId: number) => {
  try {
    await createAnnouncementNotification(announcementId);
  } catch (err) {
    console.error("[알림 리스너 오류]: 공지사항 알림 생성 실패", err);
  }
});