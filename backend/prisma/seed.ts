import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
      currentStudents: 0,
      tuitionFee: 150000,
      dayOfWeek: 'MONDAY',
      startTime: new Date('2024-01-01T06:00:00Z'),
      endTime: new Date('2024-01-01T07:00:00Z'),
      teacherId: teacher.id,
      classDetailId: classDetail.id,
      level: 'BEGINNER',
      status: 'OPEN',
      registrationMonth: new Date('2024-01-01'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      registrationStartDate: new Date('2023-12-20'),
      registrationEndDate: new Date('2023-12-31'),
      backgroundColor: 'orange-100',
    },
    {
      className: '고급반',
      classCode: `BALLET-WED-${Math.floor(Math.random() * 1000) + 1}`,
      description: '고급자를 위한 발레 클래스',
      maxStudents: 8,
      currentStudents: 0,
      tuitionFee: 200000,
      dayOfWeek: 'WEDNESDAY',
      startTime: new Date('2024-01-01T06:00:00Z'),
      endTime: new Date('2024-01-01T07:00:00Z'),
      teacherId: teacher.id,
      classDetailId: classDetail.id,
      level: 'ADVANCED',
      status: 'OPEN',
      registrationMonth: new Date('2024-01-01'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      registrationStartDate: new Date('2023-12-20'),
      registrationEndDate: new Date('2023-12-31'),
      backgroundColor: 'slate-300',
    },
    {
      className: '비기너반',
      classCode: `BALLET-FRI-${Math.floor(Math.random() * 1000) + 1}`,
      description: '입문자를 위한 발레 클래스',
      maxStudents: 12,
      currentStudents: 0,
      tuitionFee: 130000,
      dayOfWeek: 'FRIDAY',
      startTime: new Date('2024-01-01T09:00:00Z'),
      endTime: new Date('2024-01-01T10:00:00Z'),
      teacherId: teacher.id,
      classDetailId: classDetail.id,
      level: 'BEGINNER',
      status: 'OPEN',
      registrationMonth: new Date('2024-01-01'),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      registrationStartDate: new Date('2023-12-20'),
      registrationEndDate: new Date('2023-12-31'),
      backgroundColor: 'rose-100',
    },
  ];

  // 클래스 생성
  for (const classData of classesData) {
    await prisma.class.create({
      data: {
        ...classData,
      },
    });
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
