'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { login, logout, getSession as apiGetSession, verifyToken, refreshToken } from "@/api/auth";
import type { SessionResponse, VerifyResponse } from "@/types/api/auth";

// NextAuth와 호환되는 타입 정의
interface User {
  id: string;        // NextAuth와 일치하도록 문자열로 변경
  name: string;
  role: string;
  email?: string;     // NextAuth에 있는 필드 추가
}

interface Session {
  user: User;
  accessToken?: string;  // NextAuth와 일치하도록 옵셔널로 변경
  error?: string;        // NextAuth에 있는 에러 필드 추가
  expiresAt?: number;    // 추가 필드는 옵셔널로 유지
}

interface AuthContextType {
  data: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  update: (data?: any) => Promise<void>;
  signIn: (provider: string, options?: any) => Promise<any>;
  signOut: (options?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  data: null,
  status: 'unauthenticated',
  update: async () => {},
  signIn: async () => null,
  signOut: async () => {},
});

// 토큰 저장/조회 유틸리티
const TokenManager = {
  get: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem("accessToken");
  },
  
  set: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem("accessToken", token);
  },
  
  remove: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("next-auth.session-token");
    localStorage.removeItem("next-auth.csrf-token");
  }
};

// 세션 정보 저장/조회 유틸리티
const SessionManager = {
  get: (): Session | null => {
    if (typeof window === 'undefined') return null;
    try {
      const sessionData = localStorage.getItem("session");
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  },
  
  set: (session: Session) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem("session", JSON.stringify(session));
  },
  
  remove: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem("session");
  }
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 초기 세션 로드
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const savedSession = SessionManager.get();
        const token = TokenManager.get();
        
        if (savedSession && token) {
          // 토큰 만료 확인
          if (savedSession.expiresAt && savedSession.expiresAt > Date.now()) {
            setSession(savedSession);
          } else {
            // 토큰 갱신 시도
            try {
              const refreshResponse = await refreshToken({ userId: savedSession.user.id });
              if (refreshResponse.data) {
                const newSession: Session = {
                  user: savedSession.user,
                  accessToken: refreshResponse.data.access_token,
                  expiresAt: Date.now() + refreshResponse.data.expires_in * 1000,
                  error: undefined, // 에러 필드 초기화
                };
                SessionManager.set(newSession);
                if (newSession.accessToken) {
                  TokenManager.set(newSession.accessToken);
                }
                setSession(newSession);
              }
            } catch (error) {
              // 갱신 실패 시 로그아웃
              SessionManager.remove();
              TokenManager.remove();
              setSession(null);
            }
          }
        }
      } catch (error) {
        console.error("세션 초기화 실패:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  // 로그인 함수 (NextAuth signIn과 호환)
  const signIn = useCallback(async (provider: string, options?: any) => {
    if (provider !== 'credentials' || !options) {
      throw new Error("Unsupported provider");
    }

    try {
      setLoading(true);
      const response = await login({
        userId: options.userId,
        password: options.password,
      });
      
      if (response.data) {
        const newSession: Session = {
          user: {
            id: response.data.user.id.toString(), // 문자열로 변환
            name: response.data.user.name,
            role: response.data.user.role,
            email: undefined, // 이메일 필드는 백엔드에서 제공하지 않음
          },
          accessToken: response.data.access_token,
          expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2시간
        };
        
        SessionManager.set(newSession);
        if (newSession.accessToken) {
          TokenManager.set(newSession.accessToken);
        }
        setSession(newSession);
        
        return { ok: true, error: null };
      }
      return { ok: false, error: "로그인 실패" };
    } catch (error) {
      console.error("로그인 실패:", error);
      return { ok: false, error: "로그인 실패" };
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그아웃 함수 (NextAuth signOut과 호환)
  const signOut = useCallback(async (options?: any) => {
    try {
      await logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      SessionManager.remove();
      TokenManager.remove();
      setSession(null);
    }
  }, []);

  // 세션 업데이트 함수 (NextAuth update와 호환)
  const update = useCallback(async (data?: any) => {
    if (session && data) {
      const updatedSession = { ...session, ...data };
      SessionManager.set(updatedSession);
      setSession(updatedSession);
    }
  }, [session]);

  // 자동 토큰 갱신
  useEffect(() => {
    if (!session) return;

    const checkTokenExpiry = async () => {
      const now = Date.now();
      const timeUntilExpiry = (session.expiresAt || 0) - now;
      
      // 토큰 만료 5분 전에 갱신
      if (session.expiresAt && timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        try {
          const refreshResponse = await refreshToken({ userId: session.user.id });
          if (refreshResponse.data) {
            const newSession: Session = {
              ...session,
              accessToken: refreshResponse.data.access_token,
              expiresAt: Date.now() + refreshResponse.data.expires_in * 1000,
              error: undefined, // 에러 필드 초기화
            };
            SessionManager.set(newSession);
            if (newSession.accessToken) {
              TokenManager.set(newSession.accessToken);
            }
            setSession(newSession);
          }
        } catch (error) {
          console.error("토큰 갱신 실패:", error);
          // 에러 상태로 세션 업데이트
          setSession({
            ...session,
            error: "RefreshAccessTokenError",
            accessToken: undefined,
          });
        }
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000); // 1분마다 체크
    return () => clearInterval(interval);
  }, [session]);

  const value: AuthContextType = {
    data: session,
    status: loading ? 'loading' : (session ? 'authenticated' : 'unauthenticated'),
    update,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// NextAuth와 호환되는 useSession 훅
export const useSession = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  
  return {
    data: context.data,
    status: context.status,
    update: context.update,
  };
};

// NextAuth와 호환되는 signIn, signOut 함수들
export const signIn = async (provider: string, options?: any) => {
  const { signIn: authSignIn } = useContext(AuthContext);
  return await authSignIn(provider, options);
};

export const signOut = async (options?: any) => {
  const { signOut: authSignOut } = useContext(AuthContext);
  return await authSignOut(options);
};

// NextAuth와 호환되는 getSession 함수
export const getSession = async () => {
  try {
    const response = await apiGetSession();
    return response.data;
  } catch (error) {
    console.error("세션 조회 실패:", error);
    return null;
  }
};
