# 통합 테스트 스크립트

이 디렉토리에는 통합 테스트 환경을 설정하고 관리하기 위한 스크립트들이 포함되어 있습니다.

## 📁 파일 목록

- `setup-integration-tests.sh` - Linux/Mac용 통합 테스트 환경 설정 스크립트
- `setup-integration-tests.bat` - Windows용 통합 테스트 환경 설정 스크립트

## 🚀 빠른 시작

### Linux/Mac 사용자

```bash
npm run test:setup
```

### Windows 사용자

```cmd
npm run test:setup:win
```

## 📋 스크립트가 수행하는 작업

1. **Docker Desktop 확인** - Docker가 실행 중인지 확인
2. **기존 테스트 DB 정리** - 이전 테스트 DB 컨테이너 정리
3. **테스트 DB 시작** - 새로운 테스트 DB 컨테이너 시작
4. **DB 준비 대기** - PostgreSQL이 완전히 준비될 때까지 대기
5. **환경변수 설정** - 테스트용 환경변수 설정
6. **Prisma 클라이언트 생성** - Prisma 클라이언트 재생성
7. **마이그레이션 실행** - 테스트 DB에 스키마 적용
8. **스키마 확인** - 테스트 DB 스키마 검증

## 🔧 수동 실행 방법

### 1. 테스트 DB 시작

```bash
npm run test:db:start
```

### 2. 테스트 DB 중지

```bash
npm run test:db:stop
```

### 3. 테스트 DB 재설정

```bash
npm run test:db:reset
```

### 4. 통합 테스트 실행

```bash
npm run test:integration
```

### 5. 전체 테스트 프로세스 (DB 시작 → 테스트 → DB 중지)

```bash
npm run test:full
```

## 🐳 Docker 컨테이너 정보

- **테스트 DB 포트**: 5433
- **테스트 DB 이름**: ballet_class_test_db
- **사용자**: postgres
- **비밀번호**: postgres

## 🔍 문제 해결

### Docker Desktop이 실행되지 않는 경우

1. Docker Desktop을 설치하고 실행하세요
2. Docker Desktop이 완전히 시작될 때까지 기다리세요

### 포트 충돌이 발생하는 경우

- 5433 포트가 이미 사용 중인지 확인하세요
- 다른 PostgreSQL 인스턴스를 중지하세요

### 마이그레이션 실패

```bash
# 테스트 DB 재설정 후 다시 시도
npm run test:db:reset
npm run test:setup
```

### 권한 문제 (Linux/Mac)

```bash
# 스크립트에 실행 권한 부여
chmod +x scripts/setup-integration-tests.sh
```

## 📝 환경변수

스크립트가 설정하는 환경변수:

```bash
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ballet_class_test_db
JWT_SECRET=test-jwt-secret-key-for-testing-only
```

## 🎯 권장 워크플로우

1. **첫 번째 설정**

   ```bash
   npm run test:setup
   ```

2. **일상적인 테스트 실행**

   ```bash
   npm run test:integration
   ```

3. **문제 발생 시 재설정**

   ```bash
   npm run test:db:reset
   npm run test:setup
   ```

4. **작업 완료 후 정리**
   ```bash
   npm run test:db:stop
   ```
