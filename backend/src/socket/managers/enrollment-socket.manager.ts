import { Injectable, Logger } from '@nestjs/common';
import { UniversalSocketManager } from './universal-socket.manager';

@Injectable()
export class EnrollmentSocketManager {
  constructor(
    private readonly universalSocketManager: UniversalSocketManager,
    private readonly logger: Logger,
  ) {}

  // 수강신청 생성 알림
  async notifyEnrollmentCreated(enrollment: any): Promise<void> {
    try {
      this.logger.log(`📢 수강신청 생성 알림: ${enrollment.id}`);

      await this.universalSocketManager.notifyEnrollmentEvent(
        'enrollment_created',
        enrollment,
        '새로운 수강신청이 접수되었습니다.',
      );

      this.logger.log(`✅ 수강신청 생성 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 수강신청 생성 알림 실패', error);
    }
  }

  // 수강신청 상태 변경 알림
  async notifyEnrollmentStatusChanged(
    enrollment: any,
    oldStatus: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `📢 수강신청 상태 변경 알림: ${enrollment.id} (${oldStatus} → ${enrollment.status})`,
      );

      await this.universalSocketManager.notifyEnrollmentEvent(
        'enrollment_status_changed',
        enrollment,
        `수강신청이 ${enrollment.status === 'CONFIRMED' ? '승인' : '거절'}되었습니다.`,
      );

      // 수강신청 수락으로 인한 클래스 가득참 여부 확인
      if (enrollment.status === 'APPROVED' && oldStatus === 'PENDING') {
        await this.checkAndNotifyClassFull(
          enrollment.classId,
        );
      }

      this.logger.log(`✅ 수강신청 상태 변경 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 수강신청 상태 변경 알림 실패', error);
    }
  }

  // 환불 요청 생성 알림
  async notifyRefundRequestCreated(refundRequest: any): Promise<void> {
    try {
      this.logger.log(`📢 환불 요청 생성 알림: ${refundRequest.id}`);

      await this.universalSocketManager.notifyRefundEvent(
        'refund_request_created',
        refundRequest,
        '새로운 환불 요청이 접수되었습니다.',
      );

      this.logger.log(`✅ 환불 요청 생성 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 환불 요청 생성 알림 실패', error);
    }
  }

  // 환불 요청 상태 변경 알림
  async notifyRefundRequestStatusChanged(
    refundRequest: any,
    oldStatus: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `📢 환불 요청 상태 변경 알림: ${refundRequest.id} (${oldStatus} → ${refundRequest.status})`,
      );

      await this.universalSocketManager.notifyRefundEvent(
        'refund_request_status_changed',
        refundRequest,
        `환불 요청이 ${refundRequest.status === 'APPROVED' ? '승인' : '거절'}되었습니다.`,
      );

      this.logger.log(`✅ 환불 요청 상태 변경 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 환불 요청 상태 변경 알림 실패', error);
    }
  }

  // 세션 가용성 변경 알림
  async notifySessionAvailabilityChanged(
    sessionId: number,
    classId: number,
    academyId: number,
    currentStudents: number,
    maxStudents: number,
  ): Promise<void> {
    try {
      this.logger.log(
        `📢 세션 가용성 변경 알림: ${sessionId} (${currentStudents}/${maxStudents})`,
      );

      // 세션 데이터 구성
      // const sessionData = {
      //   sessionId,
      //   classId,
      //   academyId,
      //   currentStudents,
      //   maxStudents,
      //   isFull: currentStudents >= maxStudents,
      // };

      await this.universalSocketManager.notifyUpdateRequired(
        'session_availability_changed',
        [
          {
            userId: 0, // 모든 사용자에게 알림
            userRole: 'STUDENT' as const,
          },
        ],
        `세션 가용성이 변경되었습니다. (${currentStudents}/${maxStudents})`,
      );

      this.logger.log(`✅ 세션 가용성 변경 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 세션 가용성 변경 알림 실패', error);
    }
  }

  // 클래스 가득참 알림
  private async checkAndNotifyClassFull(
    classId: number,
    // _academyId: number,
  ): Promise<void> {
    // 클래스 가득참 시 추가 알림 로직
    this.logger.log(`📢 클래스 ${classId} 가득참 확인`);
  }

  // 클래스 자리 생김 알림
  private async checkAndNotifyClassAvailable(
    classId: number,
    // _academyId: number,
  ): Promise<void> {
    // 클래스 자리 생김 시 추가 알림 로직
    this.logger.log(`📢 클래스 ${classId} 자리 생김 확인`);
  }
}
