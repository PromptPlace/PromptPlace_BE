import { AttachmentType } from "@prisma/client";

export const mapMimeTypeToEnum = (mimeType: string): AttachmentType => {
  if (mimeType.startsWith("image/")) {
    return AttachmentType.IMAGE;
  }
  return AttachmentType.FILE;
};