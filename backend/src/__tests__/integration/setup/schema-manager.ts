import { PrismaClient } from '@prisma/client';

export class SchemaManager {
  private basePrisma: PrismaClient;

  constructor() {
    this.basePrisma = new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://postgres:postgres@localhost:5433/ballet_class_test_db',
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
    return `postgresql://postgres:postgres@localhost:5433/ballet_class_test_db?schema=${schemaName}`;
  }
}
