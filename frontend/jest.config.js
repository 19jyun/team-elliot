const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱의 경로를 제공하여 next.config.js와 .env 파일을 로드
  dir: './',
})

/**
 * Jest 설정
 * 
 * 커버리지 설정:
 * - 커버리지 리포트는 생성되지만 임계값 검사는 비활성화
 * - 커버리지 리포트는 coverage/ 폴더에 생성됨
 * - GitHub Actions에서 커버리지 아티팩트로 업로드됨
 * 
 * 임계값 활성화하려면 coverageThreshold 주석 해제 후 원하는 값으로 설정
 */
const customJestConfig = {
  // 테스트 환경 설정
  testEnvironment: 'jsdom',
  
  // 환경 변수 설정
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  
  // 테스트 타임아웃 설정 (통합 테스트용)
  testTimeout: 30000, // 30초
  
  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  
  // 테스트에서 제외할 파일/폴더
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/cypress/',
    '<rootDir>/src/__tests__/utils/' // test-utils.tsx 제외
  ],
  
  // 모듈 경로 매핑 (TypeScript 경로 별칭과 일치) - 올바른 속성명 사용
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
    '^@mswjs/interceptors/(.*)$': '<rootDir>/node_modules/@mswjs/interceptors/$1',
  },
  
  // 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/__tests__/**',
    '!src/__mocks__/**',
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}

// createJestConfig는 비동기적으로 설정을 로드하므로 아래와 같이 처리합니다.
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();

  // Next.js의 기본 transformIgnorePatterns 설정을 덮어씌웁니다.
  // node_modules 중 until-async, msw, @mswjs 관련 패키지만 변환(transform) 프로세스에 포함시킵니다.
  config.transformIgnorePatterns = [
    '^.+\\.module\\.(css|sass|scss)$',
    '/node_modules/(?!(until-async|msw|@mswjs)/)',
  ];

  return config;
};