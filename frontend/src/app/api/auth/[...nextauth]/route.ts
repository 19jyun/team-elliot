import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 타입 확장
declare module "next-auth" {
  interface User {
    accessToken?: string;
    role?: string;
  }

  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: string;
    id?: string;
    expiresAt?: number;
    error?: string;
  }
}

// 토큰 갱신 함수
async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: token.id }),
      }
    );

    const refreshedTokens = await response.json();

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    console.error("토큰 갱신 실패:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        userId: { label: "아이디", type: "text" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.password) return null;

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: credentials.userId,
                password: credentials.password,
              }),
            }
          );

          const data = await response.json();
          if (!response.ok) {
            // 백엔드의 새로운 에러 응답 구조 처리
            const errorMessage =
              data.error?.message || data.message || "로그인에 실패했습니다.";
            throw new Error(errorMessage);
          }

          // 백엔드 응답 구조에 맞게 파싱
          const userData = data.data?.user || data.user;
          const accessToken = data.data?.access_token || data.access_token;

          // userData가 존재하는지 확인
          if (!userData) {
            console.error("Auth error: No user data in response", data);
            return null;
          }

          // 필수 필드들이 존재하는지 확인
          if (!userData.id || !userData.name || !userData.role) {
            console.error("Auth error: Missing required user fields", userData);
            return null;
          }

          return {
            id: userData.id.toString(),
            name: userData.name,
            role: userData.role,
            accessToken: accessToken,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // 초기 로그인 시
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.id = user.id;
        token.expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2시간
      }

      // 토큰 만료 확인 및 갱신
      if (token.expiresAt && Date.now() < token.expiresAt) {
        return token;
      }

      // 토큰 갱신 시도
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    },
    async redirect({ baseUrl }) {
      // 모든 로그인 성공 후 /dashboard로 리다이렉트
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 14 * 24 * 60 * 60, // 14일 (초 단위)
  },
  jwt: {
    maxAge: 14 * 24 * 60 * 60, // 14일 (초 단위)
  },
});

export { handler as GET, handler as POST };
