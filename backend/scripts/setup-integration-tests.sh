#!/bin/bash

# 통합 테스트 전체 프로세스 준비 스크립트
# 이 스크립트는 도커 설정, 테스트 DB 준비, 마이그레이션 실행을 모두 포함합니다.

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 통합 테스트 환경 설정을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Docker Desktop 확인
log_info "Docker Desktop 상태를 확인합니다..."
if ! docker info > /dev/null 2>&1; then
    log_error "Docker Desktop이 실행되지 않았습니다. Docker Desktop을 시작해주세요."
    exit 1
fi
log_success "Docker Desktop이 실행 중입니다."

# 2. 기존 테스트 DB 컨테이너 정리
log_info "기존 테스트 DB 컨테이너를 정리합니다..."
docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true
log_success "기존 테스트 DB 컨테이너가 정리되었습니다."

# 3. 테스트 DB 컨테이너 시작
log_info "테스트 DB 컨테이너를 시작합니다..."
docker-compose -f docker-compose.test.yml up -d
log_success "테스트 DB 컨테이너가 시작되었습니다."

# 4. 테스트 DB 준비 대기
log_info "테스트 DB가 준비될 때까지 대기합니다..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker exec backend-test-db-1 pg_isready -U postgres > /dev/null 2>&1; then
        log_success "테스트 DB가 준비되었습니다."
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "테스트 DB 준비 시간이 초과되었습니다."
        exit 1
    fi
    
    log_info "테스트 DB 준비 중... ($attempt/$max_attempts)"
    sleep 2
    attempt=$((attempt + 1))
done

# 5. 환경변수 설정
log_info "테스트 환경변수를 설정합니다..."
export NODE_ENV=test
export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/ballet_class_test_db"
export JWT_SECRET="test-jwt-secret-key-for-testing-only"

log_success "환경변수가 설정되었습니다."

# 6. Prisma 클라이언트 생성
log_info "Prisma 클라이언트를 생성합니다..."
npx prisma generate
log_success "Prisma 클라이언트가 생성되었습니다."

# 7. 테스트 DB 마이그레이션 실행
log_info "테스트 DB에 마이그레이션을 실행합니다..."
npx prisma migrate deploy --schema=./prisma/schema.prisma
log_success "마이그레이션이 완료되었습니다."

# 8. 테스트 DB 스키마 확인
log_info "테스트 DB 스키마를 확인합니다..."
npx prisma db pull --schema=./prisma/schema.prisma
log_success "테스트 DB 스키마가 확인되었습니다."

# 9. 테스트 실행 준비 완료
log_success "🎉 통합 테스트 환경 설정이 완료되었습니다!"
echo ""
echo "다음 명령어로 테스트를 실행할 수 있습니다:"
echo "  npm run test:integration"
echo ""
echo "테스트 DB를 중지하려면:"
echo "  npm run test:db:stop"
echo ""
echo "테스트 DB를 재시작하려면:"
echo "  npm run test:db:reset"
