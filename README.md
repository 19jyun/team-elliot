# 🩰 Team Elliot - 발레 학원 관리 시스템

발레 학원의 수업 관리, 학생 관리, 결제 시스템을 통합적으로 제공하는 웹 플랫폼입니다.

## 📋 프로젝트 개요

Team Elliot은 발레 학원 운영에 필요한 모든 기능을 제공하는 통합 관리 시스템입니다. 학생들의 수업 신청부터 출석 관리, 결제 처리까지 원스톱으로 해결할 수 있습니다.

### 🎯 주요 기능

- **학원 관리**: 학원 정보, 강사, 학생 통합 관리
- **수업 관리**: 수업 생성, 세션 관리, 출석 체크
- **결제 시스템**: 수업료 결제, 환불 처리, 정산 관리
- **실시간 통신**: WebSocket을 통한 실시간 알림 및 채팅
- **권한 관리**: 학생/강사/원장별 역할 기반 접근 제어
- **모바일 지원**: 반응형 웹 디자인으로 모든 디바이스 지원

## 🏗️ 기술 스택

### Backend

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: JWT + Passport
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### Frontend

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Radix UI
- **Real-time**: Socket.io Client

### Infrastructure

- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Database**: PostgreSQL
- **File Storage**: Local Storage
- **SMS Service**: Twilio

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd team-elliot
```

### 2. Backend 설정

```bash
cd backend
npm install
cp env.example .env
# .env 파일 편집
npm run start:dev
```

### 3. Frontend 설정

```bash
cd frontend
npm install
cp env.example .env
# .env 파일 편집
npm run dev
```

### 4. 데이터베이스 설정

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run seed
```

## 📁 프로젝트 구조

```
team-elliot/
├── backend/                 # 백엔드 API 서버
│   ├── src/
│   │   ├── academy/        # 학원 관리
│   │   ├── auth/           # 인증 및 권한
│   │   ├── ballet-pose/    # 발레 자세 관리
│   │   ├── class/          # 수업 관리
│   │   ├── class-session/  # 수업 세션
│   │   ├── payment/        # 결제 시스템
│   │   ├── principal/      # 원장 관리
│   │   ├── refund/         # 환불 처리
│   │   ├── session-content/# 세션 내용
│   │   ├── sms/            # SMS 서비스
│   │   ├── socket/         # 실시간 통신
│   │   ├── student/        # 학생 관리
│   │   └── teacher/        # 강사 관리
│   ├── prisma/             # 데이터베이스 스키마
│   ├── test/               # 테스트 파일
│   └── scripts/            # 배포 및 유틸리티 스크립트
├── frontend/               # 프론트엔드 웹 애플리케이션
│   ├── src/
│   │   ├── app/            # Next.js 앱 라우터
│   │   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── contexts/       # React 컨텍스트
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── lib/            # 유틸리티 함수
│   │   ├── store/          # 상태 관리
│   │   └── types/          # TypeScript 타입 정의
│   └── public/             # 정적 파일
├── docs/                   # 프로젝트 문서
└── README.md               # 이 파일
```

## 🔐 사용자 역할 및 권한

### 👨‍🎓 STUDENT (학생)

- 수업 조회 및 신청
- 출석 확인
- 결제 내역 조회
- 환불 요청

### 👩‍🏫 TEACHER (강사)

- 수업 관리 및 세션 생성
- 출석 체크
- 학생 관리
- 수업료 정산

### 👨‍💼 PRINCIPAL (원장)

- 학원 전체 관리
- 강사 및 학생 관리
- 수업 및 결제 현황 조회
- 시스템 설정

## 📚 API 문서

### Swagger UI

Backend 서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

```
http://localhost:3001/api
```

### Postman Collection

`backend/postman/` 디렉토리에 API 테스트용 Postman 컬렉션이 포함되어 있습니다.

## 🧪 테스트

### Backend 테스트

```bash
cd backend
npm run test              # 단위 테스트
npm run test:integration  # 통합 테스트
npm run test:e2e         # E2E 테스트
```

### Frontend 테스트

```bash
cd frontend
npm run test             # 단위 테스트
npm run test:e2e        # E2E 테스트
```

## 🐳 Docker

### 전체 스택 실행

```bash
# Backend + Database
cd backend
docker-compose up -d

# Frontend
cd frontend
docker-compose up -d
```

### 프로덕션 빌드

```bash
# Backend
cd backend
docker build -t team-elliot-backend .

# Frontend
cd frontend
docker build -t team-elliot-frontend .
```

## 🔧 개발 도구

### 코드 품질

```bash
# Backend
cd backend
npm run format    # 코드 포맷팅
npm run lint      # 린팅

# Frontend
cd frontend
npm run format   # 코드 포맷팅
npm run lint     # 린팅
```

### 데이터베이스 관리

```bash
cd backend
npx prisma studio    # 데이터베이스 GUI
npx prisma migrate dev  # 마이그레이션
npm run seed         # 초기 데이터
```

## 📊 모니터링

### 헬스체크

- Backend: `GET /health`
- Frontend: `GET /api/health`

### 로그 확인

```bash
# Backend
cd backend
docker-compose logs -f app

# Frontend
cd frontend
docker-compose logs -f app
```

## 🚀 배포

자세한 배포 정보는 다음 문서를 참조하세요:

- [Backend 배포 가이드](./backend/DEPLOYMENT.md)
- [Backend CI/CD 설정](./backend/CICD_README.md)

## 🤝 기여하기

### 개발 워크플로우

1. `develop` 브랜치에서 작업
2. Pull Request 생성
3. 코드 리뷰 후 `main` 브랜치로 병합

### 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 프로세스 또는 보조 도구 변경
```

## 📞 지원

### 문제 해결

1. [Issues](../../issues)에서 기존 문제 확인
2. 새로운 이슈 생성
3. 팀원과 논의

### 개발 환경 문제

- Node.js 버전 확인 (18+)
- PostgreSQL 연결 확인
- 환경변수 설정 확인
- Docker 실행 상태 확인

## 📄 라이선스

이 프로젝트는 팀 내부용으로 개발되었습니다.

---

**Team Elliot Development Team** 🩰

> 발레 교육의 디지털 혁신을 이끌어갑니다.
