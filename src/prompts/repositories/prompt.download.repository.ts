import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const PromptDownloadRepository = {
  async findById(promptId: number) {
    return prisma.prompt.findUnique({
      where: { prompt_id: promptId },
    });
  }
};