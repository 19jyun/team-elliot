# Frontend CI/CD Setup

이 문서는 프론트엔드 서비스의 CI/CD 파이프라인 설정을 설명합니다.

## 개요

CI/CD 파이프라인은 GitHub Actions를 사용하여 구성되며 다음 단계를 포함합니다:

1. **테스트** - 린팅, 타입 체크, 빌드 테스트 실행
2. **빌드** - 애플리케이션 빌드 및 아티팩트 생성
3. **보안** - 보안 감사 실행
4. **배포** - Vercel을 통한 스테이징 및 프로덕션 배포

## 워크플로우 파일

- `.github/workflows/frontend-ci-cd.yml` - 메인 CI/CD 워크플로우

## 로컬 개발

### 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

### 빌드 및 테스트

```bash
# 린팅 실행
npm run lint

# 타입 체크
npx tsc --noEmit

# 프로덕션 빌드
npm run build

# 빌드된 앱 실행
npm start
```

## 환경 변수

프론트엔드 디렉토리에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# API 엔드포인트
NEXT_PUBLIC_API_URL=http://localhost:3001

# 인증 관련
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# 기타 설정
NODE_ENV=development
```

## CI/CD 파이프라인

### 트리거

파이프라인은 다음 상황에서 실행됩니다:

- `main` 브랜치로 푸시할 때
- `main` 브랜치로의 풀 리퀘스트
- `frontend/` 디렉토리에서 변경사항이 있을 때만

### 작업

1. **test** - 린팅, 타입 체크, 빌드 테스트 실행
2. **build** - 애플리케이션 빌드 및 아티팩트 업로드
3. **security** - 보안 감사 실행
4. **deploy-staging** - 스테이징 환경 배포 (풀 리퀘스트)
5. **deploy-production** - 프로덕션 환경 배포 (main 브랜치 푸시)

### 배포

배포는 Vercel을 통해 자동으로 처리됩니다:

- **스테이징**: 풀 리퀘스트 시 Vercel 프리뷰 배포
- **프로덕션**: main 브랜치 푸시 시 Vercel 프로덕션 배포

### 환경 시크릿

GitHub 저장소에서 다음 시크릿들을 설정하세요:

- `VERCEL_TOKEN` - Vercel 배포용 토큰
- `VERCEL_ORG_ID` - Vercel 조직 ID
- `VERCEL_PROJECT_ID` - Vercel 프로젝트 ID

### Vercel 토큰 생성 방법

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. Settings > Tokens 이동
3. "Create Token" 클릭하여 새 토큰 생성
4. 토큰을 GitHub Secrets에 추가

### Vercel 프로젝트 설정

1. Vercel에서 새 프로젝트 생성
2. GitHub 저장소 연결
3. 프로젝트 설정에서 다음 정보 확인:
   - Organization ID
   - Project ID

## 보안

파이프라인에는 다음이 포함됩니다:

- `npm audit`를 사용한 보안 감사
- 높은 수준의 보안 취약점 감지
- 보안 보고서 생성 및 저장

## 모니터링

- Vercel 대시보드에서 배포 상태 확인
- GitHub Actions에서 빌드 로그 확인
- Vercel Analytics로 성능 모니터링

## 다음 단계

1. Vercel 프로젝트 설정 및 연결
2. GitHub Secrets 설정
3. 환경 변수 구성
4. 도메인 설정 및 SSL 인증서
5. 모니터링 및 로깅 설정
6. 성능 최적화

## 문제 해결

### 빌드 실패

- `npm run build` 로컬에서 실행하여 오류 확인
- 타입 오류나 의존성 문제 해결

### 배포 실패

- Vercel 토큰 및 프로젝트 ID 확인
- 환경 변수 설정 확인
- Vercel 대시보드에서 배포 로그 확인

### 보안 감사 실패

- `npm audit` 로컬에서 실행
- 취약점이 있는 패키지 업데이트
- 필요시 `npm audit fix` 실행
