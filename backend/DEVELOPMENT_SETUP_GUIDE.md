# ⚙️ Team Elliot 개발 환경 설정 가이드

새로운 개발자가 Team Elliot 프로젝트를 시작할 수 있도록 상세한 환경 설정 가이드를 제공합니다.

## 📋 목차

1. [시작하기 전에](#시작하기-전에)
2. [필수 요구사항](#필수-요구사항)
3. [개발 환경 설정](#개발-환경-설정)
4. [프로젝트 설정](#프로젝트-설정)
5. [데이터베이스 설정](#데이터베이스-설정)
6. [개발 서버 실행](#개발-서버-실행)
7. [테스트 환경 설정](#테스트-환경-설정)
8. [개발 도구 설정](#개발-도구-설정)
9. [문제 해결](#문제-해결)
10. [다음 단계](#다음-단계)

## 🚀 시작하기 전에

### 프로젝트 개요

Team Elliot은 발레 학원 관리 시스템으로, 다음과 같은 기술 스택을 사용합니다:

- **Backend**: NestJS + TypeScript + PostgreSQL
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Real-time**: Socket.io
- **Authentication**: JWT + Passport

### 개발 환경 요구사항

- **운영체제**: macOS, Windows, Linux 지원
- **Node.js**: 18.x 이상
- **데이터베이스**: PostgreSQL 15+
- **메모리**: 최소 8GB RAM 권장
- **저장공간**: 최소 5GB 여유 공간

## 🔧 필수 요구사항

### 1. Node.js 설치

#### macOS (Homebrew 사용)

```bash
# Homebrew 설치 (없는 경우)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 설치
brew install node

# 버전 확인
node --version  # 18.x 이상
npm --version   # 9.x 이상
```

#### Windows

1. [Node.js 공식 사이트](https://nodejs.org/)에서 LTS 버전 다운로드
2. 설치 프로그램 실행
3. 환경 변수 설정 확인

#### Linux (Ubuntu/Debian)

```bash
# NodeSource 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Node.js 설치
sudo apt-get install -y nodejs

# 버전 확인
node --version
npm --version
```

### 2. PostgreSQL 설치

#### macOS (Homebrew 사용)

```bash
# PostgreSQL 설치
brew install postgresql@15

# 서비스 시작
brew services start postgresql@15

# 데이터베이스 생성
createdb ballet_academy_dev
```

#### Windows

1. [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/)에서 다운로드
2. 설치 프로그램 실행 (비밀번호 기억하기)
3. pgAdmin 설치 (선택사항)

#### Linux (Ubuntu/Debian)

```bash
# PostgreSQL 저장소 추가
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# PostgreSQL 설치
sudo apt-get update
sudo apt-get install -y postgresql-15 postgresql-contrib-15

# 서비스 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 데이터베이스 생성
sudo -u postgres createdb ballet_academy_dev
```

### 3. Git 설치

#### macOS

```bash
# Homebrew로 설치
brew install git

# 또는 Xcode Command Line Tools로 설치
xcode-select --install
```

#### Windows

1. [Git for Windows](https://gitforwindows.org/) 다운로드
2. 설치 프로그램 실행

#### Linux

```bash
sudo apt-get install git  # Ubuntu/Debian
sudo yum install git      # CentOS/RHEL
```

### 4. Docker 설치 (선택사항)

#### macOS

```bash
# Docker Desktop 설치
brew install --cask docker
```

#### Windows

1. [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows/) 다운로드
2. WSL2 설정 확인

#### Linux

```bash
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 사용자 그룹에 추가
sudo usermod -aG docker $USER
```

## 🛠️ 개발 환경 설정

### 1. 저장소 클론

```bash
# 저장소 클론
git clone <repository-url>
cd team-elliot

# 브랜치 확인
git branch -a

# develop 브랜치로 전환
git checkout develop
```

### 2. IDE 설정

#### VS Code 권장 확장 프로그램

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-node-debug2",
    "ms-vscode.vscode-jest"
  ]
}
```

#### WebStorm/IntelliJ IDEA 설정

1. **TypeScript 설정**: `tsconfig.json` 인식 확인
2. **ESLint 설정**: ESLint 플러그인 설치
3. **Prettier 설정**: Prettier 플러그인 설치
4. **Prisma 지원**: Prisma 플러그인 설치

### 3. 환경 변수 설정

```bash
# Backend 환경 변수 설정
cd backend
cp env.example .env

# .env 파일 편집
DATABASE_URL="postgresql://username:password@localhost:5432/ballet_academy_dev"
JWT_SECRET="your-super-secret-jwt-key-for-development"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3001"
```

## 📦 프로젝트 설정

### 1. Backend 설정

```bash
cd backend

# 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 환경 변수 확인
echo $DATABASE_URL
```

### 2. Frontend 설정

```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp env.example .env
```

### 3. 프로젝트 루트 설정

```bash
# 프로젝트 루트로 이동
cd ..

# Git hooks 설정 (선택사항)
npm install -g husky
npx husky install
```

## 🗄️ 데이터베이스 설정

### 1. 데이터베이스 연결 확인

```bash
cd backend

# PostgreSQL 연결 테스트
psql $DATABASE_URL -c "SELECT version();"

# 또는 Prisma로 연결 테스트
npx prisma db pull
```

### 2. 스키마 마이그레이션

```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# 마이그레이션 실행
npx prisma migrate dev

# 스키마 확인
npx prisma studio
```

### 3. 초기 데이터 생성

```bash
# 시드 데이터 실행
npm run seed

# 또는 직접 실행
npx ts-node prisma/seed.ts
```

### 4. 데이터베이스 리셋 (개발용)

```bash
# 데이터베이스 초기화
npm run db:reset

# 초기화 후 시드 데이터 생성
npm run db:reset:seed
```

## 🚀 개발 서버 실행

### 1. Backend 서버

```bash
cd backend

# 개발 모드로 서버 시작
npm run start:dev

# 또는 디버그 모드
npm run start:debug

# 서버 상태 확인
curl http://localhost:3000/health
```

### 2. Frontend 서버

```bash
cd frontend

# 개발 서버 시작
npm run dev

# 브라우저에서 확인
open http://localhost:3001
```

### 3. 전체 스택 실행 (Docker 사용)

```bash
cd backend

# 전체 스택 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f app
```

## 🧪 테스트 환경 설정

### 1. 테스트 데이터베이스 설정

```bash
cd backend

# 테스트 DB 시작
npm run test:db:start

# 테스트 환경 변수 설정
export NODE_ENV=test
export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/ballet_class_test_db"
```

### 2. 테스트 실행

```bash
# 단위 테스트
npm run test

# 통합 테스트
npm run test:integration

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

### 3. 테스트 환경 정리

```bash
# 테스트 DB 중지
npm run test:db:stop

# 테스트 DB 재설정
npm run test:db:reset
```

## 🛠️ 개발 도구 설정

### 1. 코드 품질 도구

```bash
cd backend

# 코드 포맷팅
npm run format

# 린팅
npm run lint

# 린팅 자동 수정
npm run lint:fix
```

### 2. Git 설정

```bash
# Git 사용자 정보 설정
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Git hooks 설정
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/pre-push "npm run test"
```

### 3. 디버깅 설정

#### VS Code 디버깅

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/main.ts",
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

#### Chrome DevTools 디버깅

```bash
# 디버그 모드로 서버 시작
npm run start:debug

# Chrome DevTools에서 디버깅
```

## ❌ 문제 해결

### 1. Node.js 관련 문제

#### 버전 호환성 문제

```bash
# Node.js 버전 확인
node --version

# nvm으로 버전 관리 (권장)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### 의존성 설치 문제

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# npm 캐시 정리
npm cache clean --force
```

### 2. PostgreSQL 관련 문제

#### 연결 문제

```bash
# PostgreSQL 서비스 상태 확인
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# 포트 확인
lsof -i :5432

# 연결 테스트
psql -h localhost -U postgres -d postgres
```

#### 권한 문제

```bash
# PostgreSQL 사용자 생성
sudo -u postgres createuser --interactive

# 데이터베이스 생성
sudo -u postgres createdb ballet_academy_dev

# 권한 부여
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ballet_academy_dev TO your_username;"
```

### 3. Prisma 관련 문제

#### 스키마 동기화 문제

```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 데이터베이스 스키마 동기화
npx prisma db push

# 마이그레이션 재설정
npx prisma migrate reset
```

#### 연결 문제

```bash
# 환경 변수 확인
echo $DATABASE_URL

# 연결 테스트
npx prisma db pull

# Prisma Studio 실행
npx prisma studio
```

### 4. 포트 충돌 문제

#### 포트 사용 확인

```bash
# 포트 사용 현황 확인
lsof -i :3000  # Backend
lsof -i :3001  # Frontend
lsof -i :5432  # PostgreSQL

# 프로세스 종료
kill -9 <PID>
```

#### Docker 포트 충돌

```bash
# Docker 컨테이너 확인
docker ps

# 컨테이너 중지
docker stop <container_id>

# 포트 매핑 확인
docker port <container_id>
```

## 🎯 다음 단계

### 1. API 문서 확인

```bash
# Swagger UI 접속
open http://localhost:3000/api

# Postman 컬렉션 확인
open ./postman/Team-Elliot-API.postman_collection.json
```

### 2. 데이터베이스 탐색

```bash
# Prisma Studio 실행
npx prisma studio

# 데이터베이스 직접 접근
psql $DATABASE_URL
```

### 3. 테스트 작성

```bash
# 테스트 파일 생성
npm run test:unit:watch

# 특정 모듈 테스트
npm run test:unit:auth
npm run test:unit:class
```

### 4. 개발 워크플로우

```bash
# 새 기능 개발
git checkout -b feature/new-feature

# 변경사항 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# Pull Request 생성
git push origin feature/new-feature
```

## 📚 추가 리소스

### 공식 문서

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs)

### 프로젝트 문서

- [README.md](./README.md)
- [API 사용 가이드](./API_USAGE_GUIDE.md)
- [데이터베이스 스키마](./DATABASE_SCHEMA.md)
- [배포 가이드](./DEPLOYMENT.md)

### 개발 도구

- [VS Code 설정](./.vscode/)
- [ESLint 설정](./.eslintrc.js)
- [Prettier 설정](./.prettierrc)
- [Jest 설정](./test/)

## 🤝 도움 요청

### 문제 해결 순서

1. **문서 확인**: 이 가이드와 관련 문서 먼저 확인
2. **에러 메시지 분석**: 구체적인 에러 메시지 파악
3. **로그 확인**: 서버 로그와 브라우저 콘솔 확인
4. **팀원 문의**: 동일한 문제를 겪은 팀원에게 문의
5. **이슈 생성**: GitHub Issues에 문제 등록

### 연락처

- **팀 채널**: Slack/Teams 채널
- **코드 리뷰**: Pull Request 코멘트
- **문서 업데이트**: 이 가이드에 새로운 내용 추가

---

**Team Elliot Backend Team** 🩰

> 함께 성장하는 개발 환경을 만들어갑니다.
