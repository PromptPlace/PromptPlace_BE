import { Request, Response } from "express";
import { chatService } from "../services/chat.service";
import { 
  CreateChatRoomRequestDto, 
  GetChatRoomListRequestDto,
  ChatFilterType
} from "../dtos/chat.dto";

export const createOrGetChatRoom = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.fail({
      statusCode: 401,
      error: "no user",
      message: "로그인이 필요합니다.",
    });
    return;
  }

  try {
    const userId = (req.user as { user_id: number }).user_id;
    const { partner_id } = req.body as CreateChatRoomRequestDto;

    const result = await chatService.createOrGetChatRoomService(userId, partner_id);

    res.success(result, "채팅방을 성공적으로 생성/반환했습니다.");
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.error || "InternalServerError",
      message: err.message || "채팅방 생성/반환 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  }
};

export const getChatRoomDetail = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
    res.fail({
      statusCode: 401,
      error: "no user",
      message: "로그인이 필요합니다.",
    });
    return;
  }

  try{
    const userId = (req.user as { user_id: number }).user_id;

    const roomId = Number(req.params.roomId);
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    if (isNaN(roomId)) {
      res.fail({ statusCode: 400, error: "BadRequest", message: "올바른 roomId 필요합니다." });
      return;
    }

    const result = await chatService.getChatRoomDetailService(roomId, userId, cursor, limit);
    
    res.success(result, "채팅방 상세를 성공적으로 조회했습니다.");
  } catch (err: any) {  
    console.error(err);
    res.fail({
      error: err.error || "InternalServerError",
      message: err.message || "채팅방 상세 조회 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  }
}

// == 채팅방 목록
export const getChatRoomList = async(req: Request, res: Response) => {
  if (!req.user) {
    res.fail({
      statusCode: 401,
      error: "no user",
      message: "로그인이 필요합니다.",
    });
    return;
  }
  
  try{
    const userId = (req.user as { user_id: number }).user_id;
    const { cursor, limit, filter, search } = req.query as unknown as GetChatRoomListRequestDto;
    
    if (filter && filter !== "all" && filter !== "unread" && filter !== "pinned") {
      res.fail({ statusCode: 400, error: "BadRequest", message: "올바른 filter값이 필요합니다." });
      return;
    }

    const result = await chatService.getChatRoomListService(
          userId, 
          cursor ? Number(cursor) : undefined, 
          limit ? Number(limit) : undefined,     
          filter,
          search as string                     
        );      
      res.success(result, "채팅방 목록을 성공적으로 조회했습니다.");
  } catch (err: any) {  
    console.error(err);
    res.fail({
      error: err.error || "InternalServerError",
      message: err.message || "채팅방 목록 조회 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  }
} 

// == 상대방 차단
export const blockUser = async(req: Request, res: Response) => {
  if (!req.user) {
    res.fail({  
      statusCode: 401,
      error: "no user",
      message: "로그인이 필요합니다.",
    });
    return;
  } 
  try {
    const blockerId = (req.user as { user_id: number }).user_id;
    const { blocked_user_id } = req.body as { blocked_user_id: number };
    
    if (!blocked_user_id || isNaN(blocked_user_id)) {
      res.fail({ statusCode: 400, error: "BadRequest", message: "올바른 blocked_user_id가 필요합니다." });
      return;
    }

    if (blockerId === blocked_user_id) {
      res.fail({ statusCode: 400, error: "BadRequest", message: "자기 자신을 차단할 수 없습니다." });
      return;
    }

    await chatService.blockUserService(blockerId, blocked_user_id);
    
    res.success(null, "상대방을 성공적으로 차단했습니다.");
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.error || "InternalServerError",
      message: err.message || "상대방 차단 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  }
};

// == 채팅방 나가기
export const leaveChatRoom = async(req: Request, res: Response) => {
    if (!req.user) {
      res.fail({  
        statusCode: 401,
        error: "no user",
        message: "로그인이 필요합니다.",
      });
      return;
    } 
    try {
      const userId = (req.user as { user_id: number }).user_id;
      const roomId = Number(req.params.roomId);
      console.log("🍀roomId:", roomId);
      
      if (isNaN(roomId)) {
        res.fail({ statusCode: 400, error: "BadRequest", message: "올바른 roomId가 필요합니다." });
        return;
      }
      await chatService.leaveChatRoomService(roomId, userId);
      
      res.success(null, "채팅방을 성공적으로 나갔습니다.");
    } catch (err: any) {
      console.error(err);
      res.fail({
        error: err.error || "InternalServerError",
        message: err.message || "채팅방 나가기 중 오류가 발생했습니다.",
        statusCode: err.statusCode || 500,
      });
    }
};
// == S3 presigned URL 발급
export const getPresignedUrl = async(req: Request, res: Response) => {
  if (!req.user) {
    res.fail({  
      statusCode: 401,
      error: "no user",
      message: "로그인이 필요합니다.",
    });
    return;
  } 
  try {
    const rawFiles = req.body.files;

    if (!rawFiles || !Array.isArray(rawFiles) || rawFiles.length === 0) {
      res.fail({ statusCode: 400, error: "BadRequest", message: "업로드할 파일 정보가 필요합니다." });
      return;
    }

    const files = rawFiles.map((file: any) => ({
      fileName: file.name,
      contentType: file.content_type
    }));

    const result = await chatService.getPresignedUrlService(files);
    
    res.success(result, "presign을 성공적으로 발급했습니다.");
  } catch (err: any) {
    console.error(err);
    res.fail({
      error: err.error || "InternalServerError",
      message: err.message || "presigned URL 생성 중 오류가 발생했습니다.",
      statusCode: err.statusCode || 500,
    });
  } 
};