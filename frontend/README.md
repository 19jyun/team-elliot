# 🩰 Team Elliot Frontend

발레 아카데미 관리 시스템의 프론트엔드 애플리케이션입니다. 학생, 강사, 원장의 역할별 대시보드를 제공하며, 수강신청, 수업 관리, 결제 등의 기능을 포함합니다.

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [기술 스택](#-기술-스택)
- [주요 기능](#-주요-기능)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [개발 가이드](#-개발-가이드)
- [테스트](#-테스트)
- [배포](#-배포)
- [문서](#-문서)

## 🎯 프로젝트 개요

### 아키텍처 특징

이 프로젝트는 **SPA(Single Page Application) + Context 기반** 구조를 사용합니다:

- **실제 라우트**: `/auth`, `/dashboard` 2개만 사용
- **Context 기반 네비게이션**: `NavigationContext`를 통한 탭 및 서브페이지 관리
- **커스텀 goBack**: 브라우저 히스토리 대신 커스텀 네비게이션 히스토리 관리
- **Container 패턴**: 각 기능별 Container 컴포넌트로 모듈화

### 왜 이런 구조를 선택했나요?

1. **복잡한 다단계 프로세스**: 수강신청, 수강변경 등의 다단계 폼 처리에 최적화
2. **모바일 앱 경험**: 네이티브 앱과 유사한 사용자 경험 제공
3. **상태 유지**: 탭 간 전환 시 스크롤 위치, 폼 상태 등이 유지됨
4. **Capacitor 포팅 준비**: 향후 네이티브 앱으로 포팅할 때 유리한 구조

## 🛠️ 기술 스택

### 핵심 프레임워크

- **Next.js 15** (App Router) - React 프레임워크
- **TypeScript 5** - 정적 타입 검사
- **React 18** - UI 라이브러리

### 스타일링 & UI

- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Radix UI** - 접근성이 좋은 헤드리스 UI 컴포넌트
- **Material-UI** - React UI 컴포넌트 라이브러리
- **Framer Motion** - 애니메이션 라이브러리

### 상태 관리

- **Redux Toolkit** - 전역 상태 관리
- **React Context** - 컴포넌트 간 상태 공유
- **TanStack Query** - 서버 상태 관리 및 캐싱

### 인증 & 통신

- **NextAuth.js** - 인증 솔루션
- **Axios** - HTTP 클라이언트
- **Socket.io** - 실시간 통신

### 개발 도구

- **Jest** - 테스트 프레임워크
- **Testing Library** - 컴포넌트 테스트
- **ESLint** - 코드 린팅
- **Prettier** - 코드 포맷팅

## ✨ 주요 기능

### 역할별 대시보드

#### 👨‍🎓 학생 (STUDENT)

- **수강신청**: 달력 기반 수강신청 시스템
- **수강 내역**: 수강한 클래스 및 세션 조회
- **프로필 관리**: 개인정보 수정 및 관리
- **결제 관리**: 수강료 결제 및 환불 신청

#### 👩‍🏫 강사 (TEACHER)

- **수업 관리**: 담당 클래스 및 세션 관리
- **학생 관리**: 수강생 목록 및 출석 관리
- **프로필 관리**: 강사 프로필 및 경력 관리
- **일정 관리**: 수업 일정 및 가능 시간 설정

#### 👨‍💼 원장 (PRINCIPAL)

- **전체 수업 관리**: 모든 클래스 및 세션 관리
- **인원 관리**: 수강신청 승인/거부, 환불 처리
- **아카데미 관리**: 학원 정보 및 설정 관리
- **통계 및 리포트**: 수강 현황 및 매출 분석

### 핵심 기능

- 🔐 **JWT 기반 인증**: NextAuth.js를 통한 안전한 인증
- 📱 **반응형 디자인**: 모바일 우선 설계
- 💳 **결제 시스템**: 수강료 결제 및 환불 관리
- 📊 **실시간 업데이트**: Socket.io를 통한 실시간 알림
- 🎨 **모던 UI**: Tailwind CSS + Radix UI 컴포넌트
- 📅 **달력 시스템**: 수강신청 및 일정 관리
- 🔄 **상태 동기화**: Context 기반 상태 관리

## 🚀 시작하기

### 사전 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상 또는 **yarn**: 1.22.0 이상
- **백엔드 API 서버**: 포트 3001에서 실행 중

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd frontend

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
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # 대시보드 라우트 그룹
│   │   ├── dashboard/           # 메인 대시보드 페이지
│   │   ├── layout.tsx           # 대시보드 레이아웃
│   │   └── withdrawal/          # 회원탈퇴 페이지
│   ├── auth/                    # 인증 페이지
│   ├── api/                     # API 라우트
│   ├── globals.css              # 전역 스타일
│   ├── layout.tsx               # 루트 레이아웃
│   └── page.tsx                 # 홈페이지
├── components/                   # 재사용 가능한 컴포넌트
│   ├── auth/                    # 인증 관련 컴포넌트
│   ├── calendar/                # 달력 컴포넌트
│   ├── common/                  # 공통 컴포넌트
│   ├── dashboard/               # 대시보드 관련 컴포넌트
│   ├── features/                # 기능별 컴포넌트
│   ├── icons/                   # 아이콘 컴포넌트
│   ├── layout/                  # 레이아웃 컴포넌트
│   ├── navigation/              # 네비게이션 컴포넌트
│   ├── ui/                      # UI 컴포넌트
│   └── user/                    # 사용자 관련 컴포넌트
├── contexts/                     # React Context들
│   ├── AppContext.tsx           # 통합 앱 컨텍스트
│   ├── CalendarContext.tsx      # 달력 상태 관리
│   ├── DataContext.tsx          # 데이터 상태 관리
│   ├── UIContext.tsx            # UI 상태 관리
│   ├── events/                  # 이벤트 시스템
│   ├── forms/                   # 폼 상태 관리
│   ├── navigation/              # 네비게이션 상태 관리
│   └── state/                   # 상태 동기화
├── hooks/                        # 커스텀 훅
│   ├── calendar/                # 달력 관련 훅
│   ├── principal/               # 원장 관련 훅
│   ├── redux/                   # Redux 관련 훅
│   ├── socket/                  # 소켓 관련 훅
│   ├── student/                 # 학생 관련 훅
│   └── teacher/                 # 강사 관련 훅
├── lib/                          # 라이브러리 설정
│   ├── adapters/                # 어댑터 패턴
│   ├── axios.ts                 # Axios 설정
│   ├── errorHandler.ts          # 에러 처리
│   ├── socket.ts                # 소켓 설정
│   └── utils.ts                 # 유틸리티 함수
├── store/                        # Redux 스토어
│   ├── hooks.ts                 # Redux 훅
│   ├── index.ts                 # 스토어 설정
│   └── slices/                  # Redux 슬라이스
├── types/                        # TypeScript 타입 정의
│   ├── api/                     # API 타입
│   ├── store/                   # 스토어 타입
│   ├── ui/                      # UI 타입
│   └── view/                    # 뷰 타입
└── utils/                        # 유틸리티 함수
    ├── academyUtils.ts          # 학원 관련 유틸리티
    ├── dateTime.ts              # 날짜/시간 유틸리티
    ├── formatting.ts            # 포맷팅 유틸리티
    └── validation.ts            # 검증 유틸리티
```

## 🔧 개발 가이드

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
npm run test:unit        # 단위 테스트만 실행
npm run test:integration # 통합 테스트만 실행

# 유지보수
npm run clean            # 빌드 파일 정리
npm run build:analyze    # 번들 분석

# 배포
npm run deploy:preview   # Vercel 프리뷰 배포
npm run deploy:production # Vercel 프로덕션 배포
```

### Context 기반 상태 관리

#### AppContext (통합 컨텍스트)

```typescript
// 통합된 앱 컨텍스트 사용
const { navigation, forms, ui, data, session } = useApp();

// 네비게이션
navigation.navigateToSubPage("enroll");
navigation.goBack();

// 폼 관리
forms.setEnrollmentStep("date-selection");
forms.resetEnrollment();
```

#### 개별 Context들

```typescript
// 네비게이션 컨텍스트
const { activeTab, subPage, navigateToSubPage, goBack } = useNavigation();

// 폼 컨텍스트
const { enrollment, setEnrollmentStep } = useForms();

// UI 컨텍스트
const { isLoading, setLoading } = useUI();
```

### 컴포넌트 개발 패턴

#### Container 패턴

```typescript
// Container 컴포넌트 (비즈니스 로직)
export const StudentDashboardContainer = () => {
  const { data, isLoading } = useStudentData();

  return <StudentDashboardPage data={data} isLoading={isLoading} />;
};

// Page 컴포넌트 (UI 렌더링)
export const StudentDashboardPage = ({ data, isLoading }) => {
  if (isLoading) return <LoadingSpinner />;

  return <div>{/* UI 렌더링 */}</div>;
};
```

#### 커스텀 훅 패턴

```typescript
// API 호출을 위한 커스텀 훅
export const useStudentData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudentData()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
};
```

## 🧪 테스트

### 테스트 구조

```
src/__tests__/
├── unit/                    # 단위 테스트
│   ├── components/         # 컴포넌트 테스트
│   └── utils/              # 유틸리티 테스트
├── integration/            # 통합 테스트
│   ├── api/               # API 테스트
│   ├── flows/             # 사용자 플로우 테스트
│   └── store/             # 스토어 테스트
└── utils/                  # 테스트 유틸리티
    └── test-utils.tsx     # 테스트 헬퍼
```

### 테스트 실행

```bash
# 모든 테스트 실행
npm run test

# 단위 테스트만 실행
npm run test:unit

# 통합 테스트만 실행
npm run test:integration

# 커버리지 포함 테스트
npm run test:coverage

# 감시 모드로 테스트
npm run test:watch
```

### 테스트 작성 예시

```typescript
// 컴포넌트 테스트
import { render, screen } from "@testing-library/react";
import { StudentDashboard } from "./StudentDashboard";

describe("StudentDashboard", () => {
  it("renders student dashboard correctly", () => {
    render(<StudentDashboard />);
    expect(screen.getByText("수강신청")).toBeInTheDocument();
  });
});

// 훅 테스트
import { renderHook } from "@testing-library/react";
import { useStudentData } from "./useStudentData";

describe("useStudentData", () => {
  it("should return student data", () => {
    const { result } = renderHook(() => useStudentData());
    expect(result.current.data).toBeDefined();
  });
});
```

## 🚀 배포

### Vercel 배포

현재 Vercel을 통한 자동 배포가 설정되어 있습니다:

- **프로덕션**: `main` 브랜치 푸시 시 자동 배포
- **프리뷰**: Pull Request 시 프리뷰 배포

### 배포 명령어

```bash
# 프리뷰 배포
npm run deploy:preview

# 프로덕션 배포
npm run deploy:production
```

### 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수들을 설정하세요:

- `NEXT_PUBLIC_API_URL`: 백엔드 API URL
- `NEXTAUTH_URL`: 프론트엔드 URL
- `NEXTAUTH_SECRET`: 인증 시크릿 키

## 📚 문서

프로젝트의 상세한 문서들은 `docs/` 디렉토리에서 확인할 수 있습니다:

- [배포 가이드](./docs/DEPLOYMENT.md) - 배포 관련 상세 가이드
- [CI/CD 가이드](./docs/CICD_README.md) - CI/CD 파이프라인 가이드

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

### 개발 가이드라인

- **코드 스타일**: ESLint + Prettier 설정을 따르세요
- **커밋 메시지**: Conventional Commits 형식을 사용하세요
- **테스트**: 새로운 기능에 대한 테스트를 작성하세요
- **문서**: API 변경사항이 있다면 문서를 업데이트하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

---

**Team Elliot Frontend** - 발레 아카데미 관리 시스템의 현대적이고 직관적인 사용자 인터페이스를 제공합니다.
