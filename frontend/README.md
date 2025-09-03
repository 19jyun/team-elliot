# 🩰 Team Elliot - Frontend

발레 학원 관리 시스템의 프론트엔드 웹 애플리케이션입니다.

## 📋 프로젝트 개요

Team Elliot 프론트엔드는 발레 학원 운영에 필요한 모든 기능을 제공하는 현대적인 웹 애플리케이션입니다. 학생들의 수업 신청부터 출석 관리, 결제 처리까지 직관적인 UI/UX로 제공합니다.

### 🎯 주요 기능

- **학원 관리**: 학원 정보, 강사, 학생 통합 관리
- **수업 관리**: 수업 생성, 세션 관리, 출석 체크
- **결제 시스템**: 수업료 결제, 환불 처리, 정산 관리
- **실시간 통신**: WebSocket을 통한 실시간 알림 및 채팅
- **권한 관리**: 학생/강사/원장별 역할 기반 접근 제어
- **모바일 지원**: 반응형 웹 디자인으로 모든 디바이스 지원

## 🏗️ 기술 스택

### Frontend Framework

- **Next.js 15.0.3**: App Router 기반의 React 프레임워크
- **TypeScript 5.x**: 타입 안전성과 개발 생산성 향상
- **React 18.2.0**: 최신 React 기능과 동시성 모드

### Styling & UI

- **Tailwind CSS 3.4.1**: 유틸리티 기반 CSS 프레임워크
- **Radix UI**: 접근성을 고려한 헤드리스 UI 컴포넌트
- **Material-UI (MUI) 6.1.9**: React 컴포넌트 라이브러리
- **Headless UI**: 접근성 고려한 UI 컴포넌트
- **Heroicons**: SVG 아이콘 시스템
- **Framer Motion 11.18.2**: 부드러운 애니메이션과 전환 효과

### State Management

- **Redux Toolkit 2.8.2**: 전역 상태 관리 및 비동기 로직
- **React Redux 9.2.0**: React와 Redux 연결
- **TanStack React Query 5.62.0**: 서버 상태 관리 및 캐싱
- **React Hook Form 7.53.2**: 폼 상태 관리 및 유효성 검사

#### Redux Store 구조

```typescript
// src/store/index.ts
export const store = configureStore({
  reducer: {
    common: commonReducer, // 공통 상태
    teacher: teacherReducer, // 강사 관련 상태
    principal: principalReducer, // 원장 관련 상태
    student: studentReducer, // 학생 관련 상태
    ui: uiReducer, // UI 상태
  },
});
```

### Authentication & Session

- **NextAuth.js 4.24.11**: 인증 및 세션 관리
- **JWT**: JSON Web Token 기반 인증

### Real-time & Communication

- **Socket.io Client 4.8.1**: 실시간 통신
- **Axios 1.7.8**: HTTP 클라이언트

### Development Tools

- **ESLint**: 코드 품질 관리
- **TypeScript**: 정적 타입 검사
- **Prisma 6.0.0**: 데이터베이스 ORM
- **Tailwind CSS**: 유틸리티 기반 CSS

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18+
- npm, yarn, pnpm, 또는 bun
- Backend API 서버 실행 중

### 1. 저장소 클론

```bash
git clone <repository-url>
cd team-elliot/frontend
```

### 2. 의존성 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 3. 환경변수 설정

```bash
cp env.example .env.local
```

`.env.local` 파일을 편집하여 다음 값들을 설정하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
# 소켓 연결은 API URL과 동일한 서버 사용
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 4. 개발 서버 시작

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 🏗️ 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (dashboard)/       # 대시보드 페이지
│   │   ├── dashboard/     # 역할별 대시보드
│   │   │   ├── student/   # 학생 대시보드
│   │   │   ├── teacher/   # 강사 대시보드
│   │   │   └── principal/ # 원장 대시보드
│   │   └── withdrawal/    # 회원 탈퇴
│   ├── api/               # API 라우트
│   │   ├── auth/          # 인증 관련 API
│   │   ├── classes/       # 수업 관련 API
│   │   └── class-sessions/# 세션 관련 API
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
├── components/             # 재사용 가능한 컴포넌트
│   ├── auth/              # 인증 관련 컴포넌트
│   ├── calendar/          # 캘린더 컴포넌트
│   ├── class/             # 수업 관련 컴포넌트
│   ├── common/            # 공통 컴포넌트
│   │   ├── ClassContainer # 수업 컨테이너
│   │   ├── DateSessionModal# 날짜별 세션 모달
│   │   ├── Session/       # 세션 관련 컴포넌트
│   │   ├── Socket/        # 소켓 컴포넌트
│   │   └── WheelPicker   # 휠 피커 컴포넌트
│   ├── dashboard/         # 대시보드 컴포넌트
│   │   ├── principal/     # 원장 대시보드
│   │   ├── student/       # 학생 대시보드
│   │   └── teacher/       # 강사 대시보드
│   ├── features/          # 기능별 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
│   ├── navigation/        # 네비게이션 컴포넌트
│   ├── teacher/           # 강사 전용 컴포넌트
│   ├── ui/                # 기본 UI 컴포넌트
│   └── user/              # 사용자 관련 컴포넌트
├── contexts/               # React Context
│   └── AuthContext.tsx    # 인증 컨텍스트
├── decorators/             # 데코레이터
│   └── withFocusManagement.tsx # 포커스 관리
├── hooks/                  # 커스텀 훅
│   ├── calendar/          # 캘린더 관련 훅
│   ├── principal/         # 원장 관련 훅
│   ├── redux/             # Redux 관련 훅
│   ├── socket/            # 소켓 통신 훅
│   ├── student/           # 학생 관련 훅
│   └── teacher/           # 강사 관련 훅
├── lib/                    # 유틸리티 함수
│   ├── axios.ts           # HTTP 클라이언트 설정
│   ├── socket.ts          # 소켓 연결 관리
│   ├── errorHandler.ts    # 에러 처리
│   ├── timeUtils.ts       # 시간 관련 유틸리티
│   ├── utils.ts           # 일반 유틸리티
│   └── focus/             # 포커스 관리
├── store/                  # Redux 상태 관리
│   ├── slices/            # Redux 슬라이스
│   │   ├── commonSlice.ts # 공통 상태
│   │   ├── teacherSlice.ts# 강사 상태
│   │   ├── principalSlice.ts # 원장 상태
│   │   ├── studentSlice.ts# 학생 상태
│   │   └── uiSlice.ts     # UI 상태
│   └── index.ts           # 스토어 설정
├── types/                  # TypeScript 타입 정의
│   ├── api/               # API 관련 타입
│   │   ├── auth.ts        # 인증 API 타입
│   │   ├── class.ts       # 수업 API 타입
│   │   ├── student.ts     # 학생 API 타입
│   │   ├── teacher.ts     # 강사 API 타입
│   │   ├── principal.ts   # 원장 API 타입
│   │   ├── refund.ts      # 환불 API 타입
│   │   └── index.ts       # API 타입 통합
│   ├── store/             # 스토어 타입
│   │   ├── common.ts      # 공통 스토어 타입
│   │   ├── teacher.ts     # 강사 스토어 타입
│   │   ├── principal.ts   # 원장 스토어 타입
│   │   ├── student.ts     # 학생 스토어 타입
│   │   └── index.ts       # 스토어 타입 통합
│   ├── auth.ts            # 인증 관련 타입
│   ├── socket.ts          # 소켓 관련 타입
│   └── index.ts           # 타입 통합
└── utils/                  # 유틸리티 함수
```

## 🔐 인증 및 권한

### 사용자 역할

- **STUDENT**: 학생 - 수업 신청, 출석 확인, 결제
- **TEACHER**: 강사 - 수업 관리, 출석 체크, 학생 관리
- **PRINCIPAL**: 원장 - 학원 전체 관리, 통계 확인

### 인증 시스템

#### NextAuth.js 기반 인증

- **JWT 토큰**: JSON Web Token 기반 인증
- **세션 관리**: 서버 사이드 세션 관리
- **자동 갱신**: 토큰 만료 시 자동 갱신

#### 인증 컨텍스트 (AuthContext)

```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  authMode: "login" | "signup";
  signup: SignupState;
  login: LoginState;
  // 회원가입 단계 관리
  setSignupStep: (step: SignupStep) => void;
  setRole: (role: "STUDENT" | "TEACHER") => void;
}
```

#### 회원가입 단계

1. **역할 선택**: STUDENT 또는 TEACHER
2. **개인 정보**: 이름, 전화번호
3. **계정 정보**: 사용자 ID, 비밀번호
4. **약관 동의**: 나이, 서비스 약관, 마케팅 동의

### 보안 기능

- **세션 캐싱**: 5분간 세션 정보 캐싱
- **자동 로그아웃**: 401/403 에러 시 자동 로그아웃
- **권한 검사**: 역할 기반 접근 제어 (RBAC)

## 🎨 UI/UX 특징

### 디자인 시스템

- **일관된 색상**: 브랜드 컬러를 기반으로 한 색상 팔레트
- **타이포그래피**: 가독성 높은 폰트 시스템
- **간격 시스템**: 8px 기반의 일관된 간격
- **그림자**: 깊이감을 표현하는 그림자 시스템

### 반응형 디자인

- **모바일 퍼스트**: 모바일 우선 설계
- **브레이크포인트**: sm, md, lg, xl, 2xl
- **터치 친화적**: 모바일 터치 인터페이스 최적화

### 접근성

- **ARIA 라벨**: 스크린 리더 지원
- **키보드 네비게이션**: 키보드만으로 모든 기능 사용 가능
- **색상 대비**: WCAG 2.1 AA 기준 준수
- **포커스 표시**: 명확한 포커스 인디케이터

## 📱 주요 페이지

### 공개 페이지

- **홈페이지**: 서비스 소개 및 로그인
- **학원 소개**: 학원 정보 및 강사 소개
- **수업 안내**: 수업 프로그램 및 커리큘럼

### 인증 페이지

- **로그인**: 사용자 인증
- **회원가입**: 신규 사용자 등록
- **비밀번호 찾기**: 비밀번호 재설정

### 대시보드

- **학생 대시보드**: 수업 신청, 출석 확인, 결제 내역
- **강사 대시보드**: 수업 관리, 출석 체크, 학생 관리
- **원장 대시보드**: 학원 통계, 강사 관리, 수익 분석

## 🔌 API 통신

### HTTP 클라이언트 (Axios)

```typescript
// src/lib/axios.ts
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 요청 인터셉터 - JWT 토큰 자동 추가
axiosInstance.interceptors.request.use(async (config) => {
  const session = await getCachedSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// 응답 인터셉터 - 에러 처리 및 자동 로그아웃
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      await signOut({ redirect: false });
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);
```

### 세션 관리

- **세션 캐싱**: 5분간 세션 정보 캐싱으로 성능 향상
- **자동 인증**: 모든 API 요청에 JWT 토큰 자동 추가
- **에러 처리**: 401/403 에러 시 자동 로그아웃 및 리다이렉트

### 에러 처리

- **HTTP 상태 코드**: 적절한 에러 메시지 표시
- **네트워크 에러**: 연결 실패 시 재시도 로직
- **사용자 친화적**: 기술적 용어 대신 이해하기 쉬운 메시지

## 📡 실시간 통신

### Socket.IO 클라이언트

```typescript
// src/lib/socket.ts
export const initializeSocket = async (): Promise<Socket> => {
  const session = await getSession();
  const token = session?.accessToken;

  socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // 연결 이벤트 리스너
  socket.on("connect", () => {
    console.log("✅ 소켓 연결 성공:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 소켓 연결 해제:", reason);
  });

  return socket;
};
```

### 연결 관리

- **자동 재연결**: 연결 끊김 시 최대 5회 재연결 시도
- **세션 기반**: JWT 토큰을 통한 인증된 연결
- **이중 전송**: WebSocket과 Polling 모두 지원

### 실시간 기능

- **알림**: 수업 변경, 결제 완료 등 실시간 알림
- **채팅**: 강사와 학생 간 실시간 소통
- **출석 체크**: 실시간 출석 상태 업데이트

## 🧪 테스트

### 테스트 실행

```bash
# 단위 테스트
npm run test

# 테스트 커버리지
npm run test:coverage

# E2E 테스트
npm run test:e2e

# 테스트 감시 모드
npm run test:watch
```

### 테스트 구조

- **Unit Tests**: 개별 컴포넌트 및 함수 테스트
- **Integration Tests**: 컴포넌트 간 상호작용 테스트
- **E2E Tests**: 사용자 시나리오 기반 테스트

## 🚀 빌드 및 배포

### 개발 빌드

```bash
# 개발용 빌드
npm run build:dev

# 프로덕션용 빌드
npm run build
```

### 배포 환경

- **Vercel**: Next.js 최적화된 호스팅 플랫폼
- **Netlify**: 정적 사이트 호스팅
- **AWS S3 + CloudFront**: 정적 웹사이트 호스팅

### 환경별 설정

```bash
# 개발 환경
npm run dev

# 스테이징 환경
npm run build:staging
npm run start:staging

# 프로덕션 환경
npm run build:production
npm run start:production
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

# 타입 체크
npm run type-check
```

### 개발 서버

```bash
# 개발 서버 시작
npm run dev

# 포트 변경
npm run dev -- -p 3001

# HTTPS 모드
npm run dev -- --https
```

## 📊 성능 최적화

### Next.js 최적화

- **Image Optimization**: 자동 이미지 최적화
- **Code Splitting**: 자동 코드 분할
- **Static Generation**: 정적 사이트 생성
- **Incremental Static Regeneration**: 증분 정적 재생성

### 번들 최적화

- **Tree Shaking**: 사용하지 않는 코드 제거
- **Dynamic Imports**: 동적 임포트로 초기 번들 크기 감소
- **Bundle Analyzer**: 번들 크기 분석 및 최적화

## 🐛 문제 해결

### 일반적인 문제

#### 개발 서버가 시작되지 않음

```bash
# 포트 확인
lsof -i :3000

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 빌드 오류

```bash
# TypeScript 오류 확인
npm run type-check

# 캐시 정리
npm run build -- --no-cache
```

#### 환경변수 문제

```bash
# .env.local 파일 확인
cat .env.local

# 환경변수 로드 확인
npm run dev
```

## 🤝 기여하기

### 개발 워크플로우

1. feat/fix 브랜치에서 작업
2. Pull Request 생성
3. 코드 리뷰 후 `main` 브랜치로 병합

해당 프로젝트는 Trunk-based Development 방식을 사용합니다. 즉, development 브랜치를 별도로 사용하지 않습니다.
로컬 환경에서 테스팅을 진행한 후에 PR을 진행해주세요.

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

### 코드 스타일

- **ESLint**: 프로젝트 규칙 준수
- **Prettier**: 일관된 코드 포맷팅
- **TypeScript**: 엄격한 타입 체크

## 📚 추가 리소스

### 공식 문서

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs)

### 프로젝트 문서

- [Backend README](../backend/README.md)
- [API 사용 가이드](../backend/API_USAGE_GUIDE.md)
- [개발 환경 설정 가이드](../backend/DEVELOPMENT_SETUP_GUIDE.md)

### 유용한 링크

- [Next.js GitHub](https://github.com/vercel/next.js)
- [React GitHub](https://github.com/facebook/react)
- [Tailwind CSS GitHub](https://github.com/tailwindlabs/tailwindcss)

## 📞 지원

### 문제 해결

1. [Issues](../../issues)에서 기존 문제 확인
2. 새로운 이슈 생성
3. 팀원과 논의

### 개발 환경 문제

- Node.js 버전 확인 (18+)
- 환경변수 설정 확인
- Backend API 서버 연결 확인

## 📄 라이선스

이 프로젝트는 팀 내부용으로 개발되었습니다.

---

**Team Elliot Frontend Team** 🩰

> 사용자 경험을 우선시하는 현대적인 웹 애플리케이션을 만들어갑니다.
