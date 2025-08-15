# 🚀 PromptPlace Backend

프롬프트를 공유하고 거래/결제하는 API를 제공하는 백엔드 서비스

## 📋 프로젝트 개요

**PromptPlace**는 프롬프트 거래 플랫폼의 백엔드 API 서버로, 프롬프트 작성자와 구매자 간의 거래를 중개하는 서비스입니다.

## ✨ 주요 기능

- **회원가입/로그인**: JWT 기반 인증 및 사용자 계정 관리
- **리뷰 기능**: 프롬프트에 대한 후기 작성 및 평점 부여
- **프롬프트 검색**: 키워드·카테고리 기반 검색 지원
- **프롬프트 결제 처리**: 안전한 거래를 위한 결제 API 제공
- **프롬프트 다운로드**: 구매한 프롬프트 또는 무료 프롬프트 다운로드
- **프롬프트 업로드**: 프롬프트 및 설명, 가격 설정 후 등록
- **다른 사용자 팔로우**: 관심 있는 프롬프트 제작자 구독

## 🛠️ 기술 스택

### **Core Backend**

- **Node.js** + **Express.js 5.1.0**
- **TypeScript 5.8.3** (정적 타입 지원)
- **TypeDI** (의존성 주입)

### **Database & ORM**

- **MySQL** (프로덕션 데이터베이스)
- **Prisma 6.14.0** (타입 안전한 ORM)
- **Prisma Migrations** (스키마 버전 관리)

### **Authentication & Security**

- **Passport.js** (인증 미들웨어)
- **JWT 토큰 시스템**
  - Access Token: 3시간 유효
  - Refresh Token: 14일 유효
- **OAuth 2.0 소셜 로그인** (Google, Naver)

### **Cloud & Storage**

- **AWS S3** (파일 저장소)
- **AWS SDK v3** (S3 클라이언트)
- **Multer** (파일 업로드 처리)

### **API Documentation**

- **Swagger/OpenAPI 3.0**
- **Swagger UI Express**
- **JSDoc 기반 자동 문서 생성**

### **Development Tools**

- **pnpm** (패키지 매니저)
- **ts-node-dev** (개발 서버)
- **Class Validator & Transformer** (DTO 검증/변환)

## 🏗️ 프로젝트 구조

### **레이어드 아키텍처**

```
src/
├── 📁 config/           # 설정 파일
├── 📁 middlewares/      # 공통 미들웨어
├── 📁 errors/           # 에러 처리
├── 📁 [도메인]/         # 도메인별 모듈
│   ├── 📁 controllers/  # HTTP 요청 처리
│   ├── 📁 services/     # 비즈니스 로직
│   ├── 📁 repositories/ # 데이터 접근 계층
│   ├── 📁 routes/       # API 라우팅
│   └── 📁 dtos/         # 데이터 전송 객체
└── 📄 index.ts          # 애플리케이션 진입점
```

### **도메인 모듈**

**Core Domains**

- **Auth**: 인증 및 소셜 로그인
- **Members**: 회원 관리
- **Prompts**: 프롬프트 상품 관리

**Business Domains**

- **Reviews**: 리뷰 시스템
- **Purchases**: 구매/결제 처리
- **Settlements**: 정산 관리

**Communication Domains**

- **Messages**: 메시징 시스템
- **Notifications**: 알림 시스템
- **Inquiries**: 문의사항 처리
- **Reports**: 신고 시스템

**Utility Domains**

- **Tips**: 팁 시스템

### **데이터 흐름**

```
HTTP Request → Controller → Service → Repository → Database
             ↓           ↓         ↓
           라우팅 → 비즈니스 로직 → 데이터 접근
```

## 🌿 브랜치 전략 및 개발 워크플로우

### **기능 기반 브랜치 전략**

```
main                 # 프로덕션 배포용 메인 브랜치
├── feat/#1          # 새로운 기능 개발
├── fix/#232         # 버그 수정
├── docs/#15         # 문서 수정
├── refactor/#8      # 코드 리팩토링
└── chore/#44        # 기타 작업
```

### **브랜치 네이밍 컨벤션**

```
feat/#이슈번호        # 새로운 기능 개발
fix/#이슈번호         # 버그 수정
build/#이슈번호       # 빌드 관련 수정
chore/#이슈번호       # 자잘한 수정
ci/#이슈번호          # CI 설정 수정
docs/#이슈번호        # 문서 수정
style/#이슈번호       # 코드 스타일/포맷
refactor/#이슈번호    # 코드 리팩토링
test/#이슈번호        # 테스트 코드 수정
perf/#이슈번호        # 성능 개선
```

### **개발 워크플로우**

1. **노션에서 작업 관리**: 브랜치명과 작업상태 기록 (ex: `feat/#1`)
2. **브랜치 생성 및 이동**: `git checkout -b feat/#1`
3. **개발 작업 진행**: 기능 구현 및 코딩
4. **커밋 후 푸시**: `git push origin feat/#1`
5. **Pull Request 생성**: GitHub에서 코드리뷰 후 main 브랜치로 PR
6. **메인 브랜치 동기화**: `git checkout main` → `git pull origin main`

### **CI/CD 파이프라인**

- **GitHub Actions**를 통한 자동 배포
- **Main 브랜치 푸시 시** EC2 자동 배포
- **Prisma 스키마 변경 시** 자동 마이그레이션 실행

## 🔐 보안 및 인증

### **JWT 토큰 관리**

- **Access Token**: 3시간 (짧은 유효기간으로 보안 강화)
- **Refresh Token**: 14일 (자동 토큰 갱신)
- **안전한 토큰 저장**: 데이터베이스에 암호화 저장

### **소셜 로그인 지원**

- **Google OAuth 2.0**
- **Naver OAuth 2.0**

### **권한 기반 접근 제어**

- **USER**: 일반 사용자 권한
- **ADMIN**: 관리자 권한
- **Role-based Access Control (RBAC) 패턴**

## 🗄️ 데이터베이스 설계

### **핵심 엔티티**

- **User**: 사용자 정보 및 프로필
- **Prompt**: 프롬프트 상품 정보
- **Purchase**: 구매 거래 내역
- **Review**: 상품 리뷰
- **Following**: 사용자 간 팔로우 관계
- **UserImage**: 프로필 이미지

### **관계 설계 패턴**

- **1:1 관계**: User ↔ UserImage, UserIntro
- **1:N 관계**: User → Prompts, Reviews
- **N:N 관계**: User ↔ User (Following 시스템)

## 🚀 배포 및 운영

### **배포 환경**

- **AWS EC2** (Ubuntu 환경)
- **Systemd** 서비스 관리
- **PM2** 또는 Node.js 직접 실행

### **자동화된 배포 파이프라인**

```yaml
코드 푸시 → GitHub Actions 트리거
→ SSH로 EC2 접근
→ 코드 동기화 (rsync)
→ 의존성 설치 및 빌드
→ Prisma 마이그레이션 실행
→ 서비스 재시작 완료
```

### **환경 관리**

- **환경변수 기반 설정** (개발/프로덕션 분리)
- **GitHub Secrets**를 통한 보안 정보 관리
- **Docker 컨테이너화** 준비 가능한 구조

## ⚡ 성능 최적화

### **데이터베이스 최적화**

- **인덱스 전략** 최적화
- **N+1 쿼리 문제** 방지
- **Prisma 쿼리 최적화** 패턴 적용

### **파일 처리 최적화**

- **AWS S3** 클라우드 저장소 활용
- **이미지 최적화** 및 압축
- **CDN 도입** 가능한 아키텍처

## 📊 모니터링 및 품질 관리

### **로깅 시스템**

- **Systemd Journal** 로그 관리
- **구조화된 에러 핸들링** 미들웨어
- **일관된 응답 포맷** 표준화

### **API 문서화**

- **Swagger UI** 실시간 API 문서
- **표준화된 HTTP 상태 코드**
- **일관된 에러 응답 형식**

### **코드 품질 관리**

- **TypeScript 엄격 모드** 적용
- **표준화된 PR 템플릿**
- **체계적인 코드 리뷰** 프로세스

## 🎯 프로젝트 특장점

### **확장성**

- **모듈형 도메인 구조**로 기능 확장 용이
- **의존성 주입 패턴**으로 테스트 및 유지보수성 향상
- **클라우드 네이티브** 아키텍처

### **개발 생산성**

- **TypeScript**를 통한 타입 안전성
- **Prisma ORM**으로 타입 안전한 DB 접근
- **자동화된 CI/CD** 파이프라인

### **보안성**

- **JWT 기반 인증** 시스템
- **OAuth 2.0** 소셜 로그인
- **AWS S3** 안전한 파일 저장

## 🚀 시작하기

### **필수 요구사항**

- Node.js 18+
- MySQL 8.0+
- pnpm

### **설치 및 실행**

```bash
# 의존성 설치
pnpm install

# 데이터베이스 마이그레이션
pnpm prisma migrate dev

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build
pnpm start
```

### **API 문서**

- **Swagger UI**: `https://promptplace.kro.kr/api-docs/`
- **API 엔드포인트**: `https://promptplace.kro.kr/api`

# 👥 Backend Development Team

## Team Members

### 미니 (류민주)

- **학교/전공**: 동국대학교 컴퓨터공학전공
- **이메일**: [mjryu00211@gmail.com](mailto:mjryu00211@gmail.com)
- **GitHub**: [https://github.com/minij02](https://github.com/minij02)

### 호 (원종호)

- **학교/전공**: 동국대학교 컴퓨터AI학부
- **이메일**: [kgbk0613@naver.com](mailto:kgbk0613@naver.com)
- **GitHub**: [https://github.com/yee2know](https://github.com/yee2know)

### 리매니아 (최성준)

- **학교/전공**: 한국외국어대학교 컴퓨터공학전공
- **이메일**: [csjoon0606@hufs.ac.kr](mailto:csjoon0606@hufs.ac.kr)

### 시트러스 (송강규)

- **학교/전공**: 한국외국어대학교 컴퓨터공학전공
- **이메일**: [ggsong0328@gmail.com](mailto:ggsong0328@gmail.com)
- **GitHub**: [https://github.com/ggsong0328](https://github.com/ggsong0328)

### 신디 (남아린)

- **학교/전공**: 덕성여대 컴퓨터공학전공
- **이메일**: [cindy030225@gmail.com](mailto:cindy030225@gmail.com)
- **GitHub**: [https://github.com/Arin0303](https://github.com/Arin0303)

---
