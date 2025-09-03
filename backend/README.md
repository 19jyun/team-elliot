# 🩰 Team Elliot - Backend API

발레 학원 관리 시스템의 백엔드 API 서버입니다.

## 📋 프로젝트 개요

Team Elliot은 발레 학원의 수업 관리, 학생 관리, 결제 시스템을 통합적으로 제공하는 플랫폼입니다.

### 🎯 주요 기능

- **학원 관리**: 학원 정보, 강사, 학생 관리
- **수업 관리**: 수업 생성, 세션 관리, 출석 체크
- **결제 시스템**: 수업료 결제, 환불 처리
- **실시간 통신**: WebSocket을 통한 실시간 알림
- **권한 관리**: 학생/강사/원장별 역할 기반 접근 제어

## 🏗️ 기술 스택

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: JWT + Passport
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Container**: Docker + Docker Compose

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18+
- PostgreSQL 15+
- Docker (선택사항)

### 1. 저장소 클론

```bash
git clone <repository-url>
cd team-elliot/backend
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

```bash
cp env.example .env
```

`.env` 파일을 편집하여 다음 값들을 설정하세요:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/ballet_academy
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### 4. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 초기 데이터 시드 (선택사항)
npm run seed
```

### 5. 개발 서버 시작

```bash
npm run start:dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

## 📚 API 문서

### Swagger UI

개발 서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

```
http://localhost:3001/api
```

### Postman Collection

`postman/` 디렉토리에 API 테스트용 Postman 컬렉션이 포함되어 있습니다.

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

### 통합 테스트 환경 설정

```bash
# 테스트 데이터베이스 시작
npm run test:db:start

# 통합 테스트 실행
npm run test:integration

# 테스트 데이터베이스 정리
npm run test:db:stop
```

## 🏗️ 프로젝트 구조

```
src/
├── academy/          # 학원 관리
├── auth/            # 인증 및 권한 관리
├── ballet-pose/     # 발레 자세 관리
├── class/           # 수업 관리
├── class-session/   # 수업 세션 관리
├── payment/         # 결제 시스템
├── principal/       # 원장 관리
├── refund/          # 환불 처리
├── session-content/ # 세션 내용 관리
├── sms/             # SMS 서비스
├── socket/          # 실시간 통신
├── student/         # 학생 관리
└── teacher/         # 강사 관리
```

## 🔐 인증 및 권한

### 사용자 역할

- **STUDENT**: 학생 - 수업 신청, 출석 확인
- **TEACHER**: 강사 - 수업 관리, 출석 체크
- **PRINCIPAL**: 원장 - 학원 전체 관리

### JWT 인증

모든 보호된 API는 `Authorization: Bearer <token>` 헤더가 필요합니다.

## ⚙️ 공통 기능

### 응답 인터셉터

모든 API 응답은 일관된 형식으로 표준화됩니다:

```typescript
// 성공 응답
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/students"
}

// 에러 응답
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "BAD_REQUEST",
    "message": "잘못된 요청입니다.",
    "details": { ... }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/students"
}
```

#### 응답 변환 규칙

- **성공 응답**: `success: true`, `data` 필드에 실제 응답 데이터 포함
- **에러 응답**: `success: false`, `error` 필드에 에러 코드, 메시지, 상세 정보 포함
- **공통 필드**: `timestamp` (ISO 8601 형식), `path` (요청 URL)

#### 인터셉터 구현

```typescript
// src/common/interceptors/response.interceptor.ts
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
```

#### HTTP 예외 필터

```typescript
// src/common/filters/http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // ... 예외 처리 로직
    const errorResponse = {
      success: false,
      statusCode: status,
      error: {
        code: this.extractErrorCode(exceptionResponse),
        message: this.extractMessage(exceptionResponse),
        details: exceptionResponse,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }
}
```

#### 전역 적용

```typescript
// src/main.ts
app.useGlobalFilters(new HttpExceptionFilter());
app.useGlobalInterceptors(new ResponseInterceptor());
```

## 📁 파일 업로드

### 지원 형식

- **이미지**: JPG, PNG, WEBP
- **최대 크기**: 5MB
- **업로드 경로**: `/uploads/`

### 업로드 가능한 파일

- 프로필 사진
- 발레 자세 이미지
- 학원 관련 이미지

## 🐳 Docker

### 개발 환경

```bash
# 전체 스택 시작 (앱 + 데이터베이스)
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 스택 중지
docker-compose down
```

### 프로덕션 빌드

```bash
# 이미지 빌드
docker build -t team-elliot-backend .

# 컨테이너 실행
docker run -p 3000:3000 team-elliot-backend
```

## 🔧 개발 도구

### 코드 품질

```bash
# 코드 포맷팅
npm run format

# 린팅
npm run lint

# 린팅 자동 수정
npm run lint:fix
```

### 데이터베이스 관리

```bash
# Prisma Studio (데이터베이스 GUI)
npx prisma studio

# 데이터베이스 리셋
npm run db:reset

# 데이터베이스 리셋 + 시드
npm run db:reset:seed
```

## 📊 모니터링

### 헬스체크

```
GET /health
```

### 로그 확인

```bash
# Docker 로그
docker logs <container-name>

# 애플리케이션 로그
npm run start:dev
```

## 🚀 배포

자세한 배포 정보는 다음 문서를 참조하세요:

- [배포 가이드](./DEPLOYMENT.md)
- [CI/CD 설정](./CICD_README.md)

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

## 📄 라이선스

이 프로젝트는 팀 내부용으로 개발되었습니다.

---

**Team Elliot Backend Team** 🩰
