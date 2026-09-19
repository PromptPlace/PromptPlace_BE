# [BUG] Payple 결제 승인 후 구매 DB 미반영 및 계좌 인증 오탐

## 🛠 버그 설명

- 결제 요청이 `PCD_PAY_WORK=PAY`를 반환하지만 완료 처리 코드는 `PCD_PAY_REQKEY`로 최종 승인 API를 호출하는 `CERT` 흐름을 전제했다.
- 계좌 등록은 Payple 조회 전에 `name === holderName` 및 내부 은행 목록 검사로 일부 유효한 입력을 거절했다.

## 🔨 기대한 동작

- Payple 인증 결과를 서버에서 승인한 뒤, 승인 응답의 주문번호와 금액을 확인해 구매·결제·정산을 한 트랜잭션에 저장한다.
- 계좌 실명과 은행 지원 여부는 Payple 조회 결과로 판정한다.

## 🔨 실제 동작

- 결제창에서 성공해도 서버의 승인 키 요구와 결제 요청 방식이 맞지 않아 DB에 완료 기록이 남지 않을 수 있었다.
- Payple API를 호출하기 전에 이름 문자열 또는 내부 은행 목록 때문에 400을 반환할 수 있었다.

## 🛠 기타 설명 / 질문

- Payple 공식 문서: [국내 카드 앱카드 결제](https://docs.payple.kr/integration/domestic-card/app), [계좌조회](https://docs.payple.kr/integration/hub/verification).
- 프론트는 `/requests` 응답의 `PCD_PAY_WORK=CERT`를 그대로 결제창에 전달하고, 인증 결과의 `PCD_PAY_COFURL`, `PCD_AUTH_KEY`, `PCD_PAY_REQKEY`를 `/complete`로 전달해야 한다.
- 운영 환경의 실제 Payple 승인 및 DB 저장은 테스트 결제와 콜백 로그로 확인해야 한다.
