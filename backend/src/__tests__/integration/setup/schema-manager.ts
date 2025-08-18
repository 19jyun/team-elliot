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
      await this.basePrisma.$executeRawUnsafe(
        `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`,
      );
      console.log(`✅ Created schema: ${schemaName}`);
    } catch (error) {
      console.error(`❌ Failed to create schema ${schemaName}:`, error);
      throw error;
    }
  }

  async dropWorkerSchema(schemaName: string): Promise<void> {
    try {
      await this.basePrisma.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`,
      );
      console.log(`✅ Dropped schema: ${schemaName}`);
    } catch (error) {
      console.error(`❌ Failed to drop schema ${schemaName}:`, error);
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
    // 스키마별 DATABASE_URL 생성
    const baseUrl =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/ballet_class_test_db';

    // URL에 이미 schema 파라미터가 있는지 확인
    if (baseUrl.includes('schema=')) {
      // 기존 schema 파라미터를 새로운 스키마로 교체
      return baseUrl.replace(/schema=[^&]+/, `schema=${schemaName}`);
    } else {
      // schema 파라미터가 없으면 추가
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}schema=${schemaName}`;
    }
  }
}
