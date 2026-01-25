import { io } from "socket.io-client"; // 클라이언트
console.log("🔥 test-client started");
const socket = io("http://localhost:3000", { // 서버 연결 시도
  auth: { token: "" },
});

socket.on("connect", () => { // 서버가 연결을 받아줬을 때 실행
  console.log("connected:", socket.id); // 고유 소켓 id
  
  // 방 입장
  socket.emit("joinRoom", { room_id: 12 }, (res: any) => {
		if(!res.ok) return;

    // 메세지 전송
		socket.emit("sendMessage", {
			room_id: 12, 
			content: "안녕하세요!", 
			files: []
		});
	}); 

  // 메세지 수신
  socket.on("receiveMessage", (data) => {
    console.log(`[on]- receiveMessage 성공: 유저 ${data.sender.user_id}님이 "${data.content}"를 보냈습니다.`);
  });
});

// 서버 커스텀 에러 이벤트
socket.on("error", (e) => console.log("server error:", e));
