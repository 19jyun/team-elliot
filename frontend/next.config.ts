import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 워크스페이스 루트 설정 (경고 해결)
  outputFileTracingRoot: __dirname,

  // Capacitor 앱을 위한 설정
  output: "export",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,

  // 이미지 최적화 설정
  images: {
    unoptimized: true, // Capacitor 앱을 위해 이미지 최적화 비활성화
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.builder.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },

  // 성능 최적화
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@mui/material", "@mui/icons-material"],
  },

  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 압축 설정
  compress: true,

  // Static Export에서는 headers() 사용 불가
  // 보안 헤더는 Capacitor 설정에서 처리

  // 리다이렉트 설정 제거 (미들웨어에서 처리)
  // async redirects() {
  //   return [];
  // },
};

export default nextConfig;
