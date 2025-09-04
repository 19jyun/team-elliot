import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/store/hooks";
import {
  updatePrincipalEnrollmentFromSocket,
  updatePrincipalRefundRequestFromSocket,
} from "@/store/slices/principalSlice";
import { updateTeacherEnrollmentFromSocket } from "@/store/slices/teacherSlice";
import {
  updateStudentEnrollmentFromSocket,
  updateStudentCancellationFromSocket,
} from "@/store/slices/studentSlice";
import { toast } from "sonner";
import type { SocketEventData, RoleBasedEventHandlers } from "@/types/socket";
import type { AppDispatch } from "@/store";

// 역할별 이벤트 핸들러 정의
const roleEventHandlers: RoleBasedEventHandlers = {
  PRINCIPAL: {
    enrollment_status_changed: (
      dispatch: AppDispatch,
      data: SocketEventData<"enrollment_status_changed">
    ) => {
      dispatch(updatePrincipalEnrollmentFromSocket(data));
      const statusText = data.status === "CONFIRMED" ? "승인" : "거절";
      toast.success(`수강신청이 ${statusText}되었습니다.`, {
        description: `${data.data.student.name}님의 수강신청`,
      });
    },
    refund_request_status_changed: (
      dispatch: AppDispatch,
      data: SocketEventData<"refund_request_status_changed">
    ) => {
      dispatch(updatePrincipalRefundRequestFromSocket(data));
      const statusText = data.status === "APPROVED" ? "승인" : "거절";
      toast.success(`환불 요청이 ${statusText}되었습니다.`, {
        description: `${data.data.sessionEnrollment.student.name}님의 환불 요청`,
      });
    },
    class_info_changed: (
      _dispatch: AppDispatch,
      _data: SocketEventData<"class_info_changed">
    ) => {
      toast.info("클래스 정보가 업데이트되었습니다.");
    },
    academy_info_changed: (
      _dispatch: AppDispatch,
      _data: SocketEventData<"academy_info_changed">
    ) => {
      toast.info("학원 정보가 업데이트되었습니다.");
    },
    class_reminder: (
      _dispatch: AppDispatch,
      data: SocketEventData<"class_reminder">
    ) => {
      toast.warning("수업 시간 알림", {
        description: `${data.classData.className} - ${data.message}`,
        duration: 10000,
      });
    },
    connection_confirmed: (
      _dispatch: AppDispatch,
      _data: SocketEventData<"connection_confirmed">
    ) => {
      toast.success("실시간 연결이 설정되었습니다.", {
        description: "이제 실시간 업데이트를 받을 수 있습니다.",
      });
    },
  },
  TEACHER: {
    enrollment_status_changed: (
      dispatch: AppDispatch,
      data: SocketEventData<"enrollment_status_changed">
    ) => {
      dispatch(updateTeacherEnrollmentFromSocket(data));
      const statusText = data.status === "CONFIRMED" ? "승인" : "거절";
      toast.success(`수강신청이 ${statusText}되었습니다.`, {
        description: `${data.data.student.name}님의 수강신청`,
      });
    },
    refund_request_status_changed: (
      _dispatch: AppDispatch,
      data: SocketEventData<"refund_request_status_changed">
    ) => {
      const statusText = data.status === "APPROVED" ? "승인" : "거절";
      toast.success(`환불 요청이 ${statusText}되었습니다.`, {
        description: `${data.data.sessionEnrollment.student.name}님의 환불 요청`,
      });
    },
    class_info_changed: (
      _dispatch: AppDispatch,
      _data: SocketEventData<"class_info_changed">
    ) => {
      toast.info("클래스 정보가 업데이트되었습니다.");
    },
    class_reminder: (
      _dispatch: AppDispatch,
      data: SocketEventData<"class_reminder">
    ) => {
      toast.warning("수업 시간 알림", {
        description: `${data.classData.className} - ${data.message}`,
        duration: 10000,
      });
    },
    connection_confirmed: (
      _dispatch: AppDispatch,
      _data: SocketEventData<"connection_confirmed">
    ) => {
      toast.success("실시간 연결이 설정되었습니다.", {
        description: "이제 실시간 업데이트를 받을 수 있습니다.",
      });
    },
  },
  STUDENT: {
    enrollment_status_changed: (
      dispatch: AppDispatch,
      data: SocketEventData<"enrollment_status_changed">
    ) => {
      dispatch(updateStudentEnrollmentFromSocket(data));
      const statusText = data.status === "CONFIRMED" ? "승인" : "거절";
      toast.success(`수강신청이 ${statusText}되었습니다.`, {
        description: "수강신청 상태가 변경되었습니다.",
      });
    },
    refund_request_status_changed: (
      dispatch: AppDispatch,
      data: SocketEventData<"refund_request_status_changed">
    ) => {
      dispatch(updateStudentCancellationFromSocket(data));
      const statusText = data.status === "APPROVED" ? "승인" : "거절";
      toast.success(`환불 요청이 ${statusText}되었습니다.`, {
        description: "환불 요청 상태가 변경되었습니다.",
      });
    },
    session_availability_changed: (
      _dispatch: AppDispatch,
      _data: SocketEventData<"session_availability_changed">
    ) => {
      toast.info("세션 정보가 업데이트되었습니다.");
    },
    class_availability_changed: (
      _dispatch: AppDispatch,
      _data: SocketEventData<"class_availability_changed">
    ) => {
      toast.info("클래스 정보가 업데이트되었습니다.");
    },
    class_reminder: (
      _dispatch: AppDispatch,
      data: SocketEventData<"class_reminder">
    ) => {
      toast.warning("수업 시간 알림", {
        description: `${data.classData.className} - ${data.message}`,
        duration: 10000,
      });
    },
    enrollment_confirmed: (
      _dispatch: AppDispatch,
      data: SocketEventData<"enrollment_confirmed">
    ) => {
      // 수강신청 승인 시 추가 처리
      toast.success("수강신청이 승인되었습니다!", {
        description: `${data.classData.className} 수강신청이 완료되었습니다.`,
      });
    },
    connection_confirmed: (
      _dispatch: AppDispatch,
      _data: SocketEventData<"connection_confirmed">
    ) => {
      toast.success("실시간 연결이 설정되었습니다.", {
        description: "이제 실시간 업데이트를 받을 수 있습니다.",
      });
    },
  },
  // ADMIN 제거됨
};

export function useRoleBasedSocketListener() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const userRole = session?.user?.role;
  const isInitialized = useRef(false);

  useEffect(() => {
    if (
      !userRole ||
      !roleEventHandlers[userRole as keyof typeof roleEventHandlers] ||
      isInitialized.current
    ) {
      if (isInitialized.current) {
      } else if (
        !userRole ||
        !roleEventHandlers[userRole as keyof typeof roleEventHandlers]
      ) {
        console.warn(
          `🚫 역할 '${userRole}'에 대한 소켓 이벤트 핸들러가 정의되지 않았습니다.`
        );
      }
      return;
    }

    isInitialized.current = true;

    // 역할별 이벤트 핸들러 등록
    const handlers =
      roleEventHandlers[userRole as keyof typeof roleEventHandlers];

    // 각 이벤트에 대해 역할별 핸들러 등록
    Object.entries(handlers).forEach(([eventName, handler]) => {
      // useSocketEvent 대신 직접 socket 이벤트 리스너 등록
      const socket = (window as unknown as { socket?: unknown }).socket;
      if (socket) {
        (
          socket as {
            on: (event: string, callback: (data: unknown) => void) => void;
          }
        ).on(eventName, (data: unknown) => {
          handler(dispatch, data as unknown);
        });
      }
    });

    // 클린업 함수
    return () => {
      const handlers =
        roleEventHandlers[userRole as keyof typeof roleEventHandlers];
      const socket = (window as unknown as { socket?: unknown }).socket;
      if (socket) {
        Object.keys(handlers).forEach((eventName) => {
          (socket as { off: (event: string) => void }).off(eventName);
        });
      }
      isInitialized.current = false;
    };
  }, [userRole, dispatch]);
}
