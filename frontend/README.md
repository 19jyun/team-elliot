# Team Elliot Frontend

발레 아카데미 관리 시스템의 프론트엔드 애플리케이션입니다. 학생, 강사, 원장의 역할별 대시보드를 제공하며, 수강신청, 수업 관리, 결제 등의 기능을 포함합니다.

## 🏗️ 아키텍처 특징

### SPA + Context 기반 구조

이 프로젝트는 일반적인 Next.js 라우팅 구조가 아닌 **SPA(Single Page Application) + Context 기반** 구조를 사용합니다:

- **실제 라우트**: `/auth`, `/dashboard` 2개만 사용
- **Context 기반 네비게이션**: `NavigationContext`를 통한 탭 및 서브페이지 관리
- **커스텀 goBack**: 브라우저 히스토리 대신 커스텀 네비게이션 히스토리 관리
- **Container 패턴**: 각 기능별 Container 컴포넌트로 모듈화

### 왜 이런 구조를 선택했나요?

1. **복잡한 다단계 프로세스**: 수강신청, 수강변경 등의 다단계 폼 처리에 최적화
2. **모바일 앱 경험**: 네이티브 앱과 유사한 사용자 경험 제공
3. **상태 유지**: 탭 간 전환 시 스크롤 위치, 폼 상태 등이 유지됨
4. **Capacitor 포팅 준비**: 향후 네이티브 앱으로 포팅할 때 유리한 구조

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn
- 백엔드 API 서버 (포트 3001)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp env.example .env.local

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 환경 변수 설정

`.env.local` 파일에 다음 변수들을 설정하세요:

```env
# API 엔드포인트
NEXT_PUBLIC_API_URL=http://localhost:3001

# 인증 관련
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# 기타 설정
NODE_ENV=development
```

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # 대시보드 라우트 그룹
│   │   └── dashboard/     # 메인 대시보드 페이지
│   ├── auth/              # 인증 페이지
│   └── api/               # API 라우트
├── components/            # 재사용 가능한 컴포넌트
│   ├── dashboard/         # 대시보드 관련 컴포넌트
│   ├── auth/              # 인증 관련 컴포넌트
│   └── common/            # 공통 컴포넌트
├── contexts/              # React Context들
│   ├── NavigationContext.tsx  # 네비게이션 상태 관리
│   ├── FormContext.tsx        # 폼 상태 관리
│   ├── UIContext.tsx          # UI 상태 관리
│   └── DataContext.tsx        # 데이터 상태 관리
├── hooks/                 # 커스텀 훅
├── store/                 # Redux 스토어
├── types/                 # TypeScript 타입 정의
└── utils/                 # 유틸리티 함수
```

## 🎯 주요 기능

### 역할별 대시보드

- **학생**: 수강신청, 수강 내역, 프로필 관리
- **강사**: 수업 관리, 학생 관리, 프로필 관리
- **원장**: 전체 수업 관리, 인원 관리, 아카데미 관리

### 핵심 기능

- 🔐 **인증 시스템**: NextAuth.js 기반 JWT 인증
- 📱 **반응형 디자인**: 모바일 우선 설계
- 💳 **결제 시스템**: 수강료 결제 및 환불 관리
- 📊 **실시간 업데이트**: Socket.io를 통한 실시간 알림
- 🎨 **모던 UI**: Tailwind CSS + Radix UI 컴포넌트

## 🛠️ 개발 도구

### 스크립트 명령어

```bash
# 개발
npm run dev              # 개발 서버 실행
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버 실행

# 코드 품질
npm run lint             # ESLint 실행
npm run lint:fix         # ESLint 자동 수정
npm run type-check       # TypeScript 타입 체크

# 테스트
npm run test             # 모든 테스트 실행
npm run test:watch       # 테스트 감시 모드
npm run test:coverage    # 커버리지 포함 테스트

# 배포
npm run deploy:preview   # Vercel 프리뷰 배포
npm run deploy:production # Vercel 프로덕션 배포

# Capacitor (네이티브 앱)
npm run build:capacitor        # 웹앱 빌드 + Capacitor sync
npm run build:capacitor:android # Android용 빌드 + Android Studio 열기
npm run build:capacitor:ios     # iOS용 빌드 + Xcode 열기
npm run cap:sync               # Capacitor sync만 실행
npm run cap:sync:android       # Android만 sync
npm run cap:sync:ios           # iOS만 sync
npm run cap:open:android       # Android Studio 열기
npm run cap:open:ios           # Xcode 열기
```

### 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Radix UI, Material-UI
- **상태 관리**: Redux Toolkit, React Context
- **데이터 페칭**: TanStack Query, Axios
- **인증**: NextAuth.js
- **실시간 통신**: Socket.io
- **애니메이션**: Framer Motion
- **테스팅**: Jest, Testing Library

## 🔄 Context 기반 상태 관리

### NavigationContext

```typescript
// 탭 및 서브페이지 관리
const { activeTab, subPage, navigateToSubPage, goBack } = useNavigation();

// 서브페이지 열기
navigateToSubPage("enroll");

// 뒤로가기
goBack();
```

### FormContext

```typescript
// 다단계 폼 상태 관리
const { enrollment, setEnrollmentStep } = useForm();

// 수강신청 단계 설정
setEnrollmentStep("date-selection");
```

## 📱 네이티브 앱 (Capacitor)

이 프로젝트는 Capacitor를 통해 Android와 iOS 네이티브 앱으로 빌드할 수 있습니다:

### Capacitor 설정

- **SPA 구조**: 네이티브 앱에 최적화된 단일 페이지 구조
- **커스텀 네비게이션**: 브라우저 히스토리 대신 커스텀 히스토리 관리
- **모바일 우선 설계**: 터치 인터페이스에 최적화된 UI/UX

### 네이티브 앱 빌드

```bash
# 웹앱 빌드 + Capacitor sync
npm run build:capacitor

# Android 앱 빌드 (Android Studio 필요)
npm run build:capacitor:android

# iOS 앱 빌드 (Xcode 필요)
npm run build:capacitor:ios
```

### 개발 워크플로우

1. **웹 개발**: `npm run dev`로 웹에서 개발
2. **네이티브 테스트**: `npm run build:capacitor`로 빌드 후 네이티브 앱에서 테스트
3. **플랫폼별 개발**: Android Studio 또는 Xcode에서 네이티브 기능 추가

### macOS 환경 설정

macOS에서 CocoaPods 인코딩 오류가 발생하는 경우:

```bash
# 터미널 인코딩 설정 (일시적)
export LANG=en_US.UTF-8

# 또는 영구적으로 설정
echo 'export LANG=en_US.UTF-8' >> ~/.zshrc
source ~/.zshrc
```

스크립트에는 이미 인코딩 설정이 포함되어 있어 별도 설정 없이도 사용 가능합니다.

## 🚀 배포

### Vercel 배포

현재 Vercel을 통한 자동 배포가 설정되어 있습니다:

- **프로덕션**: `main` 브랜치 푸시 시 자동 배포
- **프리뷰**: Pull Request 시 프리뷰 배포

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요
