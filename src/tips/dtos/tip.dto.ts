import { Tip } from "@prisma/client";

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

export interface CreateTipDTO {
  tip_id: number;
  writer_id: number;
  title: string;
  content: string;
  is_visible: boolean;
  file_url: string | null;
  created_at: string;
  updated_at: string;
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

export const mapToCreateTipDTO = (rawTip: Tip): CreateTipDTO => ({
  tip_id: rawTip.tip_id,
  writer_id: rawTip.writer_id,
  title: rawTip.title,
  content: rawTip.content,
  is_visible: rawTip.is_visible,
  file_url: rawTip.file_url,
  created_at: rawTip.created_at.toISOString(),
  updated_at: rawTip.updated_at.toISOString(),
});
