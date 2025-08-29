import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademyDto, JoinAcademyDto, LeaveAcademyDto } from './dto';

@Injectable()
export class AcademyService {
  constructor(private prisma: PrismaService) {}

  // 학원 생성 (관리자)
  async createAcademy(dto: CreateAcademyDto) {
    const exists = await this.prisma.academy.findUnique({
      where: { code: dto.code },
    });
    if (exists) {
      throw new ConflictException({
        code: 'ACADEMY_CODE_ALREADY_EXISTS',
        message: '이미 존재하는 학원 코드입니다.',
        details: { code: dto.code },
      });
    }
    return this.prisma.academy.create({ data: dto });
  }

  // 학원 삭제 (관리자)
  async deleteAcademy(academyId: number) {
    const academy = await this.prisma.academy.findUnique({
      where: { id: academyId },
      include: {
        classes: { include: { classSessions: true } },
        teachers: true,
        students: true,
      },
    });
    if (!academy) {
      throw new NotFoundException({
        code: 'ACADEMY_NOT_FOUND',
        message: '학원을 찾을 수 없습니다.',
        details: { academyId },
      });
    }
    if (academy.teachers.length > 0) {
      throw new BadRequestException({
        code: 'ACADEMY_HAS_TEACHERS',
        message: '소속된 선생님이 있어 삭제할 수 없습니다.',
        details: { teacherCount: academy.teachers.length },
      });
    }
    if (academy.students.length > 0) {
      throw new BadRequestException({
        code: 'ACADEMY_HAS_STUDENTS',
        message: '가입된 학생이 있어 삭제할 수 없습니다.',
        details: { studentCount: academy.students.length },
      });
    }
    await this.prisma.$transaction(async (tx) => {
      for (const c of academy.classes) {
        await tx.classSession.deleteMany({ where: { classId: c.id } });
      }
      await tx.class.deleteMany({ where: { academyId } });
      await tx.academy.delete({ where: { id: academyId } });
    });
    return { message: '학원이 성공적으로 삭제되었습니다.' };
  }

  // 학원 목록 (공통)
  async getAcademies() {
    return this.prisma.academy.findMany();
  }

  // 학원 상세 (공통)
  async getAcademyById(id: number) {
    const academy = await this.prisma.academy.findUnique({ where: { id } });
    if (!academy) {
      throw new NotFoundException({
        code: 'ACADEMY_NOT_FOUND',
        message: '학원을 찾을 수 없습니다.',
        details: { academyId: id },
      });
    }
    return academy;
  }

  // 학원 가입 (학생)
  async joinAcademy(userId: number, dto: JoinAcademyDto) {
    // 먼저 student 정보를 userRefId로 조회
    const student = await this.prisma.student.findUnique({
      where: { userRefId: userId },
    });
    if (!student) {
      throw new NotFoundException({
        code: 'STUDENT_NOT_FOUND',
        message: '학생을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    const academy = await this.prisma.academy.findUnique({
      where: { code: dto.code },
    });
    if (!academy) {
      throw new NotFoundException({
        code: 'ACADEMY_CODE_NOT_FOUND',
        message: '해당 코드의 학원을 찾을 수 없습니다.',
        details: { code: dto.code },
      });
    }

    const exists = await this.prisma.studentAcademy.findUnique({
      where: {
        studentId_academyId: { studentId: student.id, academyId: academy.id },
      },
    });
    if (exists) {
      throw new ConflictException({
        code: 'STUDENT_ALREADY_JOINED',
        message: '이미 가입된 학원입니다.',
        details: { academyId: academy.id, academyName: academy.name },
      });
    }

    await this.prisma.studentAcademy.create({
      data: { studentId: student.id, academyId: academy.id },
    });
    return { message: '학원 가입이 완료되었습니다.' };
  }

  // 학원 탈퇴 (학생)
  async leaveAcademy(userId: number, dto: LeaveAcademyDto) {
    // 먼저 student 정보를 userRefId로 조회
    const student = await this.prisma.student.findUnique({
      where: { userRefId: userId },
    });
    if (!student) {
      throw new NotFoundException({
        code: 'STUDENT_NOT_FOUND',
        message: '학생을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    const exists = await this.prisma.studentAcademy.findUnique({
      where: {
        studentId_academyId: {
          studentId: student.id,
          academyId: dto.academyId,
        },
      },
    });
    if (!exists) {
      throw new BadRequestException({
        code: 'STUDENT_NOT_JOINED',
        message: '가입되지 않은 학원입니다.',
        details: { academyId: dto.academyId },
      });
    }

    await this.prisma.studentAcademy.delete({
      where: {
        studentId_academyId: {
          studentId: student.id,
          academyId: dto.academyId,
        },
      },
    });
    return { message: '학원 탈퇴가 완료되었습니다.' };
  }

  // 내가 가입한 학원 목록 (학생)
  async getMyAcademies(userId: number) {
    // 먼저 student 정보를 userRefId로 조회
    const student = await this.prisma.student.findUnique({
      where: { userRefId: userId },
      include: {
        academies: {
          include: { academy: true },
        },
      },
    });
    if (!student) {
      throw new NotFoundException({
        code: 'STUDENT_NOT_FOUND',
        message: '학생을 찾을 수 없습니다.',
        details: { userId },
      });
    }
    return student.academies.map((sa) => sa.academy);
  }

  // Teacher의 학원 조회
  async getTeacherAcademy(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        academy: {
          include: {
            principal: true,
            teachers: {
              include: {
                classes: {
                  include: {
                    classSessions: true,
                  },
                },
              },
            },
            classes: {
              include: {
                teacher: true,
                classSessions: {
                  include: {
                    enrollments: {
                      include: {
                        student: true,
                      },
                    },
                  },
                },
              },
            },
            students: {
              include: {
                student: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException({
        code: 'TEACHER_NOT_FOUND',
        message: '선생님을 찾을 수 없습니다.',
        details: { teacherId },
      });
    }

    return teacher.academy;
  }

  // Teacher의 학원 변경
  async changeTeacherAcademy(teacherId: number, academyCode: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException({
        code: 'TEACHER_NOT_FOUND',
        message: '선생님을 찾을 수 없습니다.',
        details: { teacherId },
      });
    }

    const academy = await this.prisma.academy.findUnique({
      where: { code: academyCode },
    });

    if (!academy) {
      throw new NotFoundException({
        code: 'ACADEMY_CODE_NOT_FOUND',
        message: '해당 코드의 학원을 찾을 수 없습니다.',
        details: { code: academyCode },
      });
    }

    // Teacher의 학원 변경
    const updatedTeacher = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: {
        academyId: academy.id,
      },
      include: {
        academy: true,
      },
    });

    return updatedTeacher;
  }

  // Teacher가 학원 생성
  async createAcademyByTeacher(createAcademyDto: any, teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException({
        code: 'TEACHER_NOT_FOUND',
        message: '선생님을 찾을 수 없습니다.',
        details: { teacherId },
      });
    }

    // 학원 코드 중복 확인
    const existingAcademy = await this.prisma.academy.findUnique({
      where: { code: createAcademyDto.code },
    });

    if (existingAcademy) {
      throw new ConflictException({
        code: 'ACADEMY_CODE_ALREADY_EXISTS',
        message: '이미 존재하는 학원 코드입니다.',
        details: { code: createAcademyDto.code },
      });
    }

    // 학원 생성
    const academy = await this.prisma.academy.create({
      data: {
        name: createAcademyDto.name,
        code: createAcademyDto.code,
        phoneNumber: createAcademyDto.phoneNumber,
        address: createAcademyDto.address,
        description: createAcademyDto.description,
      },
    });

    return academy;
  }

  // Teacher가 학원 생성 후 가입
  async createAndJoinAcademyByTeacher(
    teacherId: number,
    createAcademyDto: any,
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException({
        code: 'TEACHER_NOT_FOUND',
        message: '선생님을 찾을 수 없습니다.',
        details: { teacherId },
      });
    }

    // 학원 코드 중복 확인
    const existingAcademy = await this.prisma.academy.findUnique({
      where: { code: createAcademyDto.code },
    });

    if (existingAcademy) {
      throw new ConflictException({
        code: 'ACADEMY_CODE_ALREADY_EXISTS',
        message: '이미 존재하는 학원 코드입니다.',
        details: { code: createAcademyDto.code },
      });
    }

    // 트랜잭션으로 학원 생성 및 Teacher 가입
    const result = await this.prisma.$transaction(async (prisma) => {
      // 학원 생성
      const academy = await prisma.academy.create({
        data: {
          name: createAcademyDto.name,
          code: createAcademyDto.code,
          phoneNumber: createAcademyDto.phoneNumber,
          address: createAcademyDto.address,
          description: createAcademyDto.description,
        },
      });

      // Teacher를 학원에 가입
      const updatedTeacher = await prisma.teacher.update({
        where: { id: teacherId },
        data: {
          academyId: academy.id,
        },
        include: {
          academy: true,
        },
      });

      return { academy, teacher: updatedTeacher };
    });

    return result;
  }

  // Teacher가 학원 정보 수정
  async updateAcademyByTeacher(teacherId: number, updateAcademyDto: any) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { academy: true },
    });

    if (!teacher) {
      throw new NotFoundException({
        code: 'TEACHER_NOT_FOUND',
        message: '선생님을 찾을 수 없습니다.',
        details: { teacherId },
      });
    }

    if (!teacher.academy) {
      throw new BadRequestException({
        code: 'TEACHER_NOT_IN_ACADEMY',
        message: '소속된 학원이 없습니다.',
        details: { teacherId },
      });
    }

    // 학원 정보 업데이트
    const updatedAcademy = await this.prisma.academy.update({
      where: { id: teacher.academyId },
      data: {
        name: updateAcademyDto.name,
        phoneNumber: updateAcademyDto.phoneNumber,
        address: updateAcademyDto.address,
        description: updateAcademyDto.description,
      },
    });

    return updatedAcademy;
  }

  // Teacher가 학원 탈퇴
  async leaveAcademyByTeacher(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { academy: true },
    });

    if (!teacher) {
      throw new NotFoundException({
        code: 'TEACHER_NOT_FOUND',
        message: '선생님을 찾을 수 없습니다.',
        details: { teacherId },
      });
    }

    if (!teacher.academy) {
      throw new BadRequestException({
        code: 'TEACHER_NOT_IN_ACADEMY',
        message: '소속된 학원이 없습니다.',
        details: { teacherId },
      });
    }

    // Teacher가 가진 클래스가 있는지 확인
    const teacherClasses = await this.prisma.class.findMany({
      where: { teacherId },
    });

    if (teacherClasses.length > 0) {
      throw new BadRequestException({
        code: 'TEACHER_HAS_CLASSES',
        message: '담당하고 있는 클래스가 있어 학원을 탈퇴할 수 없습니다.',
        details: { classCount: teacherClasses.length },
      });
    }

    // Teacher를 학원에서 분리
    const updatedTeacher = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: {
        academyId: null,
      },
      include: {
        academy: true,
      },
    });

    return updatedTeacher;
  }

  // Teacher가 학원 가입 요청
  async requestJoinAcademyByTeacher(
    teacherId: number,
    joinAcademyRequestDto: any,
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException({
        code: 'TEACHER_NOT_FOUND',
        message: '선생님을 찾을 수 없습니다.',
        details: { teacherId },
      });
    }

    // 이미 학원에 소속되어 있는지 확인
    if (teacher.academyId) {
      throw new BadRequestException({
        code: 'TEACHER_ALREADY_IN_ACADEMY',
        message: '이미 학원에 소속되어 있습니다.',
        details: { academyId: teacher.academyId },
      });
    }

    // 학원 코드로 학원 찾기
    const academy = await this.prisma.academy.findUnique({
      where: { code: joinAcademyRequestDto.code },
    });

    if (!academy) {
      throw new NotFoundException({
        code: 'ACADEMY_CODE_NOT_FOUND',
        message: '해당 코드의 학원을 찾을 수 없습니다.',
        details: { code: joinAcademyRequestDto.code },
      });
    }

    // 이미 가입 요청이 있는지 확인
    const existingRequest = await this.prisma.academyJoinRequest.findFirst({
      where: {
        teacherId,
        academyId: academy.id,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new BadRequestException({
        code: 'JOIN_REQUEST_ALREADY_EXISTS',
        message: '이미 가입 요청이 진행 중입니다.',
        details: { requestId: existingRequest.id },
      });
    }

    // 가입 요청 생성
    const request = await this.prisma.academyJoinRequest.create({
      data: {
        teacherId,
        academyId: academy.id,
        message: joinAcademyRequestDto.message,
        status: 'PENDING',
      },
      include: {
        teacher: true,
        academy: true,
      },
    });

    return request;
  }

  // Student의 학원 목록 조회
  async getStudentAcademies(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        academies: {
          include: { academy: true },
        },
      },
    });
    if (!student) {
      throw new NotFoundException({
        code: 'STUDENT_NOT_FOUND',
        message: '학생을 찾을 수 없습니다.',
        details: { studentId },
      });
    }
    return student.academies.map((sa) => sa.academy);
  }

  // Student가 학원 가입
  async joinAcademyByStudent(studentId: number, joinAcademyDto: any) {
    const academy = await this.prisma.academy.findUnique({
      where: { code: joinAcademyDto.code },
    });
    if (!academy) {
      throw new NotFoundException({
        code: 'ACADEMY_CODE_NOT_FOUND',
        message: '해당 코드의 학원을 찾을 수 없습니다.',
        details: { code: joinAcademyDto.code },
      });
    }

    const exists = await this.prisma.studentAcademy.findUnique({
      where: { studentId_academyId: { studentId, academyId: academy.id } },
    });
    if (exists) {
      throw new ConflictException({
        code: 'STUDENT_ALREADY_JOINED',
        message: '이미 가입된 학원입니다.',
        details: { academyId: academy.id, academyName: academy.name },
      });
    }

    await this.prisma.studentAcademy.create({
      data: { studentId, academyId: academy.id },
    });
    return { message: '학원 가입이 완료되었습니다.' };
  }

  // Student가 학원 탈퇴
  async leaveAcademyByStudent(studentId: number, leaveAcademyDto: any) {
    const exists = await this.prisma.studentAcademy.findUnique({
      where: {
        studentId_academyId: {
          studentId,
          academyId: leaveAcademyDto.academyId,
        },
      },
    });
    if (!exists) {
      throw new BadRequestException({
        code: 'STUDENT_NOT_JOINED',
        message: '가입되지 않은 학원입니다.',
        details: { academyId: leaveAcademyDto.academyId },
      });
    }

    await this.prisma.studentAcademy.delete({
      where: {
        studentId_academyId: {
          studentId,
          academyId: leaveAcademyDto.academyId,
        },
      },
    });
    return { message: '학원 탈퇴가 완료되었습니다.' };
  }

  // Principal이 Student를 학원에서 제거
  async removeStudentFromAcademyByTeacher(
    principalTeacherId: number,
    studentId: number,
  ) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalTeacherId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: '원장을 찾을 수 없습니다.',
        details: { principalId: principalTeacherId },
      });
    }

    if (!principal.academy) {
      throw new BadRequestException({
        code: 'PRINCIPAL_NOT_IN_ACADEMY',
        message: '소속된 학원이 없습니다.',
        details: { principalId: principalTeacherId },
      });
    }

    // 해당 수강생이 Teacher의 학원에 속하는지 확인
    const studentAcademy = await this.prisma.studentAcademy.findFirst({
      where: {
        studentId,
        academyId: principal.academyId,
      },
    });

    if (!studentAcademy) {
      throw new ForbiddenException({
        code: 'STUDENT_NOT_IN_ACADEMY',
        message: '해당 수강생에 접근할 권한이 없습니다.',
        details: { studentId, academyId: principal.academyId },
      });
    }

    // 수강생을 학원에서 제거
    await this.prisma.studentAcademy.delete({
      where: { id: studentAcademy.id },
    });

    return { message: '수강생이 학원에서 제거되었습니다.' };
  }

  // Teacher가 Student를 학원에서 완전히 제거 (모든 관련 데이터 삭제)
  async removeStudentFromAcademyByTeacherComplete(
    principalTeacherId: number,
    studentId: number,
  ) {
    // 권한 확인
    const principalTeacher = await this.prisma.teacher.findUnique({
      where: { id: principalTeacherId },
      include: {
        academy: {
          include: {
            principal: true,
          },
        },
      },
    });

    if (!principalTeacher?.academy) {
      throw new NotFoundException({
        code: 'TEACHER_NOT_IN_ACADEMY',
        message: '소속된 학원이 없습니다.',
        details: { teacherId: principalTeacherId },
      });
    }

    const isPrincipal =
      principalTeacher.academy.principal?.id === principalTeacherId;
    if (!isPrincipal) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_PERMISSIONS',
        message: '학원 관리 권한이 없습니다.',
        details: { teacherId: principalTeacherId, requiredRole: 'PRINCIPAL' },
      });
    }

    // 수강생이 해당 학원에 속하는지 확인
    const studentAcademy = await this.prisma.studentAcademy.findUnique({
      where: {
        studentId_academyId: {
          studentId: studentId,
          academyId: principalTeacher.academy.id,
        },
      },
    });

    if (!studentAcademy) {
      throw new NotFoundException({
        code: 'STUDENT_NOT_IN_ACADEMY',
        message: '해당 수강생을 찾을 수 없습니다.',
        details: { studentId, academyId: principalTeacher.academy.id },
      });
    }

    // 수강생의 모든 세션 수강 내역과 관련 데이터 삭제
    await this.prisma.$transaction(async (tx) => {
      // 1. 수강생의 세션 수강 신청 내역 삭제
      await tx.sessionEnrollment.deleteMany({
        where: {
          studentId: studentId,
          session: {
            class: {
              academyId: principalTeacher.academy.id,
            },
          },
        },
      });

      // 2. 수강생의 클래스 수강 신청 내역 삭제
      await tx.enrollment.deleteMany({
        where: {
          studentId: studentId,
          class: {
            academyId: principalTeacher.academy.id,
          },
        },
      });

      // 3. 수강생의 출석 기록 삭제
      await tx.attendance.deleteMany({
        where: {
          studentId: studentId,
          class: {
            academyId: principalTeacher.academy.id,
          },
        },
      });

      // 4. 수강생의 결제 내역 삭제
      await tx.payment.deleteMany({
        where: {
          studentId: studentId,
          sessionEnrollment: {
            session: {
              class: {
                academyId: principalTeacher.academy.id,
              },
            },
          },
        },
      });

      // 5. 수강생의 환불 요청 내역 삭제
      await tx.refundRequest.deleteMany({
        where: {
          studentId: studentId,
          sessionEnrollment: {
            session: {
              class: {
                academyId: principalTeacher.academy.id,
              },
            },
          },
        },
      });

      // 6. 수강생을 학원에서 제거
      await tx.studentAcademy.delete({
        where: {
          studentId_academyId: {
            studentId: studentId,
            academyId: principalTeacher.academy.id,
          },
        },
      });
    });

    return { message: '수강생이 학원에서 제거되었습니다.' };
  }
}
