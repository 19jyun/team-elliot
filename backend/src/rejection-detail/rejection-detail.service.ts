import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRejectionDetailDto,
  RejectionType,
} from './dto/create-rejection-detail.dto';

@Injectable()
export class RejectionDetailService {
  constructor(private prisma: PrismaService) {}

  /**
   * 거절 상세 정보 생성
   */
  async createRejectionDetail(
    createRejectionDetailDto: CreateRejectionDetailDto,
  ) {
    const {
      rejectionType,
      entityId,
      entityType,
      reason,
      detailedReason,
      rejectedBy,
    } = createRejectionDetailDto;

    return this.prisma.rejectionDetail.create({
      data: {
        rejectionType,
        entityId,
        entityType,
        reason,
        detailedReason,
        rejectedBy,
      },
      include: {
        rejector: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 엔티티별 거절 상세 정보 조회
   */
  async getRejectionDetailByEntity(entityType: string, entityId: number) {
    return this.prisma.rejectionDetail.findFirst({
      where: {
        entityType,
        entityId,
      },
      include: {
        rejector: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 거절 타입별 거절 상세 정보 목록 조회
   */
  async getRejectionDetailsByType(rejectionType: RejectionType) {
    return this.prisma.rejectionDetail.findMany({
      where: {
        rejectionType,
      },
      include: {
        rejector: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        rejectedAt: 'desc',
      },
    });
  }

  /**
   * 처리자별 거절 상세 정보 목록 조회
   */
  async getRejectionDetailsByRejector(rejectedBy: number) {
    return this.prisma.rejectionDetail.findMany({
      where: {
        rejectedBy,
      },
      include: {
        rejector: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        rejectedAt: 'desc',
      },
    });
  }

  /**
   * 거절 상세 정보 수정
   */
  async updateRejectionDetail(
    id: number,
    updateData: Partial<CreateRejectionDetailDto>,
  ) {
    return this.prisma.rejectionDetail.update({
      where: { id },
      data: updateData,
      include: {
        rejector: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 거절 상세 정보 삭제
   */
  async deleteRejectionDetail(id: number) {
    return this.prisma.rejectionDetail.delete({
      where: { id },
    });
  }
}
