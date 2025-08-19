# 고도화된 배포 프로세스

## 개요

이 프로젝트는 안전하고 효율적인 배포를 위한 고도화된 배포 스크립트를 사용합니다.

## 주요 기능

### 1. 스키마 변경 감지

- 배포 시 데이터베이스 스키마 변경사항을 자동으로 감지
- 변경사항이 없으면 불필요한 마이그레이션을 건너뜀

### 2. 자동 데이터 백업

- 스키마 변경이 감지되면 자동으로 전체 데이터베이스 백업
- PostgreSQL의 `pg_dump`를 사용하여 안전한 백업 생성
- 백업 파일은 타임스탬프와 함께 저장

### 3. 안전한 마이그레이션

- 마이그레이션 실패 시 자동으로 백업에서 복원
- 롤백 기능으로 데이터 손실 방지

### 4. 자동 정리

- 30일 이상 된 백업 파일 자동 삭제
- 디스크 공간 효율적 관리

## 배포 프로세스

### 1. 스키마 상태 확인

```bash
npx prisma migrate status
```

### 2. 변경사항 감지

- 스키마가 최신 상태인 경우: 애플리케이션 바로 시작
- 변경사항이 있는 경우: 백업 → 마이그레이션 → 애플리케이션 시작

### 3. 백업 프로세스

```bash
pg_dump $DATABASE_URL > backup_YYYYMMDD_HHMMSS.sql
```

### 4. 마이그레이션 실행

```bash
npx prisma migrate deploy
```

### 5. 실패 시 복원

```bash
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

## 환경 변수

### 필수 환경 변수

- `DATABASE_URL`: 데이터베이스 연결 문자열

### 선택적 환경 변수

- `BACKUP_RETENTION_DAYS`: 백업 보관 기간 (기본값: 30일)

## 로그 메시지

### 성공 시

```
🚀 고도화된 배포 프로세스 시작...
📊 스키마 변경사항 확인 중...
✅ 데이터베이스 스키마가 최신 상태입니다. 마이그레이션이 필요하지 않습니다.
🚀 애플리케이션을 시작합니다...
```

### 변경사항 감지 시

```
⚠️  스키마 변경사항이 감지되었습니다.
📦 데이터 백업을 시작합니다...
✅ PostgreSQL 백업 완료: /app/backups/backup_20241219_143022.sql
🔄 마이그레이션을 시작합니다...
✅ 마이그레이션이 성공적으로 완료되었습니다.
🧹 오래된 백업 파일 정리 중...
🚀 애플리케이션을 시작합니다...
```

### 실패 시

```
❌ 마이그레이션 실패!
🔄 백업에서 복원을 시도합니다...
✅ 백업에서 복원 완료
❌ 배포 실패. 수동 확인이 필요합니다.
```

## 수동 실행

### 배포 스크립트 직접 실행

```bash
./scripts/deploy.sh
```

### 헬스체크 실행

```bash
node scripts/health-check.js
```

## 백업 관리

### 백업 파일 위치

```
/app/backups/
├── backup_20241219_143022.sql
├── backup_20241219_150045.sql
└── ...
```

### 백업 파일 정리

- 30일 이상 된 백업 파일은 자동 삭제
- 수동 정리: `find /app/backups -name "backup_*.sql" -mtime +30 -delete`

## 문제 해결

### 1. 권한 문제

```bash
chmod +x scripts/deploy.sh
```

### 2. PostgreSQL 클라이언트 설치

```bash
# Alpine Linux
apk add --no-cache postgresql-client

# Ubuntu/Debian
apt-get update && apt-get install -y postgresql-client
```

### 3. 백업 디렉토리 생성

```bash
mkdir -p /app/backups
chown -R nestjs:nodejs /app/backups
```

## 보안 고려사항

1. **백업 파일 보안**: 백업 파일은 민감한 데이터를 포함하므로 적절한 권한 설정 필요
2. **환경 변수**: `DATABASE_URL`은 반드시 환경 변수로 관리
3. **네트워크 보안**: 데이터베이스 연결은 SSL/TLS 사용 권장

## 모니터링

### 로그 확인

```bash
docker logs <container_name>
```

### 백업 상태 확인

```bash
ls -la /app/backups/
```

### 데이터베이스 상태 확인

```bash
npx prisma migrate status
```
