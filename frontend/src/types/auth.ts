export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Session {
  user: User
  accessToken: string
  expires: string
}

// 권한 타입 정의
export type ClassPermission =
  | 'view-classes' // 수업 목록 조회
  | 'enroll-class' // 수업 수강 신청
  | 'manage-own-classes' // 자신의 수업 관리
  | 'manage-all-classes' // 모든 수업 관리

export type UserPermission =
  | 'view-profile' // 자신의 프로필 조회
  | 'edit-profile' // 자신의 프로필 수정
  | 'view-students' // 수강생 목록 조회
  | 'view-all-users' // 모든 사용자 조회
  | 'manage-all-users' // 모든 사용자 관리

export type SystemPermission =
  | 'view-system-settings' // 시스템 설정 조회
  | 'manage-system-settings' // 시스템 설정 관리

export type Permission = ClassPermission | UserPermission | SystemPermission

// 역할별 권한 정의
export const ROLE_PERMISSIONS = {
  student: [
    // 수업 관련
    'view-classes',
    'enroll-class',
    // 프로필 관련
    'view-profile',
    'edit-profile',
  ],
  teacher: [
    // 수업 관련
    'view-classes',
    'manage-own-classes',
    // 수강생 관련
    'view-students',
    // 프로필 관련
    'view-profile',
    'edit-profile',
  ],
  admin: [
    // 수업 관련
    'view-classes',
    'manage-all-classes',
    // 사용자 관련
    'view-all-users',
    'manage-all-users',
    // 시스템 관련
    'view-system-settings',
    'manage-system-settings',
  ],
} as const

// 권한 설명
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  'view-classes': '수업 목록을 조회할 수 있습니다.',
  'enroll-class': '수업을 수강 신청할 수 있습니다.',
  'manage-own-classes': '자신의 수업을 관리할 수 있습니다.',
  'manage-all-classes': '모든 수업을 관리할 수 있습니다.',
  'view-profile': '자신의 프로필을 조회할 수 있습니다.',
  'edit-profile': '자신의 프로필을 수정할 수 있습니다.',
  'view-students': '수강생 목록을 조회할 수 있습니다.',
  'view-all-users': '모든 사용자를 조회할 수 있습니다.',
  'manage-all-users': '모든 사용자를 관리할 수 있습니다.',
  'view-system-settings': '시스템 설정을 조회할 수 있습니다.',
  'manage-system-settings': '시스템 설정을 관리할 수 있습니다.',
}
