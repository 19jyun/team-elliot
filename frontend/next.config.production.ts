import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 프로덕션 빌드 시 console.log 제거
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // 환경 변수 설정
  env: {
    LOG_LEVEL: process.env.NODE_ENV === "production" ? "warn" : "debug",
  },

  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
