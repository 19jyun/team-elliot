# 🩰 Team Elliot Backend API

발레 수강신청 플랫폼의 백엔드 API 서버입니다. NestJS 프레임워크를 기반으로 구축되었으며, 학생, 선생님, 학원 관리자를 위한 종합적인 수강 관리 시스템을 제공합니다.

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [기술 스택](#-기술-스택)
- [주요 기능](#-주요-기능)
- [설치 및 실행](#-설치-및-실행)
- [API 문서](#-api-문서)
- [데이터베이스](#-데이터베이스)
- [환경 변수](#-환경-변수)
- [테스트](#-테스트)
- [배포](#-배포)
- [개발 가이드](#-개발-가이드)

## 🎯 프로젝트 개요

Team Elliot은 발레, 필라테스 등의 인도어 운동의 수강신청을 위한 통합 플랫폼으로, 다음과 같은 사용자들을 지원합니다:

- **학생**: 클래스 조회, 수강 신청, 결제 관리
- **선생님**: 클래스 관리, 수강생 관리, 일정 관리
- **학원 관리자(원장)**: 전체 시스템 관리, 승인/거부 처리, 강의 개설 등

### 핵심 특징

- 🔐 **JWT 기반 인증 시스템**
- 📱 **실시간 알림 (Socket.IO)**
- 📧 **SMS 인증 (Twilio)**
- 📁 **파일 업로드 (Multer)**
- 🗄️ **PostgreSQL 데이터베이스**
- 📚 **자동 API 문서화 (Swagger)**

## 🛠 기술 스택

### Backend Framework

- **NestJS** - Node.js 기반 프레임워크
- **TypeScript** - 타입 안전성
- **Prisma** - ORM 및 데이터베이스 관리

### Database

- **PostgreSQL** - 메인 데이터베이스
- **Prisma Migrate** - 데이터베이스 마이그레이션

### External Services

- **Twilio** - SMS 인증 서비스 (현재 한국 서비스가 중단되어 미사용 중)
- **Socket.IO** - 실시간 통신
- **Multer** - 파일 업로드 처리
- **bcrypt** - 비밀번호 해싱

### Development Tools

- **Jest** - 테스트 프레임워크
- **ESLint** - 코드 린팅
- **Prettier** - 코드 포맷팅
- **Docker** - 컨테이너화

## ✨ 주요 기능

### 🔐 인증 및 권한 관리

- JWT 토큰 기반 인증
- 역할별 접근 제어 (학생/선생님/원장)
- 비밀번호 암호화 (bcrypt)

### 👥 사용자 관리

- 학생, 선생님, 원장 프로필 관리
- 학원 가입/탈퇴 시스템
- 프로필 사진 업로드

### 📚 클래스 및 수강 관리

- 클래스 생성 및 관리
- 수강 신청/취소
- 수강 상태 관리 (대기/승인/거부)
- 일정 관리 및 캘린더 연동

### 💰 결제 및 환불

- 수강료 결제 관리 (현재는 카드 결제 같은 방식 지원 X, 그저 계좌번호를 복사할 수 있도록 처리)
- 환불 신청 및 처리
- 결제 내역 조회

### 📱 실시간 알림

- Socket.IO 기반 실시간 통신 (수강 신청이 승인, 거부되었는지 등)
- 사용자별/그룹별 알림
- 수강 신청 상태 변경 알림

### 🩰 발레 포즈 관리 (베타)

- 발레 자세 이미지 업로드
- 포즈 카테고리 관리
- 이미지 메타데이터 관리
- 추후에 기획팀이 회의를 거쳐 수정할 예정

## 🚀 설치 및 실행

### 필수 요구사항

- **Node.js** 18.0.0 이상
- **PostgreSQL** 15.0 이상
- **npm** 8.0.0 이상

### 1. 저장소 클론

```bash
git clone <repository-url>
cd team-elliot/backend
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
# 환경 변수 파일 복사 및 변수 편집
cp .env.example .env

nano .env
```

### 4. 데이터베이스 설정

```bash
# 데이터베이스 마이그레이션 실행
npx prisma migrate dev

# 시드 데이터 삽입 (선택사항)
npm run seed
```

### 5. 개발 서버 시작

```bash
# 개발 모드 (핫 리로드)
npm run start:dev

# 프로덕션 모드
npm run start:prod
```

서버가 성공적으로 시작되면 다음 URL에서 접근할 수 있습니다:

- **API 서버**: http://localhost:3001
- **Swagger 문서**: http://localhost:3001/api

## 📚 API 문서

### Swagger UI

프로젝트에는 자동 생성되는 API 문서가 포함되어 있습니다:

```
http://localhost:3001/api
```

### 주요 API 엔드포인트

#### 인증 (Auth)

- `POST /auth/login` - 로그인
- `POST /auth/signup` - 회원가입
- `POST /auth/logout` - 로그아웃
- `POST /auth/check-userid` - 아이디 중복 체크

#### 학생 (Student)

- `GET /student/classes` - 내 수강 클래스 목록
- `POST /student/classes/:id/enroll` - 클래스 수강 신청
- `GET /student/profile` - 내 프로필 조회

#### 선생님 (Teacher)

- `GET /teachers/me` - 내 프로필 조회
- `PUT /teachers/me/profile` - 프로필 수정
- `GET /teachers/me/classes` - 담당 클래스 목록

#### 학원 (Academy)

- `GET /academy` - 학원 목록 조회
- `POST /academy/join` - 학원 가입 요청

## 🗄 데이터베이스

### Prisma 스키마

데이터베이스 스키마는 `prisma/schema.prisma` 파일에서 관리됩니다.

### 마이그레이션

```bash
# 새로운 마이그레이션 생성
npx prisma migrate dev --name <migration-name>

# 프로덕션 마이그레이션 실행
npx prisma migrate deploy

# 데이터베이스 리셋 (개발용)
npm run db:reset
```

### 데이터베이스 시각화

```bash
# Prisma Studio 실행
npx prisma studio
```

## 🔧 환경 변수

### 필수 환경 변수

```env
# 데이터베이스
DATABASE_URL="postgresql://username:password@localhost:5432/team_elliot"

# JWT
JWT_SECRET="your-jwt-secret-key"

# Twilio (SMS) (미사용되니까 임의의 값 지정)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_VERIFY_SERVICE_SID="your-verify-service-sid"

# 서버
PORT=3001
NODE_ENV=development
```

### 선택적 환경 변수

```env
# 프론트엔드 URL (CORS)
FRONTEND_URL="http://localhost:3000"

# 파일 업로드
MAX_FILE_SIZE=10485760  # 10MB
```

## 🧪 테스트

### 테스트 실행

```bash
# 단위 테스트
npm run test

# 통합 테스트
npm run test:integration

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

### 테스트 데이터베이스

```bash
# 테스트 데이터베이스 시작
npm run test:db:start

# 테스트 실행
npm run test:integration

# 테스트 데이터베이스 정리
npm run test:db:stop
```

## 👨‍💻 개발 가이드

### 프로젝트 구조

```
src/
├── auth/                 # 인증 관련
├── student/             # 학생 관련
├── teacher/             # 선생님 관련
├── academy/             # 학원 관련
├── class/               # 클래스 관련
├── class-session/       # 클래스 세션 관련
├── payment/             # 결제 관련
├── refund/              # 환불 관련
├── ballet-pose/         # 발레 포즈 관련
├── socket/              # 실시간 통신
├── sms/                 # SMS 서비스
├── common/              # 공통 모듈
├── prisma/              # 데이터베이스
└── main.ts              # 애플리케이션 진입점
```

### 코딩 컨벤션

- **TypeScript** 사용 필수
- **ESLint** 및 **Prettier** 설정 준수
- **Jest**를 사용한 테스트 작성
- **Swagger** 데코레이터로 API 문서화

### 새로운 기능 추가

1. **모듈 생성**

   ```bash
   nest generate module <module-name>
   nest generate controller <module-name>
   nest generate service <module-name>
   ```

2. **DTO 생성**

   ```typescript
   // dto/create-example.dto.ts
   export class CreateExampleDto {
     @ApiProperty()
     @IsString()
     name: string;
   }
   ```

3. **API 문서화**
   ```typescript
   @ApiOperation({ summary: '예시 API' })
   @ApiResponse({ status: 200, description: '성공' })
   async example() {
     // 구현
   }
   ```

### Git 워크플로우

#### 브랜치 전략

프로젝트는 **Git Flow** 방식을 사용합니다:

- **`main`** - 프로덕션 배포용 브랜치
- **`develop`** - 개발 통합 브랜치 (기본 브랜치)
- **`feature/*`** - 새로운 기능 개발 브랜치
- **`hotfix/*`** - 긴급 버그 수정 브랜치

#### 브랜치 명명 규칙

```bash
# 기능 개발
feature/기능명-간단설명
feature/user-authentication
feature/class-enrollment-system

# 버그 수정
fix/버그명-간단설명
fix/login-error-fix
fix/payment-validation-bug

# 예시
feature/student-profile-management
feature/real-time-notifications
fix/database-connection-issue
```

#### 개발 워크플로우

1. **브랜치 생성 및 체크아웃**

   ```bash
   # develop 브랜치에서 최신 코드 가져오기
   git checkout develop
   git pull origin develop

   # 새 기능 브랜치 생성
   git checkout -b feature/새로운-기능
   ```

2. **개발 및 커밋**

   ```bash
   # 변경사항 스테이징
   git add .

   # 의미있는 커밋 메시지로 커밋
   git commit -m "feat: 새로운 기능 추가"

   # 커밋 메시지 컨벤션
   # feat: 새로운 기능
   # fix: 버그 수정
   # docs: 문서 수정
   # style: 코드 포맷팅
   # refactor: 코드 리팩토링
   # test: 테스트 추가/수정
   # chore: 빌드/설정 관련
   ```

3. **로컬 테스트 및 빌드 (필수)**

   ```bash
   # 코드 린팅 및 포맷팅
   npm run lint
   npm run format

   # 단위 테스트 실행
   npm run test:unit

   # 통합 테스트 실행
   npm run test:integration

   # 빌드 테스트
   npm run build
   ```

4. **푸시 및 PR 생성**

   ```bash
   # 브랜치 푸시
   git push origin feature/새로운-기능

   # GitHub에서 Pull Request 생성
   # Base: develop ← Head: feature/새로운-기능
   ```

#### PR 가이드라인

**PR 생성 전 체크리스트:**

- [ ] 로컬 테스트 통과 (`npm run test`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] ESLint 오류 없음 (`npm run lint`)
- [ ] 의미있는 커밋 메시지
- [ ] 변경사항에 대한 설명 작성

**PR 템플릿:**

```markdown
## 📝 변경사항

- [ ] 새로운 기능 추가
- [ ] 버그 수정
- [ ] 문서 업데이트
- [ ] 리팩토링

## 🔍 상세 설명

변경사항에 대한 자세한 설명을 작성해주세요.

## 🧪 테스트

- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과 (해당하는 경우)
- [ ] 수동 테스트 완료

## 📸 스크린샷 (UI 변경사항이 있는 경우)

변경 전/후 스크린샷을 첨부해주세요.

## 🔗 관련 이슈

Closes #이슈번호
```

#### 브랜치 관리

```bash
# 브랜치 목록 확인
git branch -a

# 원격 브랜치 삭제 (PR 머지 후)
git push origin --delete feature/완료된-기능

# 로컬 브랜치 삭제
git branch -d feature/완료된-기능

# develop 브랜치로 돌아가서 최신화
git checkout develop
git pull origin develop
```

---

**Team Elliot Backend API** - 발레, 필라테스 등 인도어 운동 수강신청 플랫폼의 핵심 백엔드 서비스 🩰
