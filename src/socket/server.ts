import { chatService } from "../chat/services/chat.service"; 
import { AppError } from "../errors/AppError";
import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import e from "express";

const setupSocketEvents = (io: SocketIOServer, socket: Socket) => {
  const userId = socket.data.userId; // 미들웨어에서 설정한 id

  // 방 입장
  socket.on("joinRoom", async (data, ack) => {

    try {
      console.log("data:", data)
      const roomId:number = data.room_id;
      
      if (!roomId) {
        return ack({ok: false, message: "입력 필드에 room_id가 없습니다."})
      }

      socket.join(String(roomId)); 

      ack(({ok: true, room_id: roomId, message: "사용자가 방을 입장했습니다."}));
      
      console.log(`[on]-joinRoom 성공: 유저 ${userId}님이 ${roomId}번 방에 입장했습니다.`);
      
      // 읽음 처리
      await chatService.resetUnreadCountService(Number(roomId), userId);
    
    } catch (err: any){
        console.error(err);
        ack?.({ok: false, message: err.message});
    }
  });

  // 메세지 전송
  socket.on("sendMessage", async (data, ack) => {
    try {
      const { room_id, content, files } = data;
      
      // 메세지를 db에 저장
      const savedMessage = await chatService.saveMessageService({
        roomId: Number(room_id), 
        senderId: userId,
        content: content,
        files: files || []
      });
      console.log(`[on]- sendMessage 성공: 유저 ${userId}님이 "${content}"를 보냈습니다.`);
      ack?.({ok: true, message: "메세지가 성공적으로 전송되었습니다."});

      // 메세지 수신(broadcast)
      io.to(room_id.toString()).emit("receiveMessage", savedMessage);
    
    } catch (err: any) {
      console.error("Error:", err);
      ack?.({ok: false, message: "메세지 전송/수신 중 오류가 발생했습니다."});
    }
  });

  // 방 나가기 (뒤로가기)
  socket.on("leaveRoom", (roomId: number, ack: any) => {
    try {
      socket.leave(String(roomId));
      console.log(`유저 ${userId}님이 방 ${roomId}을 나갔습니다.`);
      ack?.({ok: true, message: "방을 성공적으로 나갔습니다."});
    } catch(err: any) {
      ack?.({ok: false, message: "방 나가기 중 오류가 발생했습니다."});

    }
  });
};

// == 메인 초기화 함수 ==
export const initSocket = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://www.promptplace.kr",
        "https://promptplace-develop.vercel.app",
      ],
      credentials: true
    }
  });

  // 인증 미들웨어
  io.use(async (socket, next) => {

    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        return next(new AppError("토큰이 없거나 형식이 잘못되었습니다.", 401, "Unauthorized"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number};
      
      const user = await prisma.user.findUnique({
        where: { 
          user_id: decoded.id
        },
      });

      if (!user) { 
        return next(new AppError("존재하지 않는 사용자입니다.", 401, "Unauthorized"));
      }

      socket.data.user = user;  
      socket.data.userId = user.user_id;
      
      next();

    } catch (err) {
      const error = err as Error
      if(error.name === "TokenExpiredError") {
        return next(new AppError("토큰이 만료되었습니다.", 401, "Unauthorized"));
      }
      else if (error.name === "JsonWebTokenError") {
        return next(new AppError("유효하지 않은 토큰입니다.", 401, "Unauthorized"));
      }
      console.error("Socket 인증 오류:", err);
      next(new AppError("알 수 없는 오류가 발생했습니다.", 500, "InternalServerError"));
    }
  });

  // 연결 시작
  io.on("connection", (socket: Socket) => {
    console.log("새로운 소켓 연결:", socket.id);
    setupSocketEvents(io, socket);
  });
};