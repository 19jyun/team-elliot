#!/bin/bash

# 배포 스크립트
set -e

echo "🚀 배포 프로세스 시작..."

# 환경 변수 확인
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL이 설정되지 않았습니다."
    exit 1
fi

echo "📊 데이터베이스 연결 확인 중..."

# 데이터베이스 연결 테스트
if ! npx prisma db execute --stdin --schema=./prisma/schema.prisma <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ 데이터베이스 연결에 실패했습니다."
    exit 1
fi

echo "✅ 데이터베이스 연결 성공"

echo "🔄 마이그레이션 상태 확인 중..."

# 마이그레이션 실행 (안전하게)
if npx prisma migrate deploy --schema=./prisma/schema.prisma; then
    echo "✅ 마이그레이션이 성공적으로 완료되었습니다."
else
    echo "⚠️  마이그레이션 중 오류가 발생했습니다. 애플리케이션을 시작합니다..."
fi

# 발레 자세 시드 데이터 실행
echo "🌱 발레 자세 시드 데이터를 실행합니다..."
if npm run seed:deploy; then
    echo "✅ 발레 자세 시드 데이터가 성공적으로 실행되었습니다."
else
    echo "⚠️  시드 데이터 실행 중 오류가 발생했습니다. 애플리케이션을 계속 시작합니다..."
fi

echo "🚀 애플리케이션을 시작합니다..."
exec node dist/src/main
