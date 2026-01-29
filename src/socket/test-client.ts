import { io } from "socket.io-client"; // 클라이언트
console.log("🔥 test-client started");
const socket = io("http://localhost:3000", { // 서버 연결 시도
  auth: { token: "" },
});

socket.on("connect", () => { // 서버가 연결을 받아줬을 때 실행
  console.log("[on]-connected:", socket.id); // 고유 소켓 id
  
  // 방 입장
  socket.emit("joinRoom", { room_id: 12 }, (res: any) => {
		if(!res.ok) {
      console.log("[emit]-joinRoom");
      return;
    }
    // 메세지 전송
		socket.emit("sendMessage", {
			room_id: 12, 
			content: "안녕하세요!", 
			files: []
		}, (ack:any) => {
      if(!ack.ok) {
        console.log("[emit]-sendMessage");
        return;
      }
    });

    // 메세지 수신
    socket.on("receiveMessage", (data) => {
      console.log("[on]-receiveMessage")
      console.log(`[on]- receiveMessage 성공: 유저 ${data.sender.user_id}님이 "${data.content}"를 보냈습니다.`);
      
      // 방 나가기
      socket.emit("leaveRoom", { room_id: 12}, (ack: any) => {
        console.log("[emit]-leaveRoom")
        if(!ack.ok) return;
      });
    });
	}); 
});

// 서버 커스텀 에러 이벤트
socket.on("connect_error", (err) => {
  console.log("[on]-connect_error", err);
});
