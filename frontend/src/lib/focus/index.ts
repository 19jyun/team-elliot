// 포커스 관리 시스템 메인 export

// 컨텍스트
export { useDashboardNavigation as useFocus } from "@/contexts/DashboardContext";
export type { FocusType } from "@/contexts/DashboardContext";

// 훅
export {
  useFocusManager,
  useModalFocus,
  useSubPageFocus,
  useOverlayFocus,
} from "@/hooks/useFocusManager";

// 고차 컴포넌트
export {
  withFocusManager,
  withModalFocus as withModalFocusHOC,
  withSubPageFocus as withSubPageFocusHOC,
  withOverlayFocus as withOverlayFocusHOC,
} from "@/components/common/withFocusManager";

// 데코레이터
export {
  withFocusManagement,
  withModalFocus,
  withSubPageFocus,
  withOverlayFocus,
} from "@/decorators/withFocusManagement";

// 유틸리티
export {
  compareFocusPriority,
  hasHigherPriority,
  isSlideAnimationAllowed,
  isValidFocusType,
  findLastFocusIndex,
  findPreviousFocus,
  logFocusTransition,
  validateFocusState,
  FOCUS_DESCRIPTIONS,
} from "@/utils/focusUtils";

// 포커스 관리 시스템 사용 예시
export const FocusManagementExamples = {
  // 기본 사용법
  basic: `
import { useFocus } from '@/lib/focus';

function MyComponent() {
  const { pushFocus, popFocus, isDashboardFocused } = useFocus();
  
  const handleOpenModal = () => {
    pushFocus('modal');
  };
  
  const handleCloseModal = () => {
    popFocus();
  };
  
  return (
    <div>
      {isDashboardFocused() && <p>대시보드가 포커스되어 있습니다</p>}
    </div>
  );
}
  `,

  // 훅 사용법
  hook: `
import { useModalFocus } from '@/lib/focus';

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
  `,

  // 데코레이터 사용법
  decorator: `
import { withModalFocus } from '@/lib/focus';

function MyModal({ onClose }) {
  return <div>Modal Content</div>;
}

export default withModalFocus(MyModal);
  `,

  // 유틸리티 사용법
  utils: `
import { isSlideAnimationAllowed, logFocusTransition } from '@/lib/focus';

function MyComponent() {
  const { currentFocus } = useFocus();
  
  // 슬라이드 애니메이션 허용 여부 확인
  const canSlide = isSlideAnimationAllowed(currentFocus);
  
  // 포커스 전환 로그
  logFocusTransition('dashboard', 'modal', '사용자 액션');
  
  return <div>Component</div>;
}
  `,
};
