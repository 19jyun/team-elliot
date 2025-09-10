# Frontend Deployment Guide

이 문서는 프론트엔드 애플리케이션의 Vercel 배포 가이드입니다.

## 🚀 배포 개요

- **플랫폼**: Vercel
- **배포 방식**: GitHub Actions를 통한 자동 배포
- **브랜치 전략**: main 브랜치 푸시 시 프로덕션 배포

## 📋 사전 준비

### 1. Vercel 계정 설정

1. [Vercel](https://vercel.com) 계정 생성
2. GitHub 계정과 연결
3. Vercel CLI 설치:
   ```bash
   npm i -g vercel
   ```

### 2. 프로젝트 초기 설정

```bash
cd frontend
npm run setup:vercel
```

이 스크립트는 다음을 수행합니다:

- Vercel 프로젝트 초기화
- 필요한 설정 정보 출력
- GitHub Secrets 설정 가이드 제공

## 🔐 GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿들을 추가하세요:

### 필수 시크릿

| 시크릿 이름         | 설명               | 획득 방법                                                   |
| ------------------- | ------------------ | ----------------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel API 토큰    | [Vercel Tokens](https://vercel.com/account/tokens)에서 생성 |
| `VERCEL_ORG_ID`     | Vercel 조직 ID     | Vercel 대시보드 > Settings > General                        |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID | Vercel 대시보드 > Settings > General                        |

### Vercel 토큰 생성 방법

1. [Vercel Tokens 페이지](https://vercel.com/account/tokens) 방문
2. "Create Token" 클릭
3. 토큰 이름 입력 (예: "GitHub Actions")
4. 토큰 복사하여 GitHub Secrets에 추가

### 프로젝트 정보 확인 방법

1. Vercel 대시보드에서 프로젝트 선택
2. Settings > General 이동
3. 다음 정보 확인:
   - **Organization ID**: `VERCEL_ORG_ID`로 설정
   - **Project ID**: `VERCEL_PROJECT_ID`로 설정

## 🌍 환경 변수 설정

### Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수들을 설정하세요:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_WS_URL=wss://your-backend-api.com

# Authentication
NEXTAUTH_URL=https://your-frontend-domain.com
NEXTAUTH_SECRET=your-production-secret-key

# Environment
NODE_ENV=production
```

### 환경별 설정

- **Production**: 프로덕션 API URL 및 도메인
- **Preview**: 스테이징 API URL 및 도메인
- **Development**: 로컬 개발 환경 설정

## 🔄 배포 프로세스

### 자동 배포

1. **main 브랜치 푸시**: 프로덕션 배포 자동 실행
2. **Pull Request**: 프리뷰 배포 자동 실행
3. **배포 상태**: GitHub Actions에서 확인 가능

### 수동 배포

```bash
# 프리뷰 배포
npm run deploy:preview

# 프로덕션 배포
npm run deploy:production
```

## 📊 배포 모니터링

### GitHub Actions

- **워크플로우**: `.github/workflows/frontend-ci-cd.yml`
- **단계**: 테스트 → 빌드 → 보안 감사 → 배포
- **로그**: GitHub Actions 탭에서 확인

### Vercel 대시보드

- **배포 상태**: 실시간 배포 진행 상황
- **성능 메트릭**: Core Web Vitals 및 성능 지표
- **에러 로그**: 런타임 에러 및 예외 상황

## 🛠️ 문제 해결

### 일반적인 문제들

#### 1. 빌드 실패

```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 체크
npm run type-check

# 린팅
npm run lint
```

#### 2. 환경 변수 문제

- Vercel 대시보드에서 환경 변수 확인
- 변수명이 `NEXT_PUBLIC_`로 시작하는지 확인
- 재배포 후 브라우저 캐시 클리어

#### 3. API 연결 문제

- CORS 설정 확인
- API URL이 올바른지 확인
- 네트워크 탭에서 요청 상태 확인

### 로그 확인

```bash
# Vercel 로그 확인
vercel logs

# 특정 배포 로그 확인
vercel logs [deployment-url]
```

## 🔧 고급 설정

### 커스텀 도메인

1. Vercel 대시보드 > Domains
2. 도메인 추가
3. DNS 설정 업데이트

### 성능 최적화

- **이미지 최적화**: Next.js Image 컴포넌트 사용
- **코드 분할**: 동적 import 활용
- **캐싱**: Vercel Edge Network 활용

### 보안 설정

- **HTTPS**: 자동 적용
- **보안 헤더**: `next.config.ts`에서 설정
- **환경 변수**: 민감한 정보는 서버 사이드에서만 사용

## 📚 추가 리소스

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel CLI](https://vercel.com/docs/cli)

## 🆘 지원

문제가 발생하면 다음을 확인하세요:

1. GitHub Actions 로그
2. Vercel 배포 로그
3. 브라우저 개발자 도구
4. 네트워크 탭

추가 도움이 필요하면 팀에 문의하세요.
