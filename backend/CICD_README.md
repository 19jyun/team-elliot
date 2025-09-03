# 백엔드 CI/CD 설정

이 문서는 백엔드 서비스의 CI/CD 파이프라인 설정을 설명합니다.

## 개요

CI/CD 파이프라인은 GitHub Actions를 사용하여 구성되며, 다음과 같은 단계를 포함합니다:

1. **테스팅** - 린팅, 단위 테스트, E2E 테스트 실행
2. **빌드** - 애플리케이션 빌드 및 아티팩트 생성
3. **보안** - 보안 감사 실행
4. **배포** - 스테이징(develop 브랜치) 및 프로덕션(main 브랜치) 환경에 배포

## 워크플로우 파일

- `.github/workflows/ci-cd.yml` - 메인 CI/CD 워크플로우

## Docker 설정

- `Dockerfile` - 프로덕션용 멀티스테이지 Docker 빌드
- `docker-compose.yml` - PostgreSQL을 포함한 로컬 개발 환경 설정
- `.dockerignore` - Docker 빌드에서 불필요한 파일 제외
- `health-check.js` - Docker 컨테이너용 헬스체크 스크립트

## 로컬 개발

### Docker Compose 사용

```bash
# 전체 스택 시작 (앱 + 데이터베이스)
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 스택 중지
docker-compose down
```

### 로컬 개발 환경 사용

```bash
# 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 실행
npx prisma migrate dev

# 개발 서버 시작
npm run start:dev
```

## 환경 변수

백엔드 디렉토리에 다음 변수들을 포함한 `.env` 파일을 생성하세요:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## CI/CD 파이프라인

### 트리거

파이프라인은 다음 상황에서 실행됩니다:

- `main` 또는 `develop` 브랜치에 푸시
- `main` 또는 `develop` 브랜치로의 Pull Request
- `backend/` 디렉토리에 변경사항이 있을 때만

### 작업

1. **test** - PostgreSQL 서비스와 함께 모든 테스트 실행
2. **build** - 애플리케이션 빌드 및 아티팩트 업로드
3. **security** - 보안 감사 실행
4. **deploy-staging** - 스테이징 환경에 배포 (develop 브랜치)
5. **deploy-production** - 프로덕션 환경에 배포 (main 브랜치)

### 배포

배포 작업은 현재 플레이스홀더 작업입니다. 인프라에 따라 특정 배포 명령을 추가해야 합니다:

- **스테이징**: `develop`에 푸시할 때 스테이징 환경에 배포
- **프로덕션**: `main`에 푸시할 때 프로덕션 환경에 배포

### 환경 시크릿

GitHub 저장소에 다음 시크릿을 설정하세요:

- `DATABASE_URL` - 프로덕션 데이터베이스 URL
- `JWT_SECRET` - 프로덕션용 JWT 시크릿
- `NODE_ENV` - 환경 (production/staging)

## 보안

파이프라인에는 다음이 포함됩니다:

- `npm audit`을 사용한 보안 감사
- Docker 컨테이너에서 비루트 사용자
- 컨테이너용 헬스체크
- 환경별 설정

## 모니터링

- 헬스체크 엔드포인트: `/health`
- Docker 헬스체크 구성
- 프로덕션용 로깅 구성

## 다음 단계

1. 배포 환경 구성 (AWS, GCP, Azure 등)
2. GitHub에 환경 시크릿 설정
3. 프로덕션용 데이터베이스 구성
4. 모니터링 및 로깅 설정
5. SSL 인증서 구성
6. 백업 전략 설정
