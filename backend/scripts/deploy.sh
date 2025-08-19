#!/bin/bash

# 고도화된 배포 스크립트
# 1. 스키마 변경 감지
# 2. 변경 시 데이터 백업
# 3. 안전한 마이그레이션

set -e

echo "🚀 배포 프로세스 시작..."

# 환경 변수 확인
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL이 설정되지 않았습니다."
    exit 1
fi

# 백업 디렉토리 생성
BACKUP_DIR="/app/backups"
mkdir -p $BACKUP_DIR

# 현재 시간을 백업 파일명에 포함
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "📊 스키마 변경사항 확인 중..."

# 마이그레이션 상태 확인
MIGRATION_STATUS=$(npx prisma migrate status --schema=./prisma/schema.prisma 2>&1 || echo "MIGRATION_NEEDED")

if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo "✅ 데이터베이스 스키마가 최신 상태입니다. 마이그레이션이 필요하지 않습니다."
    echo "🚀 애플리케이션을 시작합니다..."
    exec node dist/src/main
else
    echo "⚠️  스키마 변경사항이 감지되었습니다."
    echo "📦 데이터 백업을 시작합니다..."
    
    # PostgreSQL 데이터베이스 백업
    if echo "$DATABASE_URL" | grep -q "postgresql"; then
        # PostgreSQL 백업
        pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
        echo "✅ PostgreSQL 백업 완료: $BACKUP_FILE"
    elif echo "$DATABASE_URL" | grep -q "mysql"; then
        # MySQL 백업 (필요시)
        echo "⚠️  MySQL 백업은 별도 설정이 필요합니다."
    else
        echo "⚠️  지원되지 않는 데이터베이스 타입입니다."
    fi
    
    echo "🔄 마이그레이션을 시작합니다..."
    
    # 마이그레이션 실행
    if npx prisma migrate deploy --schema=./prisma/schema.prisma; then
        echo "✅ 마이그레이션이 성공적으로 완료되었습니다."
        
        # 백업 파일 크기 확인 및 정리 (30일 이상 된 백업 삭제)
        echo "🧹 오래된 백업 파일 정리 중..."
        find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete 2>/dev/null || true
        
        echo "🚀 애플리케이션을 시작합니다..."
        exec node dist/src/main
    else
        echo "❌ 마이그레이션 실패!"
        echo "🔄 백업에서 복원을 시도합니다..."
        
        # 마이그레이션 실패 시 백업에서 복원
        if [ -f "$BACKUP_FILE" ]; then
            if echo "$DATABASE_URL" | grep -q "postgresql"; then
                psql "$DATABASE_URL" < "$BACKUP_FILE"
                echo "✅ 백업에서 복원 완료"
            fi
        fi
        
        echo "❌ 배포 실패. 수동 확인이 필요합니다."
        exit 1
    fi
fi
