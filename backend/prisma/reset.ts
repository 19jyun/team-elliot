import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🗑️  데이터베이스 초기화를 시작합니다...');

  try {
    // 외래 키 제약 조건을 고려하여 역순으로 삭제
    console.log('📝 활동 로그 삭제 중...');
    await prisma.activityLog.deleteMany();

    console.log('💰 환불 요청 삭제 중...');
    await prisma.refundRequest.deleteMany();

    console.log('💳 결제 내역 삭제 중...');
    await prisma.payment.deleteMany();

    console.log('📚 세션 등록 삭제 중...');
    await prisma.sessionEnrollment.deleteMany();

    console.log('📖 세션 콘텐츠 삭제 중...');
    await prisma.sessionContent.deleteMany();

    console.log('📅 클래스 세션 삭제 중...');
    await prisma.classSession.deleteMany();

    console.log('🎭 발레 자세 삭제 중...');
    await prisma.balletPose.deleteMany();

    console.log('📋 거절 상세 정보 삭제 중...');
    await prisma.rejectionDetail.deleteMany();

    console.log('📝 출석 기록 삭제 중...');
    await prisma.attendance.deleteMany();

    console.log('📚 수강 신청 삭제 중...');
    await prisma.enrollment.deleteMany();

    console.log('📢 공지사항 삭제 중...');
    await prisma.notice.deleteMany();

    console.log('🏦 은행 계좌 삭제 중...');
    await prisma.bankAccount.deleteMany();

    console.log('👥 학원 가입 신청 삭제 중...');
    await prisma.academyJoinRequest.deleteMany();

    console.log('🏫 학원 생성 요청 삭제 중...');
    await prisma.academyCreationRequest.deleteMany();

    console.log('👨‍🏫 학원 관리자 관계 삭제 중...');
    await prisma.academyAdmin.deleteMany();

    console.log('👥 학생-학원 관계 삭제 중...');
    await prisma.studentAcademy.deleteMany();

    console.log('📚 클래스 삭제 중...');
    await prisma.class.deleteMany();

    console.log('📖 클래스 상세 정보 삭제 중...');
    await prisma.classDetail.deleteMany();

    console.log('👨‍🏫 강사 삭제 중...');
    await prisma.teacher.deleteMany();

    console.log('👨‍💼 원장 삭제 중...');
    await prisma.principal.deleteMany();

    console.log('🏫 학원 삭제 중...');
    await prisma.academy.deleteMany();

    console.log('👨‍🎓 학생 삭제 중...');
    await prisma.student.deleteMany();

    console.log('👤 사용자 삭제 중...');
    await prisma.user.deleteMany();

    console.log('📝 탈퇴 이력 삭제 중...');
    await prisma.withdrawalHistory.deleteMany();

    console.log('✅ 데이터베이스 초기화가 완료되었습니다!');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류가 발생했습니다:', error);
    throw error;
  }
}

async function main() {
  try {
    await resetDatabase();
  } catch (error) {
    console.error('❌ 초기화 실패:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
