type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    // 환경변수에서 로그 레벨 가져오기 (기본값: 개발=debug, 프로덕션=warn)
    const envLogLevel = process.env.LOG_LEVEL as LogLevel;
    const defaultLevel =
      process.env.NODE_ENV === "production" ? "warn" : "debug";

    this.config = {
      level: envLogLevel || defaultLevel,
      enableConsole: process.env.NODE_ENV !== "production",
      enableRemote: process.env.NODE_ENV === "production",
      remoteEndpoint: process.env.NEXT_PUBLIC_LOG_ENDPOINT,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  private sanitizeData(data: unknown): unknown {
    if (!data) return data;

    // 민감한 정보 마스킹
    const sensitiveKeys = [
      "password",
      "token",
      "accessToken",
      "refreshToken",
      "authorization",
      "cookie",
      "session",
      "secret",
      "ssn",
      "creditCard",
      "bankAccount",
    ];

    if (typeof data === "object") {
      const sanitized = { ...data } as Record<string, unknown>;

      for (const key in sanitized) {
        if (
          sensitiveKeys.some((sensitive) =>
            key.toLowerCase().includes(sensitive.toLowerCase())
          )
        ) {
          sanitized[key] = "[REDACTED]";
        } else if (typeof sanitized[key] === "object") {
          sanitized[key] = this.sanitizeData(sanitized[key]);
        }
      }

      return sanitized;
    }

    return data;
  }

  private async sendToRemote(level: LogLevel, message: string, data?: unknown) {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          message,
          data: this.sanitizeData(data),
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (_error) {
      // 원격 로깅 실패 시 무시 (무한 루프 방지)
    }
  }

  debug(message: string, data?: unknown) {
    if (!this.shouldLog("debug")) return;

    if (this.config.enableConsole) {
      console.debug(`[DEBUG] ${message}`, this.sanitizeData(data));
    }
  }

  info(message: string, data?: unknown) {
    if (!this.shouldLog("info")) return;

    if (this.config.enableConsole) {
      console.info(`[INFO] ${message}`, this.sanitizeData(data));
    }

    this.sendToRemote("info", message, data);
  }

  warn(message: string, data?: unknown) {
    if (!this.shouldLog("warn")) return;

    if (this.config.enableConsole) {
      console.warn(`[WARN] ${message}`, this.sanitizeData(data));
    }

    this.sendToRemote("warn", message, data);
  }

  error(message: string, data?: unknown) {
    if (!this.shouldLog("error")) return;

    if (this.config.enableConsole) {
      console.error(`[ERROR] ${message}`, this.sanitizeData(data));
    }

    this.sendToRemote("error", message, data);
  }
}

export const logger = new Logger();
