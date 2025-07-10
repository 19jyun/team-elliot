import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassService } from '../class/class.service';
import { CreateClassDto } from '../admin/dto/create-class.dto';
import { CreateAcademyDto } from '../academy/dto/create-academy.dto';

@Injectable()
export class TeacherService {
  constructor(
    private prisma: PrismaService,
    private classService: ClassService,
  ) {}

  async createClass(teacherId: number, data: CreateClassDto) {
    return this.classService.createClass(data);
  }

  async getTeacherProfile(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        name: true,
        phoneNumber: true,
        introduction: true,
        photoUrl: true,
        education: true,
        specialties: true,
        certifications: true,
        yearsOfExperience: true,
        availableTimes: true,
        createdAt: true,
        updatedAt: true,
        academy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    return {
      id: teacher.id,
      userId: teacher.userId,
      name: teacher.name,
      phoneNumber: teacher.phoneNumber,
      introduction: teacher.introduction,
      photoUrl: teacher.photoUrl,
      education: teacher.education,
      specialties: teacher.specialties,
      certifications: teacher.certifications,
      yearsOfExperience: teacher.yearsOfExperience,
      availableTimes: teacher.availableTimes,
      academyId: teacher.academy.id,
      academyName: teacher.academy.name,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };
  }

  async updateProfile(
    id: number,
    updateData: {
      name?: string;
      phoneNumber?: string;
      introduction?: string;
      education?: string[];
      specialties?: string[];
      certifications?: string[];
      yearsOfExperience?: number;
      availableTimes?: any;
    },
    photo?: Express.Multer.File,
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    const photoUrl = photo
      ? `/uploads/profile-photos/${photo.filename}`
      : undefined;

    const updatedTeacher = await this.prisma.teacher.update({
      where: { id },
      data: {
        ...updateData,
        ...(photoUrl && { photoUrl }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        name: true,
        phoneNumber: true,
        introduction: true,
        photoUrl: true,
        education: true,
        specialties: true,
        certifications: true,
        yearsOfExperience: true,
        availableTimes: true,
        createdAt: true,
        updatedAt: true,
        academy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: updatedTeacher.id,
      userId: updatedTeacher.userId,
      name: updatedTeacher.name,
      phoneNumber: updatedTeacher.phoneNumber,
      introduction: updatedTeacher.introduction,
      photoUrl: updatedTeacher.photoUrl,
      education: updatedTeacher.education,
      specialties: updatedTeacher.specialties,
      certifications: updatedTeacher.certifications,
      yearsOfExperience: updatedTeacher.yearsOfExperience,
      availableTimes: updatedTeacher.availableTimes,
      academyId: updatedTeacher.academy.id,
      academyName: updatedTeacher.academy.name,
      createdAt: updatedTeacher.createdAt,
      updatedAt: updatedTeacher.updatedAt,
    };
  }

  async getTeacherClasses(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            enrollments: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    // startDate와 endDate를 포함하여 반환
    return teacher.classes.map((class_) => ({
      id: class_.id,
      className: class_.className,
      dayOfWeek: class_.dayOfWeek,
      startTime: class_.startTime,
      endTime: class_.endTime,
      startDate: class_.startDate,
      endDate: class_.endDate,
      maxStudents: class_.maxStudents,
      currentStudents: class_.currentStudents,
      level: class_.level,
      tuitionFee: class_.tuitionFee,
      description: class_.description,
      backgroundColor: class_.backgroundColor,
      enrollments: class_.enrollments,
    }));
  }

  async getTeacherClassesWithSessions(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            enrollments: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            classSessions: {
              include: {
                enrollments: {
                  include: {
                    student: {
                      select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                        level: true,
                      },
                    },
                    payment: true,
                    refundRequests: true,
                  },
                },
              },
              orderBy: {
                date: 'asc',
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    // 클래스와 세션 정보를 분리하여 반환
    const classes = teacher.classes.map((class_) => ({
      id: class_.id,
      className: class_.className,
      dayOfWeek: class_.dayOfWeek,
      startTime: class_.startTime,
      endTime: class_.endTime,
      startDate: class_.startDate,
      endDate: class_.endDate,
      maxStudents: class_.maxStudents,
      currentStudents: class_.currentStudents,
      level: class_.level,
      tuitionFee: class_.tuitionFee,
      description: class_.description,
      backgroundColor: class_.backgroundColor,

      enrollments: class_.enrollments,
    }));

    const sessions = teacher.classes.flatMap((class_) =>
      class_.classSessions.map((session) => ({
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        class: {
          id: class_.id,
          className: class_.className,
          maxStudents: class_.maxStudents,
          level: class_.level,
          teacher: {
            id: teacher.id,
            name: teacher.name,
          },
        },
        enrollmentCount: session.enrollments.length,
        confirmedCount: session.enrollments.filter(
          (enrollment) => enrollment.status === 'CONFIRMED',
        ).length,
      })),
    );

    return {
      classes,
      sessions,
    };
  }

  // 선생님의 현재 학원 정보 조회
  async getMyAcademy(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        academy: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    return teacher.academy;
  }

  // 선생님의 학원 변경
  async changeAcademy(teacherId: number, academyCode: string) {
    // 학원 코드로 학원 찾기
    const academy = await this.prisma.academy.findUnique({
      where: { code: academyCode },
    });

    if (!academy) {
      throw new NotFoundException('해당 코드의 학원을 찾을 수 없습니다.');
    }

    // 선생님 정보 업데이트
    const updatedTeacher = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: {
        academyId: academy.id,
        updatedAt: new Date(),
      },
      include: {
        academy: true,
      },
    });

    return updatedTeacher.academy;
  }

  // 선생님이 새 학원 생성 (관리자 권한과 동일)
  async createAcademy(createAcademyDto: CreateAcademyDto) {
    // 학원 코드 중복 체크
    const existingAcademy = await this.prisma.academy.findUnique({
      where: { code: createAcademyDto.code },
    });

    if (existingAcademy) {
      throw new ConflictException('이미 존재하는 학원 코드입니다.');
    }

    // 새 학원 생성
    const newAcademy = await this.prisma.academy.create({
      data: createAcademyDto,
    });

    return newAcademy;
  }

  // 선생님이 새 학원을 생성하고 자동으로 소속되기
  async createAndJoinAcademy(
    teacherId: number,
    createAcademyDto: CreateAcademyDto,
  ) {
    // 새 학원 생성
    const newAcademy = await this.createAcademy(createAcademyDto);

    // 선생님을 새 학원에 소속시키기
    const updatedTeacher = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: {
        academyId: newAcademy.id,
        updatedAt: new Date(),
      },
      include: {
        academy: true,
      },
    });

    return {
      academy: newAcademy,
      teacher: updatedTeacher,
    };
  }
}
