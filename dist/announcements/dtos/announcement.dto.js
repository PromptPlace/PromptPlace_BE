"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToCreateAnnouncementDTO = exports.mapToAnnouncementListDTO = void 0;
const mapToAnnouncementListDTO = (rawAnnouncements, page, size, totalCount) => {
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
exports.mapToAnnouncementListDTO = mapToAnnouncementListDTO;
const mapToCreateAnnouncementDTO = (rawAnnouncement) => ({
    announcement_id: rawAnnouncement.announcement_id,
    writer_id: rawAnnouncement.writer_id,
    title: rawAnnouncement.title,
    content: rawAnnouncement.content,
    is_visible: rawAnnouncement.is_visible,
    created_at: rawAnnouncement.created_at.toISOString(),
    updated_at: rawAnnouncement.updated_at.toISOString(),
    file_url: rawAnnouncement.file_url,
});
exports.mapToCreateAnnouncementDTO = mapToCreateAnnouncementDTO;
