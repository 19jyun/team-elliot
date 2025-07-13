import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 세션 자동 생성 함수
async function generateSessionsForClass(classId: number, classData: any) {
  const { dayOfWeek, startTime, endTime, startDate, endDate, maxStudents } =
    classData;

  // 요일을 숫자로 변환 (0: 일요일, 1: 월요일, ..., 6: 토요일)
  const dayOfWeekMap: { [key: string]: number } = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const targetDayOfWeek = dayOfWeekMap[dayOfWeek];

  if (targetDayOfWeek === undefined) {
    throw new Error('유효하지 않은 요일입니다.');
  }

  const sessions: Array<{
    classId: number;
    date: Date;
    startTime: Date;
    endTime: Date;
    maxStudents: number;
    currentStudents: number;
  }> = [];

  // 시작일부터 종료일까지 해당 요일의 세션들을 생성
  const currentDate = new Date(startDate);
  const endDateTime = new Date(endDate);

  while (currentDate <= endDateTime) {
    // 현재 날짜가 목표 요일인지 확인
    if (currentDate.getDay() === targetDayOfWeek) {
      // 해당 날짜의 시작 시간과 종료 시간 계산
      const sessionDate = new Date(currentDate);

      // 시간 설정
      const [startHour, startMinute] = startTime
        .toTimeString()
        .slice(0, 5)
        .split(':')
        .map(Number);
      const [endHour, endMinute] = endTime
        .toTimeString()
        .slice(0, 5)
        .split(':')
        .map(Number);

      // 해당 날짜에 시간 설정
      const sessionStartTime = new Date(currentDate);
      sessionStartTime.setHours(startHour, startMinute, 0, 0);

      const sessionEndTime = new Date(currentDate);
      sessionEndTime.setHours(endHour, endMinute, 0, 0);

      sessions.push({
        classId,
        date: sessionDate,
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        maxStudents,
        currentStudents: 0,
      });
    }

    // 다음 날로 이동
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 세션들을 데이터베이스에 일괄 생성
  if (sessions.length > 0) {
    await prisma.classSession.createMany({
      data: sessions,
      skipDuplicates: true,
    });
    console.log(
      `${sessions.length}개의 세션이 클래스 ${classData.className}에 생성되었습니다.`,
    );
  }
}

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // admin 계정 생성
  await prisma.user.upsert({
    where: { userId: 'admin123' },
    update: {},
    create: {
      userId: 'admin123',
      password: hashedPassword,
      name: '관리자',
      role: 'ADMIN',
    },
  });

  // 학원 생성
  const academy = await prisma.academy.upsert({
    where: { code: 'TEAM_ELLIOT_001' },
    update: {},
    create: {
      name: '팀 엘리엇 발레 학원',
      phoneNumber: '02-1234-5678',
      address: '서울특별시 강남구 테헤란로 123, 4층',
      description:
        '저희 팀 엘리엇 학원은 체계적이고 전문적인 발레 교육을 추구하는 강의를 진행합니다. 초보자부터 고급자까지 모든 레벨의 학생들을 위한 맞춤형 커리큘럼을 제공합니다.',
      code: 'TEAM_ELLIOT_001',
    },
  });

  // Create test teacher
  const teacher = await prisma.teacher.upsert({
    where: { userId: 'teacher123' },
    update: {
      introduction: '발레 전문 강사입니다.',
      photoUrl:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/003275e14680a43ac88565992b56287db7bb7004591769f658d3301ab4451933',
      education: [
        '동덕여대 무용(발레) 졸업',
        '현) 서초동 이지인무용 발레강사',
        '현) 신도림 레베랑스 발레 발레전임강사',
        '전) 방배동 자이로토닉서래 발레전임강사',
        '(배우 이하늬 개인레슨)',
        '전) 압구정 인사이드발레 성인반 강사',
      ],
      academyId: academy.id,
    },
    create: {
      userId: 'teacher123',
      password: hashedPassword,
      name: '고예진',
      introduction: '발레 전문 강사입니다.',
      photoUrl:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/003275e14680a43ac88565992b56287db7bb7004591769f658d3301ab4451933',
      education: [
        '동덕여대 무용(발레) 졸업',
        '현) 서초동 이지인무용 발레강사',
        '현) 신도림 레베랑스 발레 발레전임강사',
        '전) 방배동 자이로토닉서래 발레전임강사',
        '(배우 이하늬 개인레슨)',
        '전) 압구정 인사이드발레 성인반 강사',
      ],
      academyId: academy.id,
    },
  });

  // Create test student - create를 upsert로 변경
  const student = await prisma.student.upsert({
    where: { userId: 'student123' },
    update: {
      phoneNumber: '010-9876-5432',
    },
    create: {
      userId: 'student123',
      password: hashedPassword,
      name: '이학생',
      phoneNumber: '010-9876-5432',
    },
  });

  // 학생을 학원에 가입시킴
  await prisma.studentAcademy.upsert({
    where: {
      studentId_academyId: {
        studentId: student.id,
        academyId: academy.id,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      academyId: academy.id,
    },
  });

  // 클래스 상세 정보 생성
  const classDetail = await prisma.classDetail.create({
    data: {
      description:
        '발레를 처음 도전하는 분들을 위한 클래스입니다. 스트레칭부터 시작해 발레를 위한 근육 운동, 턴아웃의 개념, 그리고 기본 용어에 대한 이해까지 천천히 진행할 예정입니다.',
      teacherId: teacher.id,
      locationName: '더엘 스튜디오 무용연습실',
      mapImageUrl:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/5b7ef8992fb5c481fbdbc004b7599da5878d072d295ce6986f287f11754dc84b',
    },
  });

  // 강사 정보 업데이트
  await prisma.teacher.update({
    where: { id: teacher.id },
    data: {
      introduction: '발레 전문 강사입니다.',
      photoUrl:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/003275e14680a43ac88565992b56287db7bb7004591769f658d3301ab4451933',
      education: [
        '동덕여대 무용(발레) 졸업',
        '현) 서초동 이지인무용 발레강사',
        '현) 신도림 레베랑스 발레 발레전임강사',
        '전) 방배동 자이로토닉서래 발레전임강사',
        '(배우 이하늬 개인레슨)',
        '전) 압구정 인사이드발레 성인반 강사',
      ],
    },
  });

  // 클래스 카드 데이터 생성
  const classesData = [
    {
      className: '초급반',
      classCode: `BALLET-MON-${Math.floor(Math.random() * 1000) + 1}`,
      description: '초급자를 위한 발레 클래스',
      maxStudents: 10,
      tuitionFee: 150000,
      dayOfWeek: 'MONDAY',
      startTime: new Date('2024-01-01T06:00:00Z'),
      endTime: new Date('2024-01-01T07:00:00Z'),
      teacherId: teacher.id,
      academyId: academy.id,
      classDetailId: classDetail.id,
      level: 'BEGINNER',
      status: 'OPEN',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-08-31'),
      backgroundColor: 'orange-100',
    },
    {
      className: '고급반',
      classCode: `BALLET-WED-${Math.floor(Math.random() * 1000) + 1}`,
      description: '고급자를 위한 발레 클래스',
      maxStudents: 8,
      tuitionFee: 200000,
      dayOfWeek: 'WEDNESDAY',
      startTime: new Date('2024-01-01T06:00:00Z'),
      endTime: new Date('2024-01-01T07:00:00Z'),
      teacherId: teacher.id,
      academyId: academy.id,
      classDetailId: classDetail.id,
      level: 'ADVANCED',
      status: 'OPEN',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-08-31'),
      backgroundColor: 'slate-300',
    },
    {
      className: '비기너반',
      classCode: `BALLET-FRI-${Math.floor(Math.random() * 1000) + 1}`,
      description: '입문자를 위한 발레 클래스',
      maxStudents: 12,
      tuitionFee: 130000,
      dayOfWeek: 'FRIDAY',
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T10:00:00Z'),
      teacherId: teacher.id,
      academyId: academy.id,
      classDetailId: classDetail.id,
      level: 'BEGINNER',
      status: 'OPEN',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-08-31'),
      backgroundColor: 'rose-100',
    },
  ];

  // 클래스 생성 및 세션 자동 생성
  for (const classData of classesData) {
    const createdClass = await prisma.class.create({
      data: {
        ...classData,
      },
    });

    // 세션 자동 생성
    await generateSessionsForClass(createdClass.id, classData);
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
