export type UserRole = 'student' | 'teacher' | 'principal';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

// JWT Strategy에서 반환하는 user 객체 타입
export interface AuthenticatedUser {
  id: string;
  userId: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
