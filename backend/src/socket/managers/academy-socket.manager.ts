import { Injectable, Logger } from '@nestjs/common';
import { UniversalSocketManager } from './universal-socket.manager';

@Injectable()
export class AcademySocketManager {
  constructor(
    private readonly universalSocketManager: UniversalSocketManager,
    private readonly logger: Logger,
  ) {}

  // 학원 정보 변경 알림
  async notifyAcademyInfoChanged(academyData: any): Promise<void> {
    try {
      this.logger.log(`📢 학원 정보 변경 알림: ${academyData.id}`);

      await this.universalSocketManager.notifyAcademyEvent(
        'academy_info_changed',
        academyData,
        '학원 정보가 업데이트되었습니다.',
      );

      this.logger.log(`✅ 학원 정보 변경 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 학원 정보 변경 알림 실패', error);
    }
  }

  // 선생님 학원 가입 알림
  async notifyTeacherJoined(
    teacherId: number,
    academyId: number,
  ): Promise<void> {
    try {
      this.logger.log(`📢 선생님 학원 가입 알림: ${teacherId} → ${academyId}`);

      await this.universalSocketManager.notifyUpdateRequired(
        'teacher_joined',
        [
          {
            userId: teacherId,
            userRole: 'TEACHER' as const,
          },
        ],
        '새로운 선생님이 학원에 가입했습니다.',
      );

      this.logger.log(`✅ 선생님 학원 가입 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 선생님 학원 가입 알림 실패', error);
    }
  }

  // 선생님 학원 탈퇴 알림
  async notifyTeacherLeft(teacherId: number, academyId: number): Promise<void> {
    try {
      this.logger.log(`📢 선생님 학원 탈퇴 알림: ${teacherId} → ${academyId}`);

      await this.universalSocketManager.notifyUpdateRequired(
        'teacher_left',
        [
          {
            userId: teacherId,
            userRole: 'TEACHER' as const,
          },
        ],
        '선생님이 학원을 탈퇴했습니다.',
      );

      this.logger.log(`✅ 선생님 학원 탈퇴 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 선생님 학원 탈퇴 알림 실패', error);
    }
  }

  // 학생 학원 가입 알림
  async notifyStudentJoined(
    studentId: number,
    academyId: number,
  ): Promise<void> {
    try {
      this.logger.log(`📢 학생 학원 가입 알림: ${studentId} → ${academyId}`);

      await this.universalSocketManager.notifyUpdateRequired(
        'student_joined',
        [
          {
            userId: studentId,
            userRole: 'STUDENT' as const,
          },
        ],
        '새로운 학생이 학원에 가입했습니다.',
      );

      this.logger.log(`✅ 학생 학원 가입 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 학생 학원 가입 알림 실패', error);
    }
  }

  // 학생 학원 탈퇴 알림
  async notifyStudentLeft(studentId: number, academyId: number): Promise<void> {
    try {
      this.logger.log(`📢 학생 학원 탈퇴 알림: ${studentId} → ${academyId}`);

      await this.universalSocketManager.notifyUpdateRequired(
        'student_left',
        [
          {
            userId: studentId,
            userRole: 'STUDENT' as const,
          },
        ],
        '학생이 학원을 탈퇴했습니다.',
      );

      this.logger.log(`✅ 학생 학원 탈퇴 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 학생 학원 탈퇴 알림 실패', error);
    }
  }
}
