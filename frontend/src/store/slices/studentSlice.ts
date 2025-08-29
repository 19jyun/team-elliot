import { createSlice } from "@reduxjs/toolkit";
import type { StudentState, StudentData } from "@/types/store/student";
import type { SocketEventData } from "@/types/socket";
import type {
  EnrollmentHistory,
  CancellationHistory,
} from "@/types/api/student";

const initialState: StudentState = {
  data: {
    enrollmentHistory: [],
    cancellationHistory: [],
  },
  isLoading: false,
  error: null,
};

export const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    // 1. 전체 데이터 설정
    setStudentData: (state, action) => {
      state.data = action.payload;
    },

    // 2. 로딩 상태 관리
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    // 3. 수강 신청/결제 내역 업데이트
    updateStudentEnrollmentHistory: (state, action) => {
      if (state.data) {
        state.data.enrollmentHistory = action.payload;
      }
    },

    // 4. 환불/취소 내역 업데이트
    updateStudentCancellationHistory: (state, action) => {
      if (state.data) {
        state.data.cancellationHistory = action.payload;
      }
    },

    // 5. 개별 수강 신청 업데이트
    updateStudentEnrollment: (state, action) => {
      if (state.data?.enrollmentHistory) {
        const index = state.data.enrollmentHistory.findIndex(
          (e) => e.id === action.payload.id
        );
        if (index !== -1) {
          state.data.enrollmentHistory[index] = action.payload;
        }
      }
    },

    // 6. 개별 환불/취소 업데이트
    updateStudentCancellation: (state, action) => {
      if (state.data?.cancellationHistory) {
        const index = state.data.cancellationHistory.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.data.cancellationHistory[index] = action.payload;
        }
      }
    },

    // 7. 데이터 초기화
    clearStudentData: (state) => {
      state.data = {
        enrollmentHistory: [],
        cancellationHistory: [],
      };
    },

    // === 낙관적 업데이트 관련 액션들 ===

    // 8. 낙관적 수강신청 추가
    addOptimisticEnrollment: (state, action) => {
      if (state.data) {
        const optimisticEnrollment: EnrollmentHistory & {
          isOptimistic: boolean;
        } = {
          ...action.payload,
          isOptimistic: true,
        };
        state.data.enrollmentHistory.unshift(optimisticEnrollment);
      }
    },

    // 9. 낙관적 수강신청을 실제 데이터로 교체
    replaceOptimisticEnrollment: (state, action) => {
      if (state.data?.enrollmentHistory) {
        const { optimisticId, realEnrollment } = action.payload;
        const index = state.data.enrollmentHistory.findIndex(
          (e) => e.id === optimisticId
        );
        if (index !== -1) {
          state.data.enrollmentHistory[index] = {
            ...realEnrollment,
            isOptimistic: false,
          };
        }
      }
    },

    // 10. 낙관적 수강신청 제거 (실패 시)
    removeOptimisticEnrollment: (state, action) => {
      if (state.data?.enrollmentHistory) {
        const optimisticId = action.payload;
        state.data.enrollmentHistory = state.data.enrollmentHistory.filter(
          (e) => e.id !== optimisticId
        );
      }
    },

    // 11. 낙관적 환불 요청 추가
    addOptimisticCancellation: (state, action) => {
      if (state.data) {
        const optimisticCancellation: CancellationHistory & {
          isOptimistic: boolean;
        } = {
          ...action.payload,
          isOptimistic: true,
        };
        state.data.cancellationHistory.unshift(optimisticCancellation);
      }
    },

    // 12. 낙관적 환불 요청을 실제 데이터로 교체
    replaceOptimisticCancellation: (state, action) => {
      if (state.data?.cancellationHistory) {
        const { optimisticId, realCancellation } = action.payload;
        const index = state.data.cancellationHistory.findIndex(
          (c) => c.id === optimisticId
        );
        if (index !== -1) {
          state.data.cancellationHistory[index] = {
            ...realCancellation,
            isOptimistic: false,
          };
        }
      }
    },

    // 13. 낙관적 환불 요청 제거 (실패 시)
    removeOptimisticCancellation: (state, action) => {
      if (state.data?.cancellationHistory) {
        const optimisticId = action.payload;
        state.data.cancellationHistory = state.data.cancellationHistory.filter(
          (c) => c.id !== optimisticId
        );
      }
    },

    // 14. WebSocket 이벤트 액션들
    updateStudentEnrollmentFromSocket: (state, action) => {
      const { enrollmentId, status, data } =
        action.payload as SocketEventData<"enrollment_status_changed">;
      if (state.data?.enrollmentHistory) {
        const index = state.data.enrollmentHistory.findIndex(
          (e) => e.id === enrollmentId
        );
        if (index !== -1) {
          state.data.enrollmentHistory[index] = {
            ...state.data.enrollmentHistory[index],
            status,
            ...data,
          };
        }
      }
    },

    updateStudentCancellationFromSocket: (state, action) => {
      const { refundId, status, data } =
        action.payload as SocketEventData<"refund_request_status_changed">;
      if (state.data?.cancellationHistory) {
        const index = state.data.cancellationHistory.findIndex(
          (c) => c.id === refundId
        );
        if (index !== -1) {
          state.data.cancellationHistory[index] = {
            ...state.data.cancellationHistory[index],
            status,
            ...data,
          };
        }
      }
    },

    // 15. 세션 가용성 변경 (캘린더용)
    updateAvailableSessionFromSocket: (state, action) => {
      // 캘린더 관련 업데이트 로직 (추후 구현)
    },

    // 16. 클래스 가용성 변경 (캘린더용)
    updateAvailableClassFromSocket: (state, action) => {
      // 캘린더 관련 업데이트 로직 (추후 구현)
    },
  },
});

export const {
  setStudentData,
  setLoading,
  setError,
  updateStudentEnrollmentHistory,
  updateStudentCancellationHistory,
  updateStudentEnrollment,
  updateStudentCancellation,
  clearStudentData,
  addOptimisticEnrollment,
  replaceOptimisticEnrollment,
  removeOptimisticEnrollment,
  addOptimisticCancellation,
  replaceOptimisticCancellation,
  removeOptimisticCancellation,
  updateStudentEnrollmentFromSocket,
  updateStudentCancellationFromSocket,
  updateAvailableSessionFromSocket,
  updateAvailableClassFromSocket,
} = studentSlice.actions;

export default studentSlice.reducer;
