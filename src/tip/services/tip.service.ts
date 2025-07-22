import { Tip } from "@prisma/client";
import { mapToTipListDTO } from "../dtos/tip.dto";
import { findtips } from "../repositories/tip.repository";

export const findTipList = async (
    rawPage?: string,
    rawSize?: string
    ) => {
    const page = rawPage ? parseInt(rawPage, 10) : 1;
    const size = rawSize ? parseInt(rawSize, 10) : 10;
    
    if (isNaN(page) || page < 1) throw new Error('page값이 적절하지 않습니다');
    if (isNaN(size) || size < 1) throw new Error('size값이 적절하지 않습니다');
    
    const rawTips: Tip[] = await findtips(page, size);
    const totalCount = rawTips.length;
    
    return mapToTipListDTO(rawTips, page, size, totalCount);
    }