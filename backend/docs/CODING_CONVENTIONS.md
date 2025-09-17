# 📝 코딩 컨벤션 및 커밋 규칙

Team Elliot 백엔드 프로젝트의 코딩 컨벤션과 커밋 규칙을 정의합니다.

## 📋 목차

- [코딩 컨벤션](#-코딩-컨벤션)
- [커밋 규칙](#-커밋-규칙)
- [코드 리뷰 가이드라인](#-코드-리뷰-가이드라인)
- [네이밍 컨벤션](#-네이밍-컨벤션)

## 🎨 코딩 컨벤션

### TypeScript 설정

- **TypeScript 5.1+** 사용 필수
- **엄격 모드** 활성화 (`strict: true`)
- **명시적 타입 선언** 권장
- **any 타입 사용 금지** (예외적인 경우에만 주석과 함께 사용)

### 코드 포맷팅

#### Prettier 설정

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

#### ESLint 규칙

- **@typescript-eslint/recommended** 기본 규칙 적용
- **prettier/recommended** 포맷팅 규칙 적용
- **unused-imports** 자동 제거

### 파일 구조

```
src/
├── module-name/
│   ├── module-name.controller.ts
│   ├── module-name.service.ts
│   ├── module-name.module.ts
│   ├── dto/
│   │   ├── create-module-name.dto.ts
│   │   └── update-module-name.dto.ts
│   ├── entities/
│   │   └── module-name.entity.ts
│   └── __tests__/
│       ├── module-name.controller.spec.ts
│       └── module-name.service.spec.ts
```

### 클래스 및 메서드 작성 규칙

#### Controller

```typescript
@ApiTags('ModuleName')
@Controller('module-name')
@UseGuards(JwtAuthGuard)
@ApiSecurity('JWT-auth')
export class ModuleNameController {
  constructor(private readonly moduleNameService: ModuleNameService) {}

  @Get()
  @ApiOperation({ summary: '목록 조회' })
  @ApiResponse({ status: 200, description: '성공' })
  async findAll(): Promise<ModuleName[]> {
    return this.moduleNameService.findAll();
  }
}
```

#### Service

```typescript
@Injectable()
export class ModuleNameService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ModuleName[]> {
    return this.prisma.moduleName.findMany();
  }

  async create(createDto: CreateModuleNameDto): Promise<ModuleName> {
    return this.prisma.moduleName.create({
      data: createDto,
    });
  }
}
```

#### DTO

```typescript
export class CreateModuleNameDto {
  @ApiProperty({
    example: '예시값',
    description: '필드 설명',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'example@email.com',
    description: '이메일 주소',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
```

### 에러 처리

#### 예외 처리 패턴

```typescript
// Service에서
if (!user) {
  throw new NotFoundException({
    code: 'USER_NOT_FOUND',
    message: '사용자를 찾을 수 없습니다.',
    details: { userId },
  });
}

// Controller에서
try {
  return await this.service.method();
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    throw new BadRequestException('데이터베이스 오류가 발생했습니다.');
  }
  throw error;
}
```

### 로깅

```typescript
import { Logger } from '@nestjs/common';

export class ExampleService {
  private readonly logger = new Logger(ExampleService.name);

  async method() {
    this.logger.log('메서드 실행 시작');
    this.logger.debug('디버그 정보', { data });
    this.logger.warn('경고 메시지');
    this.logger.error('에러 발생', error);
  }
}
```

## 📝 커밋 규칙

### 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 종류

| Type       | 설명                          | 예시                                       |
| ---------- | ----------------------------- | ------------------------------------------ |
| `feat`     | 새로운 기능 추가              | `feat(auth): JWT 토큰 검증 로직 추가`      |
| `fix`      | 버그 수정                     | `fix(payment): 결제 검증 로직 수정`        |
| `docs`     | 문서 수정                     | `docs(api): Swagger 문서 업데이트`         |
| `style`    | 코드 포맷팅, 세미콜론 누락 등 | `style(controller): 코드 포맷팅 수정`      |
| `refactor` | 코드 리팩토링                 | `refactor(service): 메서드 분리 및 최적화` |
| `test`     | 테스트 코드 추가/수정         | `test(auth): 로그인 테스트 케이스 추가`    |
| `chore`    | 빌드, 설정 파일 수정          | `chore(deps): 의존성 업데이트`             |
| `ci`       | CI/CD 설정 변경               | `ci(github): 워크플로우 수정`              |

### Scope 종류

- `auth` - 인증 관련
- `user` - 사용자 관리
- `class` - 클래스 관리
- `payment` - 결제 관련
- `notification` - 알림 관련
- `database` - 데이터베이스 관련
- `api` - API 관련
- `test` - 테스트 관련

### 커밋 메시지 예시

```bash
# 좋은 예시
feat(auth): JWT 토큰 만료 시간 설정 추가

- access token 만료 시간을 1시간으로 설정
- refresh token 만료 시간을 7일로 설정
- 토큰 갱신 로직 추가

Closes #123

# 나쁜 예시
fix: 버그 수정
update: 업데이트
```

이 문서는 Team Elliot 백엔드 프로젝트의 코드 품질과 일관성을 유지하기 위한 가이드라인입니다. 모든 개발자는 이 규칙을 준수하여 코드를 작성해야 합니다.
