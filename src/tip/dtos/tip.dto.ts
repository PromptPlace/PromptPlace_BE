import { Tip } from '@prisma/client';

export interface TipItem {
  tip_id: number;
  writer_id: number;
  title: string;
  created_at: string;
//   file_url: string | null;
}

export interface Pagination {
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

export interface TipListDTO {
  tips: TipItem[];
  pagination: Pagination;
}

// 팁 목록 반환 DTO
export const mapToTipListDTO = (
  rawTips: Tip[],
  page: number,
  size: number,
  totalCount: number
): TipListDTO => {
  const totalPages = Math.ceil(totalCount / size);

  return {
    tips: rawTips.map((tip) => ({
      tip_id: tip.tip_id,
      writer_id: tip.writer_id,
      title: tip.title,
      created_at: tip.created_at.toISOString(),
    //   file_url: tip.file_url,
    })),
    pagination: {
      page,
      size,
      total_elements: totalCount,
      total_pages: totalPages,
    },
  };
};