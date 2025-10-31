import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DeviceTokenResponseDto,
  DeviceOperationResponseDto,
} from './dto/register-device.dto';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(private prisma: PrismaService) {}

  async saveToken(
    userId: number,
    token: string,
    platform: string,
  ): Promise<DeviceTokenResponseDto> {
    try {
      const deviceToken = await this.prisma.deviceToken.upsert({
        where: {
          userId_token: {
            userId,
            token,
          },
        },
        update: {
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          userId,
          token,
          platform,
          isActive: true,
        },
      });

      this.logger.log(
        `✅ 디바이스 토큰 저장 완료: 사용자 ${userId}, 플랫폼 ${platform}`,
      );
      return deviceToken;
    } catch (error) {
      this.logger.error(`❌ 디바이스 토큰 저장 실패: 사용자 ${userId}`, error);
      throw error;
    }
  }

  async deactivateToken(
    userId: number,
    token: string,
  ): Promise<DeviceOperationResponseDto> {
    try {
      const result = await this.prisma.deviceToken.updateMany({
        where: {
          userId,
          token,
        },
        data: {
          isActive: false,
        },
      });

      this.logger.log(`✅ 디바이스 토큰 비활성화: 사용자 ${userId}`);
      return {
        success: true,
        count: result.count,
        message: '디바이스 토큰이 비활성화되었습니다',
      };
    } catch (error) {
      this.logger.error(
        `❌ 디바이스 토큰 비활성화 실패: 사용자 ${userId}`,
        error,
      );
      throw error;
    }
  }

  async deleteToken(
    userId: number,
    token: string,
  ): Promise<DeviceOperationResponseDto> {
    try {
      const result = await this.prisma.deviceToken.deleteMany({
        where: {
          userId,
          token,
        },
      });

      this.logger.log(`✅ 디바이스 토큰 완전 삭제: 사용자 ${userId}`);
      return {
        success: true,
        count: result.count,
        message: '디바이스 토큰이 완전히 삭제되었습니다',
      };
    } catch (error) {
      this.logger.error(`❌ 디바이스 토큰 삭제 실패: 사용자 ${userId}`, error);
      throw error;
    }
  }

  async getActiveTokens(userId: number): Promise<string[]> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        token: true,
      },
    });
    return tokens.map((t) => t.token);
  }

  async getActiveTokensForUsers(
    userIds: number[],
  ): Promise<Map<number, string[]>> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: {
        userId: { in: userIds },
        isActive: true,
      },
    });

    const result = new Map<number, string[]>();
    tokens.forEach((token) => {
      if (!result.has(token.userId)) {
        result.set(token.userId, []);
      }
      result.get(token.userId)!.push(token.token);
    });

    return result;
  }
}
