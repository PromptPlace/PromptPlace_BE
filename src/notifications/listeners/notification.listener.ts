import eventBus from '../../config/eventBus';
import { createReportNotificationService } from "../services/notification.service";



eventBus.on('report.created', async (userId: number) => {
  try {
    await createReportNotificationService(userId); // 나에게 알림 생성
  } catch (err) {
    console.error('[알림 리스너 오류]: 신고 알림 생성 실패', err);
  }
});