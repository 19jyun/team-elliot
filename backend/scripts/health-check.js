const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function healthCheck() {
  try {
    // 데이터베이스 연결 확인
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ 데이터베이스 연결 정상');
    
    // 기본 테이블 존재 확인
    const userCount = await prisma.user.count();
    console.log(`✅ User 테이블 정상 (${userCount}개 레코드)`);
    
    return true;
  } catch (error) {
    console.error('❌ 헬스체크 실패:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// 직접 실행 시
if (require.main === module) {
  healthCheck()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = { healthCheck };
