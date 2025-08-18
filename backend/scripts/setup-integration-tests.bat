@echo off
setlocal enabledelayedexpansion

REM 통합 테스트 전체 프로세스 준비 스크립트 (Windows)
REM 이 스크립트는 도커 설정, 테스트 DB 준비, 마이그레이션 실행을 모두 포함합니다.

echo 🚀 통합 테스트 환경 설정을 시작합니다...

REM 1. Docker Desktop 확인
echo [INFO] Docker Desktop 상태를 확인합니다...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop이 실행되지 않았습니다. Docker Desktop을 시작해주세요.
    exit /b 1
)
echo [SUCCESS] Docker Desktop이 실행 중입니다.

REM 2. 기존 테스트 DB 컨테이너 정리
echo [INFO] 기존 테스트 DB 컨테이너를 정리합니다...
docker-compose -f docker-compose.test.yml down -v >nul 2>&1
echo [SUCCESS] 기존 테스트 DB 컨테이너가 정리되었습니다.

REM 3. 테스트 DB 컨테이너 시작
echo [INFO] 테스트 DB 컨테이너를 시작합니다...
docker-compose -f docker-compose.test.yml up -d
if errorlevel 1 (
    echo [ERROR] 테스트 DB 컨테이너 시작에 실패했습니다.
    exit /b 1
)
echo [SUCCESS] 테스트 DB 컨테이너가 시작되었습니다.

REM 4. 테스트 DB 준비 대기
echo [INFO] 테스트 DB가 준비될 때까지 대기합니다...
set max_attempts=30
set attempt=1

:wait_loop
docker exec backend-test-db-1 pg_isready -U postgres >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] 테스트 DB가 준비되었습니다.
    goto :continue
)

if %attempt% geq %max_attempts% (
    echo [ERROR] 테스트 DB 준비 시간이 초과되었습니다.
    exit /b 1
)

echo [INFO] 테스트 DB 준비 중... (%attempt%/%max_attempts%)
timeout /t 2 /nobreak >nul
set /a attempt+=1
goto :wait_loop

:continue

REM 5. 환경변수 설정
echo [INFO] 테스트 환경변수를 설정합니다...
set NODE_ENV=test
set DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ballet_class_test_db
set JWT_SECRET=test-jwt-secret-key-for-testing-only
echo [SUCCESS] 환경변수가 설정되었습니다.

REM 6. Prisma 클라이언트 생성
echo [INFO] Prisma 클라이언트를 생성합니다...
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Prisma 클라이언트 생성에 실패했습니다.
    exit /b 1
)
echo [SUCCESS] Prisma 클라이언트가 생성되었습니다.

REM 7. 테스트 DB 마이그레이션 실행
echo [INFO] 테스트 DB에 마이그레이션을 실행합니다...
call npx prisma migrate deploy --schema=./prisma/schema.prisma
if errorlevel 1 (
    echo [ERROR] 마이그레이션 실행에 실패했습니다.
    exit /b 1
)
echo [SUCCESS] 마이그레이션이 완료되었습니다.

REM 8. 테스트 DB 스키마 확인
echo [INFO] 테스트 DB 스키마를 확인합니다...
call npx prisma db pull --schema=./prisma/schema.prisma
if errorlevel 1 (
    echo [ERROR] 테스트 DB 스키마 확인에 실패했습니다.
    exit /b 1
)
echo [SUCCESS] 테스트 DB 스키마가 확인되었습니다.

REM 9. 테스트 실행 준비 완료
echo [SUCCESS] 🎉 통합 테스트 환경 설정이 완료되었습니다!
echo.
echo 다음 명령어로 테스트를 실행할 수 있습니다:
echo   npm run test:integration
echo.
echo 테스트 DB를 중지하려면:
echo   npm run test:db:stop
echo.
echo 테스트 DB를 재시작하려면:
echo   npm run test:db:reset
echo.

pause
