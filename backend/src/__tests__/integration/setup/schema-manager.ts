import { PrismaClient } from '@prisma/client';

export class SchemaManager {
  private basePrisma: PrismaClient;

  constructor() {
    this.basePrisma = new PrismaClient({
      datasources: {
        db: {
          url:
            process.env.DATABASE_URL ||
            'postgresql://postgres:postgres@localhost:5432/ballet_class_test_db',
        },
      },
    });
  }

  async createWorkerSchema(schemaName: string): Promise<void> {
    try {
      // public 스키마와 retention 스키마를 모두 생성
      // Prisma multi-schema 설정에 맞춰 두 스키마 모두 필요
      await this.basePrisma.$executeRawUnsafe(
        `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`,
      );
      await this.basePrisma.$executeRawUnsafe(
        `CREATE SCHEMA IF NOT EXISTS "${schemaName}_retention"`,
      );
      console.log(
        `✅ Created schemas: ${schemaName} and ${schemaName}_retention`,
      );
    } catch (error) {
      console.error(`❌ Failed to create schemas ${schemaName}:`, error);
      throw error;
    }
  }

  async dropWorkerSchema(schemaName: string): Promise<void> {
    try {
      // public 스키마와 retention 스키마를 모두 삭제
      await this.basePrisma.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schemaName}_retention" CASCADE`,
      );
      await this.basePrisma.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`,
      );
      console.log(
        `✅ Dropped schemas: ${schemaName} and ${schemaName}_retention`,
      );
    } catch (error) {
      console.error(`❌ Failed to drop schemas ${schemaName}:`, error);
      throw error;
    }
  }

  async schemaExists(schemaName: string): Promise<boolean> {
    try {
      const result = await this.basePrisma.$queryRaw`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = ${schemaName}
      `;
      return Array.isArray(result) && result.length > 0;
    } catch (error) {
      console.error(`❌ Failed to check schema existence:`, error);
      return false;
    }
  }

  async cleanup(): Promise<void> {
    await this.basePrisma.$disconnect();
  }

  getSchemaUrl(schemaName: string): string {
    // 스키마별 DATABASE_URL 생성 (multi-schema 지원)
    const baseUrl =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/ballet_class_test_db';

    // Prisma multi-schema 설정에 맞춰 public과 retention 스키마를 모두 지정
    // schemaName은 public 역할, schemaName_retention은 retention 역할
    const publicSchema = schemaName;
    const retentionSchema = `${schemaName}_retention`;

    // URL에 이미 schema 파라미터가 있는지 확인
    if (baseUrl.includes('schema=')) {
      // 기존 schema 파라미터를 제거하고 새로운 스키마로 교체
      const newUrl = baseUrl.replace(/[?&]schema=[^&]+/g, '');
      const separator = newUrl.includes('?') ? '&' : '?';
      return `${newUrl}${separator}schema=${publicSchema}&schema=${retentionSchema}`;
    } else {
      // schema 파라미터가 없으면 추가
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}schema=${publicSchema}&schema=${retentionSchema}`;
    }
  }
}
