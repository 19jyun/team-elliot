import { generateAnonymousId } from '../anonymizer/anonymization-rules';
import { addFiveYears } from '../utils/date.utils';

/**
 * AnonymizedUser 생성 마이그레이터
 */
export interface CreateAnonymizedUserParams {
  userRole: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
  withdrawalDate: Date;
}

export interface AnonymizedUserResult {
  id: number;
  anonymousId: string;
}

/**
 * AnonymizedUser 생성
 */
export async function createAnonymizedUser(
  tx: any, // Prisma.TransactionClient with retention schema
  params: CreateAnonymizedUserParams,
): Promise<AnonymizedUserResult> {
  const anonymousId = generateAnonymousId(params.userRole);
  const withdrawalDate = params.withdrawalDate;
  const dataRetentionUntil = addFiveYears(withdrawalDate);

  const anonymizedUser = await tx.anonymizedUser.create({
    data: {
      anonymousId,
      originalUserRole: params.userRole,
      withdrawalDate,
      dataRetentionUntil,
      accessCount: 0,
      lastAccessedAt: null,
    },
  });

  return {
    id: anonymizedUser.id,
    anonymousId: anonymizedUser.anonymousId,
  };
}
