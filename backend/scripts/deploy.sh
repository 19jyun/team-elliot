#!/bin/bash

# 고도화된 배포 스크립트
set -e

echo "🚀 고도화된 배포 프로세스 시작..."

# 환경 변수 확인
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL이 설정되지 않았습니다."
    exit 1
fi

# 백업 보관 기간 설정 (기본값: 30일)
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# 백업 디렉토리 생성
BACKUP_DIR="/app/backups"
mkdir -p "$BACKUP_DIR"

echo "📊 데이터베이스 연결 확인 중..."

# 데이터베이스 연결 테스트
if ! npx prisma db execute --stdin --schema=./prisma/schema.prisma <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ 데이터베이스 연결에 실패했습니다."
    exit 1
fi

echo "✅ 데이터베이스 연결 성공"

echo "📊 스키마 변경사항 확인 중..."

# 마이그레이션 상태 확인
MIGRATION_STATUS=$(npx prisma migrate status --schema=./prisma/schema.prisma 2>&1 || echo "error")

if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo "✅ 데이터베이스 스키마가 최신 상태입니다. 마이그레이션이 필요하지 않습니다."
else
    echo "⚠️  스키마 변경사항이 감지되었습니다."
    
    # 백업 생성
    echo "📦 데이터 백업을 시작합니다..."
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if pg_dump "$DATABASE_URL" > "$BACKUP_FILE"; then
        echo "✅ PostgreSQL 백업 완료: $BACKUP_FILE"
    else
        echo "❌ 백업 생성에 실패했습니다."
        exit 1
    fi
    
    # 마이그레이션 실행
    echo "🔄 마이그레이션을 시작합니다..."
    if npx prisma migrate deploy --schema=./prisma/schema.prisma; then
        echo "✅ 마이그레이션이 성공적으로 완료되었습니다."
    else
        echo "❌ 마이그레이션 실패!"
        echo "🔄 백업에서 복원을 시도합니다..."
        
        if psql "$DATABASE_URL" < "$BACKUP_FILE"; then
            echo "✅ 백업에서 복원 완료"
        else
            echo "❌ 백업 복원 실패"
        fi
        echo "❌ 배포 실패. 수동 확인이 필요합니다."
        exit 1
    fi
    
    # 오래된 백업 파일 정리
    echo "🧹 오래된 백업 파일 정리 중..."
    find "$BACKUP_DIR" -name "backup_*.sql" -mtime +$BACKUP_RETENTION_DAYS -delete 2>/dev/null || true
fi

# 시드 데이터 실행 (발레 자세 데이터 포함)
echo "🌱 발레 자세 시드 데이터를 실행합니다..."
if npm run seed:deploy; then
    echo "✅ 발레 자세 시드 데이터가 성공적으로 실행되었습니다."
else
    echo "⚠️  시드 데이터 실행 중 오류가 발생했습니다. 애플리케이션을 계속 시작합니다..."
fi

echo "🚀 애플리케이션을 시작합니다..."
exec node dist/src/main
