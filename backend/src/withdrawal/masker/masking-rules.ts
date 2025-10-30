import * as crypto from 'crypto';

/**
 * Public 스키마 데이터 마스킹 규칙
 *
 * 개인정보를 완전히 제거하되, 데이터베이스 무결성은 유지하는 방식으로 마스킹
 */

/**
 * 랜덤 문자열 생성 (비밀번호 해싱용)
 */
function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 비밀번호 해싱
 * 실제 사용할 수 없는 랜덤 해시값 생성
 */
export function hashRandomPassword(): string {
  const randomString = generateRandomString();
  return crypto.createHash('sha256').update(randomString).digest('hex');
}

/**
 * User 테이블 마스킹 데이터 생성
 */
export interface MaskedUserData {
  userId: string;
  password: string;
  name: string;
}

export function createMaskedUserData(
  userId: number,
  originalUserId: string,
): MaskedUserData {
  return {
    userId: `WITHDRAWN_USER_${userId}`,
    password: hashRandomPassword(),
    name: '탈퇴한 사용자',
  };
}

/**
 * Student 테이블 마스킹 데이터 생성
 */
export interface MaskedStudentData {
  userId: string;
  password: string;
  name: string;
  phoneNumber: null;
  emergencyContact: null;
  birthDate: null;
  notes: null;
  refundAccountHolder: null;
  refundAccountNumber: null;
  refundBankName: null;
}

export function createMaskedStudentData(
  studentId: number,
  originalUserId: string,
): MaskedStudentData {
  return {
    userId: `WITHDRAWN_STUDENT_${studentId}`,
    password: hashRandomPassword(),
    name: '탈퇴한 사용자',
    phoneNumber: null,
    emergencyContact: null,
    birthDate: null,
    notes: null,
    refundAccountHolder: null,
    refundAccountNumber: null,
    refundBankName: null,
  };
}
