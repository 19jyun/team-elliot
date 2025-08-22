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

          return {
            id: data.user.id,
            name: data.user.name,
            role: data.user.role,
            accessToken: data.access_token,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
});

export { handler as GET, handler as POST };
