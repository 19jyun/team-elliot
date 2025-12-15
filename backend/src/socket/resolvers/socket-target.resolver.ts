import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SocketTargetResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  // 수강신청 생성 → 원장에게 알림
  async resolveEnrollmentCreatedTargets(enrollment: any): Promise<string[]> {
    const targets: string[] = [];

    try {
      // 해당 학원의 원장에게 알림
      const academy = await this.prisma.academy.findUnique({
        where: { id: enrollment.class.academyId },
        include: { principal: true },
      });

      if (academy?.principal) {
        targets.push(`user:${academy.principal.id}`);
      }
    } catch (error) {
      this.logger.error('Failed to resolve enrollment created targets', error);
    }

    return targets;
  }

  // 환불 요청 생성 → 원장에게 알림
  async resolveRefundRequestCreatedTargets(
    refundRequest: any,
  ): Promise<string[]> {
    const targets: string[] = [];

    try {
      // 해당 학원의 원장에게만 알림
      const academy = await this.prisma.academy.findUnique({
        where: { id: refundRequest.sessionEnrollment.session.class.academyId },
        include: { principal: true },
      });

      if (academy?.principal) {
        targets.push(`user:${academy.principal.id}`);
      }
    } catch (error) {
      this.logger.error(
        'Failed to resolve refund request created targets',
        error,
      );
    }

    return targets;
  }

  // 수강신청 상태 변경 → 해당 학생에게 알림
  async resolveEnrollmentStatusChangedTargets(
    enrollment: any,
  ): Promise<string[]> {
    const targets: string[] = [];

    try {
      // 수강신청한 학생에게 알림
      targets.push(`user:${enrollment.studentId}`);
    } catch (error) {
      this.logger.error(
        'Failed to resolve enrollment status changed targets',
        error,
      );
    }

    return targets;
  }

  // 환불 요청 상태 변경 → 해당 학생에게 알림
  async resolveRefundRequestStatusChangedTargets(
    refundRequest: any,
  ): Promise<string[]> {
    const targets: string[] = [];

    try {
      // 환불 신청한 학생에게 알림
      targets.push(`user:${refundRequest.studentId}`);
    } catch (error) {
      this.logger.error(
        'Failed to resolve refund request status changed targets',
        error,
      );
    }

    return targets;
  }

  // 세션 가용성 변경 → 해당 학원의 모든 학생에게 알림
  async resolveSessionAvailabilityChangedTargets(
    sessionId: number,
    academyId: number,
  ): Promise<string[]> {
    const targets: string[] = [];

    try {
      // 해당 학원의 모든 학생들에게 알림
      const students = await this.prisma.studentAcademy.findMany({
        where: { academyId },
        include: { student: true },
      });

      students.forEach((studentAcademy) => {
        targets.push(`user:${studentAcademy.studentId}`);
      });
    } catch (error) {
      this.logger.error(
        'Failed to resolve session availability changed targets',
        error,
      );
    }

    return targets;
  }

  // 세션 내용 변경 → 해당 클래스의 모든 수강생에게 알림
  async resolveSessionContentChangedTargets(
    sessionId: number,
  ): Promise<string[]> {
    const targets: string[] = [];

    try {
      // 해당 세션의 모든 수강생들에게 알림
      const enrollments = await this.prisma.sessionEnrollment.findMany({
        where: { sessionId },
        include: { student: true },
      });

      enrollments.forEach((enrollment) => {
        targets.push(`user:${enrollment.studentId}`);
      });
    } catch (error) {
      this.logger.error(
        'Failed to resolve session content changed targets',
        error,
      );
    }

    return targets;
  }

  // 새 클래스 생성 → 해당 학원의 모든 학생에게 알림
  async resolveClassCreatedTargets(
    classId: number,
    academyId: number,
  ): Promise<string[]> {
    const targets: string[] = [];

    try {
      // 해당 학원의 모든 학생들에게 알림
      const students = await this.prisma.studentAcademy.findMany({
        where: { academyId },
        include: { student: true },
      });

      students.forEach((studentAcademy) => {
        targets.push(`user:${studentAcademy.studentId}`);
      });
    } catch (error) {
      this.logger.error('Failed to resolve class created targets', error);
    }

    return targets;
  }

  // 선생님 학원 가입/탈퇴 → 학원의 모든 구성원에게 알림
  async resolveTeacherAcademyChangedTargets(
    teacherId: number,
    academyId: number,
  ): Promise<string[]> {
    const targets: string[] = [];

    try {
      // 학원의 원장에게 알림
      const academy = await this.prisma.academy.findUnique({
        where: { id: academyId },
        include: { principal: true },
      });

      if (academy?.principal) {
        targets.push(`user:${academy.principal.id}`);
      }

      // 학원의 다른 선생님들에게 알림
      const teachers = await this.prisma.teacher.findMany({
        where: { academyId },
      });

      teachers.forEach((teacher) => {
        if (teacher.id !== teacherId) {
          // 본인 제외
          targets.push(`user:${teacher.id}`);
        }
      });

      // 학원의 모든 학생들에게 알림
      const students = await this.prisma.studentAcademy.findMany({
        where: { academyId },
        include: { student: true },
      });

      students.forEach((studentAcademy) => {
        targets.push(`user:${studentAcademy.studentId}`);
      });
    } catch (error) {
      this.logger.error(
        'Failed to resolve teacher academy changed targets',
        error,
      );
    }

    return targets;
  }

  // 학생 학원 가입/탈퇴 → 원장과 선생님들에게만 알림
  async resolveStudentAcademyChangedTargets(
    studentId: number,
    academyId: number,
  ): Promise<string[]> {
    const targets: string[] = [];

    try {
      // 학원의 원장에게 알림
      const academy = await this.prisma.academy.findUnique({
        where: { id: academyId },
        include: { principal: true },
      });

      if (academy?.principal) {
        targets.push(`user:${academy.principal.id}`);
      }

      // 학원의 모든 선생님들에게 알림
      const teachers = await this.prisma.teacher.findMany({
        where: { academyId },
      });

      teachers.forEach((teacher) => {
        targets.push(`user:${teacher.id}`);
      });

      // 다른 학생들에게는 알림하지 않음 (요구사항에 따라)
    } catch (error) {
      this.logger.error(
        'Failed to resolve student academy changed targets',
        error,
      );
    }

    return targets;
  }

  // 범용 메서드들 - UniversalSocketManager에서 사용

  // 사용자 타겟 해결
  async resolveUserTarget(
    userId: number,
    // _userRole: string,
  ): Promise<string | null> {
    try {
      return `user:${userId}`;
    } catch (error) {
      this.logger.error('Failed to resolve user target', error);
      return null;
    }
  }

  // 수강신청 이벤트 타겟 해결 (원장 + 학생)
  async resolveEnrollmentEventTargets(
    enrollment: any,
  ): Promise<
    { userId: number; userRole: 'STUDENT' | 'TEACHER' | 'PRINCIPAL' }[]
  > {
    const targets: {
      userId: number;
      userRole: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
    }[] = [];

    try {
      this.logger.log(`🔍 수강신청 이벤트 타겟 해결 시작:`, {
        enrollmentId: enrollment.id,
        studentId: enrollment.studentId,
        classId: enrollment.session?.classId,
        academyId: enrollment.session?.class?.academyId,
      });

      // 수강신청한 학생
      targets.push({ userId: enrollment.studentId, userRole: 'STUDENT' });
      this.logger.log(`✅ 학생 타겟 추가: ${enrollment.studentId}`);

      // 해당 학원의 원장
      const academy = await this.prisma.academy.findUnique({
        where: { id: enrollment.session.class.academyId },
        include: { principal: true },
      });

      this.logger.log(`🏫 학원 정보 조회 결과:`, {
        academyId: academy?.id,
        hasPrincipal: !!academy?.principal,
        principalId: academy?.principal?.id,
      });

      if (academy?.principal) {
        targets.push({ userId: academy.principal.id, userRole: 'PRINCIPAL' });
        this.logger.log(`✅ 원장 타겟 추가: ${academy.principal.id}`);
      } else {
        this.logger.warn(`⚠️ 학원에 원장이 없음: academyId=${academy?.id}`);
      }

      this.logger.log(`🎯 최종 타겟 사용자 목록:`, targets);
    } catch (error) {
      this.logger.error('Failed to resolve enrollment event targets', error);
    }

    return targets;
  }

  // 환불요청 이벤트 타겟 해결 (원장 + 학생 + 담임선생)
  async resolveRefundEventTargets(
    refundRequest: any,
  ): Promise<
    { userId: number; userRole: 'STUDENT' | 'TEACHER' | 'PRINCIPAL' }[]
  > {
    const targets: {
      userId: number;
      userRole: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
    }[] = [];

    try {
      // 환불 신청한 학생
      targets.push({
        userId: refundRequest.sessionEnrollment.studentId,
        userRole: 'STUDENT',
      });

      // 해당 학원의 원장
      const academy = await this.prisma.academy.findUnique({
        where: { id: refundRequest.sessionEnrollment.session.class.academyId },
        include: { principal: true },
      });

      if (academy?.principal) {
        targets.push({ userId: academy.principal.id, userRole: 'PRINCIPAL' });
      }
    } catch (error) {
      this.logger.error('Failed to resolve refund event targets', error);
    }

    return targets;
  }

  // 클래스 이벤트 타겟 해결 (원장 + 담임선생)
  async resolveClassEventTargets(
    classData: any,
  ): Promise<
    { userId: number; userRole: 'STUDENT' | 'TEACHER' | 'PRINCIPAL' }[]
  > {
    const targets: {
      userId: number;
      userRole: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
    }[] = [];

    try {
      // 해당 학원의 원장
      const academy = await this.prisma.academy.findUnique({
        where: { id: classData.academyId },
        include: { principal: true },
      });

      if (academy?.principal) {
        targets.push({ userId: academy.principal.id, userRole: 'PRINCIPAL' });
      }

      // 담임 선생 (있는 경우)
      if (classData.teacherId) {
        targets.push({ userId: classData.teacherId, userRole: 'TEACHER' });
      }
    } catch (error) {
      this.logger.error('Failed to resolve class event targets', error);
    }

    return targets;
  }

  // 학원 이벤트 타겟 해결 (원장 + 해당 학원의 모든 선생님)
  async resolveAcademyEventTargets(
    academyData: any,
  ): Promise<
    { userId: number; userRole: 'STUDENT' | 'TEACHER' | 'PRINCIPAL' }[]
  > {
    const targets: {
      userId: number;
      userRole: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
    }[] = [];

    try {
      // 해당 학원의 원장
      const academy = await this.prisma.academy.findUnique({
        where: { id: academyData.id },
        include: {
          principal: true,
          teachers: true,
        },
      });

      if (academy?.principal) {
        targets.push({ userId: academy.principal.id, userRole: 'PRINCIPAL' });
      }

      // 해당 학원의 모든 선생님
      if (academy?.teachers) {
        academy.teachers.forEach((teacher) => {
          targets.push({ userId: teacher.id, userRole: 'TEACHER' });
        });
      }
    } catch (error) {
      this.logger.error('Failed to resolve academy event targets', error);
    }

    return targets;
  }
}
