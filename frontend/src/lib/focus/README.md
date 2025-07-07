# 포커스 관리 시스템 (Focus Management System)

학원 관리 시스템의 UI 상태를 중앙화하여 관리하는 포커스 관리 시스템입니다.

## 개요

이 시스템은 다음과 같은 포커스 타입을 관리합니다:

- `dashboard`: 대시보드 메인 화면
- `modal`: 모달 다이얼로그
- `subpage`: 서브 페이지
- `overlay`: 오버레이 요소

## 주요 기능

### 1. 포커스 스택 관리

- 포커스 히스토리를 스택으로 관리
- 이전 포커스로 자동 복원
- 포커스 우선순위 기반 관리

### 2. 애니메이션 제어

- 대시보드 포커스 시에만 슬라이드 애니메이션 허용
- 모달/서브페이지 포커스 시 애니메이션 비활성화

### 3. 자동 복원

- 컴포넌트 언마운트 시 자동으로 이전 포커스로 복원
- 모달 닫기 시 자동 복원

## 사용 방법

### 1. 기본 사용법 (useFocus 훅)

```tsx
import { useFocus } from "@/lib/focus";

function MyComponent() {
  const {
    pushFocus,
    popFocus,
    currentFocus,
    isDashboardFocused,
    isModalFocused,
  } = useFocus();

  const handleOpenModal = () => {
    pushFocus("modal");
  };

  const handleCloseModal = () => {
    popFocus();
  };

  return (
    <div>
      {isDashboardFocused() && <p>대시보드가 포커스되어 있습니다</p>}
      {isModalFocused() && <p>모달이 포커스되어 있습니다</p>}
    </div>
  );
}
```

### 2. 전용 훅 사용법

```tsx
import { useModalFocus, useSubPageFocus } from "@/lib/focus";

// 모달 전용 훅
function MyModal({ isOpen, onClose }) {
  const { setCurrentFocus, restoreFocus } = useModalFocus();

  useEffect(() => {
    if (isOpen) {
      setCurrentFocus();
    }
  }, [isOpen, setCurrentFocus]);

  const handleClose = () => {
    restoreFocus();
    onClose();
  };

  return <div>Modal Content</div>;
}

// 서브페이지 전용 훅
function MySubPage() {
  const { setCurrentFocus, restoreFocus } = useSubPageFocus();

  useEffect(() => {
    setCurrentFocus();
    return () => restoreFocus();
  }, [setCurrentFocus, restoreFocus]);

  return <div>SubPage Content</div>;
}
```

### 3. 데코레이터 패턴 사용법

```tsx
import { withModalFocus, withSubPageFocus } from "@/lib/focus";

// 모달 컴포넌트
function MyModal({ onClose }) {
  return <div>Modal Content</div>;
}

export default withModalFocus(MyModal);

// 서브페이지 컴포넌트
function MySubPage() {
  return <div>SubPage Content</div>;
}

export default withSubPageFocus(MySubPage);
```

### 4. 고차 컴포넌트 사용법

```tsx
import { withModalFocusHOC } from "@/lib/focus";

function MyModal({ onClose, setCurrentFocus, restoreFocus }) {
  const handleClose = () => {
    restoreFocus();
    onClose();
  };

  return <div>Modal Content</div>;
}

export default withModalFocusHOC(MyModal);
```

### 5. 유틸리티 함수 사용법

```tsx
import {
  isSlideAnimationAllowed,
  logFocusTransition,
  hasHigherPriority,
} from "@/lib/focus";

function MyComponent() {
  const { currentFocus } = useFocus();

  // 슬라이드 애니메이션 허용 여부 확인
  const canSlide = isSlideAnimationAllowed(currentFocus);

  // 포커스 전환 로그 (개발 환경에서만)
  logFocusTransition("dashboard", "modal", "사용자 액션");

  // 포커스 우선순위 비교
  const isHigher = hasHigherPriority("modal", "dashboard");

  return <div>Component</div>;
}
```

## 포커스 우선순위

포커스 타입별 우선순위는 다음과 같습니다:

1. `overlay` (우선순위: 4) - 가장 높음
2. `modal` (우선순위: 3)
3. `subpage` (우선순위: 2)
4. `dashboard` (우선순위: 1) - 가장 낮음

## 설정 옵션

### FocusManagerOptions

```tsx
interface FocusManagerOptions {
  focusType: FocusType;
  autoRestore?: boolean; // 컴포넌트 언마운트 시 자동 복원
  restoreOnClose?: boolean; // 닫기 시 자동 복원
}
```

### 데코레이터 옵션

```tsx
interface DecoratorOptions {
  autoRestore?: boolean;
  restoreOnClose?: boolean;
  onFocusChange?: (focus: FocusType) => void;
}
```

## 모범 사례

### 1. 모달 컴포넌트

```tsx
import { useModalFocus } from "@/lib/focus";

function MyModal({ isOpen, onClose, children }) {
  const { setCurrentFocus, restoreFocus } = useModalFocus();

  useEffect(() => {
    if (isOpen) {
      setCurrentFocus();
    }
  }, [isOpen, setCurrentFocus]);

  const handleClose = () => {
    restoreFocus();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={handleClose}>닫기</button>
      </div>
    </div>
  );
}
```

### 2. 서브페이지 컴포넌트

```tsx
import { useSubPageFocus } from "@/lib/focus";

function MySubPage() {
  const { setCurrentFocus, restoreFocus } = useSubPageFocus();

  useEffect(() => {
    setCurrentFocus();
    return () => restoreFocus();
  }, [setCurrentFocus, restoreFocus]);

  return (
    <div className="subpage">
      <h1>서브페이지 제목</h1>
      <p>서브페이지 내용</p>
    </div>
  );
}
```

### 3. 애니메이션 제어

```tsx
import { useFocus, isSlideAnimationAllowed } from "@/lib/focus";

function ScrollableContainer({ children }) {
  const { currentFocus } = useFocus();
  const canSlide = isSlideAnimationAllowed(currentFocus);

  return (
    <div
      className={`scrollable-container ${
        canSlide ? "slide-enabled" : "slide-disabled"
      }`}
    >
      {children}
    </div>
  );
}
```

## 디버깅

개발 환경에서 포커스 전환을 로그로 확인할 수 있습니다:

```tsx
import { logFocusTransition } from "@/lib/focus";

// 포커스 전환 시 자동으로 로그가 출력됩니다
// [Focus] 대시보드 메인 화면 → 모달 다이얼로그 (사용자 액션)
```

## 주의사항

1. **포커스 스택 관리**: `pushFocus`와 `popFocus`를 올바른 순서로 사용해야 합니다.
2. **자동 복원**: `autoRestore` 옵션을 적절히 설정하여 메모리 누수를 방지합니다.
3. **애니메이션 제어**: 대시보드 포커스가 아닐 때는 슬라이드 애니메이션을 비활성화합니다.
4. **컨텍스트 제공**: `FocusProvider`가 앱의 최상위에 있어야 합니다.

## 마이그레이션 가이드

기존 `useDashboardNavigation`에서 새로운 포커스 관리 시스템으로 마이그레이션:

### 이전 코드

```tsx
import { useDashboardNavigation } from "@/contexts/DashboardContext";

function MyComponent() {
  const { setFocus, isDashboardFocused } = useDashboardNavigation();

  const handleOpenModal = () => {
    setFocus("modal");
  };

  const handleCloseModal = () => {
    setFocus("dashboard");
  };
}
```

### 새로운 코드

```tsx
import { useFocus } from "@/lib/focus";

function MyComponent() {
  const { pushFocus, popFocus, isDashboardFocused } = useFocus();

  const handleOpenModal = () => {
    pushFocus("modal");
  };

  const handleCloseModal = () => {
    popFocus();
  };
}
```
