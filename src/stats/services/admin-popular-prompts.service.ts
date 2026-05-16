import { AdminPopularPromptsRepository } from '../repositories/admin-popular-prompts.repository';
import {
  PopularPromptItem,
  PopularPromptsResponse,
} from '../dtos/admin-popular-prompts.dto';
import { toKstDateString } from '../../utils/visitor-tracking';

const PERIOD_DAYS = 7;
const TOP_LIMIT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

export const getPopularPrompts = async (): Promise<PopularPromptsResponse> => {
  const targetSnapshotDate = toKstDateString(
    new Date(Date.now() - PERIOD_DAYS * DAY_MS),
  );

  const prompts = await AdminPopularPromptsRepository.findActivePrompts();
  const snapshots = await AdminPopularPromptsRepository.findSnapshotsByDate(
    targetSnapshotDate,
    prompts.map((p) => p.prompt_id),
  );
  const snapshotMap = new Map(snapshots.map((s) => [s.prompt_id, s]));

  const scored = prompts.map((p) => {
    const snap = snapshotMap.get(p.prompt_id);
    const views_delta = p.views - (snap?.views ?? 0);
    const downloads_delta = p.downloads - (snap?.downloads ?? 0);
    return {
      prompt_id: p.prompt_id,
      title: p.title,
      views_delta,
      downloads_delta,
      score: views_delta + downloads_delta,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const items: PopularPromptItem[] = scored
    .slice(0, TOP_LIMIT)
    .map((s, i) => ({ rank: i + 1, ...s }));

  return {
    period_days: PERIOD_DAYS,
    snapshot_date: targetSnapshotDate,
    items,
  };
};
