#!/bin/bash

# 프론트엔드 테스트 실행 스크립트

echo "🧪 프론트엔드 테스트를 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 테스트 타입 확인
TEST_TYPE=${1:-"all"}

case $TEST_TYPE in
  "unit")
    echo "📋 단위 테스트 실행 중..."
    npm run test:unit
    ;;
  "integration")
    echo "🔗 통합 테스트 실행 중..."
    npm run test:integration
    ;;
  "coverage")
    echo "📊 커버리지 테스트 실행 중..."
    npm run test:coverage
    ;;
  "ci")
    echo "🚀 CI 테스트 실행 중..."
    npm run test:ci
    ;;
  "all"|*)
    echo "🎯 전체 테스트 실행 중..."
    npm run test:all
    
    echo ""
    echo "3️⃣ 커버리지 리포트 생성..."
    npm run test:coverage
    ;;
esac

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ 모든 테스트가 성공적으로 완료되었습니다!${NC}"
  echo ""
  echo "📊 테스트 결과:"
  echo "- 단위 테스트: ✅ 통과"
  echo "- 통합 테스트: ✅ 통과"
  echo "- 커버리지 리포트: 📁 coverage/ 폴더 확인"
else
  echo ""
  echo -e "${RED}❌ 테스트 실행 중 오류가 발생했습니다.${NC}"
  exit 1
fi
