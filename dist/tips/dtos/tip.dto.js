"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToCreateTipDTO = exports.mapToTipListDTO = void 0;
// 팁 목록 반환 DTO
const mapToTipListDTO = (rawTips, page, size, totalCount) => {
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
exports.mapToTipListDTO = mapToTipListDTO;
const mapToCreateTipDTO = (rawTip) => ({
    tip_id: rawTip.tip_id,
    writer_id: rawTip.writer_id,
    title: rawTip.title,
    content: rawTip.content,
    is_visible: rawTip.is_visible,
    created_at: rawTip.created_at.toISOString(),
    updated_at: rawTip.updated_at.toISOString(),
});
exports.mapToCreateTipDTO = mapToCreateTipDTO;
