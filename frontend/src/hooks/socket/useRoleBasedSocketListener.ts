import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/store/hooks";
import { useSocketEvent } from "@/hooks/socket/useSocket";
import {
  updatePrincipalEnrollmentFromSocket,
  updatePrincipalRefundRequestFromSocket,
} from "@/store/slices/principalSlice";
import {
  updateTeacherEnrollmentFromSocket,
  updateTeacherSessionFromSocket,
} from "@/store/slices/teacherSlice";
import { toast } from "sonner";

// 역할별 이벤트 핸들러 정의
const roleEventHandlers = {
  PRINCIPAL: {
    enrollment_status_changed: (dispatch: any, data: any) => {
      console.log("📢 [Principal] 수강신청 상태 변경:", data);
      dispatch(updatePrincipalEnrollmentFromSocket(data));
      const statusText = data.status === "CONFIRMED" ? "승인" : "거절";
      toast.success(`수강신청이 ${statusText}되었습니다.`, {
        description: `${data.data.student.name}님의 수강신청`,
      });
    },
    refund_request_status_changed: (dispatch: any, data: any) => {
      console.log("📢 [Principal] 환불 요청 상태 변경:", data);
      dispatch(updatePrincipalRefundRequestFromSocket(data));
      const statusText = data.status === "APPROVED" ? "승인" : "거절";
      toast.success(`환불 요청이 ${statusText}되었습니다.`, {
        description: `${data.data.sessionEnrollment.student.name}님의 환불 요청`,
      });
    },
    class_info_changed: (dispatch: any, data: any) => {
      console.log("📢 [Principal] 클래스 정보 변경:", data);
      toast.info("클래스 정보가 업데이트되었습니다.");
    },
    academy_info_changed: (dispatch: any, data: any) => {
      console.log("📢 [Principal] 학원 정보 변경:", data);
      toast.info("학원 정보가 업데이트되었습니다.");
    },
    class_reminder: (dispatch: any, data: any) => {
      console.log("📢 [Principal] 수업 시간 알림:", data);
      toast.warning("수업 시간 알림", {
        description: `${data.classData.className} - ${data.message}`,
        duration: 10000,
      });
    },
    connection_confirmed: (dispatch: any, data: any) => {
      console.log("✅ [Principal] Socket 연결 확인:", data);
      toast.success("실시간 연결이 설정되었습니다.", {
        description: "이제 실시간 업데이트를 받을 수 있습니다.",
      });
    },
  },
  TEACHER: {
    enrollment_status_changed: (dispatch: any, data: any) => {
      console.log("📢 [Teacher] 수강신청 상태 변경:", data);
      dispatch(updateTeacherEnrollmentFromSocket(data));
      const statusText = data.status === "CONFIRMED" ? "승인" : "거절";
      toast.success(`수강신청이 ${statusText}되었습니다.`, {
        description: `${data.data.student.name}님의 수강신청`,
      });
    },
    refund_request_status_changed: (dispatch: any, data: any) => {
      console.log("📢 [Teacher] 환불 요청 상태 변경:", data);
      const statusText = data.status === "APPROVED" ? "승인" : "거절";
      toast.success(`환불 요청이 ${statusText}되었습니다.`, {
        description: `${data.data.sessionEnrollment.student.name}님의 환불 요청`,
      });
    },
    class_info_changed: (dispatch: any, data: any) => {
      console.log("📢 [Teacher] 클래스 정보 변경:", data);
      toast.info("클래스 정보가 업데이트되었습니다.");
    },
    class_reminder: (dispatch: any, data: any) => {
      console.log("📢 [Teacher] 수업 시간 알림:", data);
      toast.warning("수업 시간 알림", {
        description: `${data.classData.className} - ${data.message}`,
        duration: 10000,
      });
    },
    connection_confirmed: (dispatch: any, data: any) => {
      console.log("✅ [Teacher] Socket 연결 확인:", data);
      toast.success("실시간 연결이 설정되었습니다.", {
        description: "이제 실시간 업데이트를 받을 수 있습니다.",
      });
    },
  },
  STUDENT: {
    enrollment_status_changed: (dispatch: any, data: any) => {
      console.log("📢 [Student] 수강신청 상태 변경:", data);
      const statusText = data.status === "CONFIRMED" ? "승인" : "거절";
      toast.success(`수강신청이 ${statusText}되었습니다.`, {
        description: "수강신청 상태가 변경되었습니다.",
      });
    },
    refund_request_status_changed: (dispatch: any, data: any) => {
      console.log("📢 [Student] 환불 요청 상태 변경:", data);
      const statusText = data.status === "APPROVED" ? "승인" : "거절";
      toast.success(`환불 요청이 ${statusText}되었습니다.`, {
        description: "환불 요청 상태가 변경되었습니다.",
      });
    },
    class_reminder: (dispatch: any, data: any) => {
      console.log("📢 [Student] 수업 시간 알림:", data);
      toast.warning("수업 시간 알림", {
        description: `${data.classData.className} - ${data.message}`,
        duration: 10000,
      });
    },
    connection_confirmed: (dispatch: any, data: any) => {
      console.log("✅ [Student] Socket 연결 확인:", data);
      toast.success("실시간 연결이 설정되었습니다.", {
        description: "이제 실시간 업데이트를 받을 수 있습니다.",
      });
    },
  },
  ADMIN: {
    enrollment_status_changed: (dispatch: any, data: any) => {
      console.log("📢 [Admin] 수강신청 상태 변경:", data);
      toast.info("수강신청 상태가 변경되었습니다.");
    },
    refund_request_status_changed: (dispatch: any, data: any) => {
      console.log("📢 [Admin] 환불 요청 상태 변경:", data);
      toast.info("환불 요청 상태가 변경되었습니다.");
    },
    class_info_changed: (dispatch: any, data: any) => {
      console.log("📢 [Admin] 클래스 정보 변경:", data);
      toast.info("클래스 정보가 업데이트되었습니다.");
    },
    academy_info_changed: (dispatch: any, data: any) => {
      console.log("📢 [Admin] 학원 정보 변경:", data);
      toast.info("학원 정보가 업데이트되었습니다.");
    },
    connection_confirmed: (dispatch: any, data: any) => {
      console.log("✅ [Admin] Socket 연결 확인:", data);
      toast.success("실시간 연결이 설정되었습니다.", {
        description: "이제 실시간 업데이트를 받을 수 있습니다.",
      });
    },
  },
};

export function useRoleBasedSocketListener() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const userRole = session?.user?.role;

  useEffect(() => {
    if (
      !userRole ||
      !roleEventHandlers[userRole as keyof typeof roleEventHandlers]
    ) {
      console.warn(
        `🚫 역할 '${userRole}'에 대한 소켓 이벤트 핸들러가 정의되지 않았습니다.`
      );
      return;
    }

    console.log(`🎧 ${userRole} 역할용 소켓 리스너 초기화됨`);
  }, [userRole]);

  // 역할별 이벤트 핸들러 등록
  const handlers =
    roleEventHandlers[userRole as keyof typeof roleEventHandlers];

  if (!handlers) return;

  // 각 이벤트에 대해 역할별 핸들러 등록
  Object.entries(handlers).forEach(([eventName, handler]) => {
    useSocketEvent(eventName as any, (data: any) => {
      handler(dispatch, data);
    });
  });
}
