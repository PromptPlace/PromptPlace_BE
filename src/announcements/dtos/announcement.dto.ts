import { Announcement } from "@prisma/client";

export interface AnnouncementItem {
  announcement_id: number;
  writer_id: number;
  title: string;
  created_at: string;
  file_url: string | null;
}

export interface Pagination {
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

export interface AnnouncementListDTO {
  announcements: AnnouncementItem[];
  pagination: Pagination;
}

export interface CreateAnnouncementDTO {
  announcement_id: number;
  writer_id: number;
  title: string;
  content: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  file_url: string | null;
}

export const mapToAnnouncementListDTO = (
  rawAnnouncements: Announcement[],
  page: number,
  size: number,
  totalCount: number
): AnnouncementListDTO => {
  const totalPages = Math.ceil(totalCount / size);

  return {
    announcements: rawAnnouncements.map((Announcement) => ({
      announcement_id: Announcement.announcement_id,
      writer_id: Announcement.writer_id,
      title: Announcement.title,
      created_at: Announcement.created_at.toISOString(),
      file_url: Announcement.file_url,
    })),
    pagination: {
      page,
      size,
      total_elements: totalCount,
      total_pages: totalPages,
    },
  };
};

export const mapToCreateAnnouncementDTO = (rawAnnouncement: Announcement): CreateAnnouncementDTO => ({
  announcement_id: rawAnnouncement.announcement_id,
  writer_id: rawAnnouncement.writer_id,
  title: rawAnnouncement.title,
  content: rawAnnouncement.content,
  is_visible: rawAnnouncement.is_visible,
  created_at: rawAnnouncement.created_at.toISOString(),
  updated_at: rawAnnouncement.updated_at.toISOString(),
  file_url: rawAnnouncement.file_url,
});
