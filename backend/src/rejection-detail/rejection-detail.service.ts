import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

    // 거절 처리자 존재 확인
    const rejector = await this.prisma.user.findUnique({
      where: { id: rejectedBy },
    });

    if (!rejector) {
      throw new NotFoundException({
        code: 'REJECTOR_NOT_FOUND',
        message: '거절 처리자를 찾을 수 없습니다.',
        details: { rejectedBy },
      });
    }

    // 엔티티 존재 확인
    const entityExists = await this.checkEntityExists(entityType, entityId);
    if (!entityExists) {
      throw new NotFoundException({
        code: 'ENTITY_NOT_FOUND',
        message: '거절 대상 엔티티를 찾을 수 없습니다.',
        details: { entityType, entityId },
      });
    }

    // 이미 거절 상세 정보가 있는지 확인
    const existingRejection = await this.prisma.rejectionDetail.findFirst({
      where: {
        entityType,
        entityId,
        rejectionType,
      },
    });

    if (existingRejection) {
      throw new BadRequestException({
        code: 'REJECTION_DETAIL_ALREADY_EXISTS',
        message: '이미 거절 상세 정보가 존재합니다.',
        details: {
          entityType,
          entityId,
          rejectionType,
          existingRejectionId: existingRejection.id,
        },
      });
    }

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
    const rejectionDetail = await this.prisma.rejectionDetail.findFirst({
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

    if (!rejectionDetail) {
      throw new NotFoundException({
        code: 'REJECTION_DETAIL_NOT_FOUND',
        message: '거절 상세 정보를 찾을 수 없습니다.',
        details: { entityType, entityId },
      });
    }

    return rejectionDetail;
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
    // 거절 처리자 존재 확인
    const rejector = await this.prisma.user.findUnique({
      where: { id: rejectedBy },
    });

    if (!rejector) {
      throw new NotFoundException({
        code: 'REJECTOR_NOT_FOUND',
        message: '거절 처리자를 찾을 수 없습니다.',
        details: { rejectedBy },
      });
    }

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
    // 거절 상세 정보 존재 확인
    const existingRejection = await this.prisma.rejectionDetail.findUnique({
      where: { id },
    });

    if (!existingRejection) {
      throw new NotFoundException({
        code: 'REJECTION_DETAIL_NOT_FOUND',
        message: '거절 상세 정보를 찾을 수 없습니다.',
        details: { rejectionDetailId: id },
      });
    }

    // 거절 처리자 존재 확인 (업데이트 시)
    if (updateData.rejectedBy) {
      const rejector = await this.prisma.user.findUnique({
        where: { id: updateData.rejectedBy },
      });

      if (!rejector) {
        throw new NotFoundException({
          code: 'REJECTOR_NOT_FOUND',
          message: '거절 처리자를 찾을 수 없습니다.',
          details: { rejectedBy: updateData.rejectedBy },
        });
      }
    }

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
    // 거절 상세 정보 존재 확인
    const existingRejection = await this.prisma.rejectionDetail.findUnique({
      where: { id },
    });

    if (!existingRejection) {
      throw new NotFoundException({
        code: 'REJECTION_DETAIL_NOT_FOUND',
        message: '거절 상세 정보를 찾을 수 없습니다.',
        details: { rejectionDetailId: id },
      });
    }

    return this.prisma.rejectionDetail.delete({
      where: { id },
    });
  }

  /**
   * 엔티티 존재 여부 확인 (private helper method)
   */
  private async checkEntityExists(
    entityType: string,
    entityId: number,
  ): Promise<boolean> {
    switch (entityType) {
      case 'Enrollment':
        const enrollment = await this.prisma.enrollment.findUnique({
          where: { id: entityId },
        });
        return !!enrollment;

      case 'RefundRequest':
        const refundRequest = await this.prisma.refundRequest.findUnique({
          where: { id: entityId },
        });
        return !!refundRequest;

      case 'SessionEnrollment':
        const sessionEnrollment =
          await this.prisma.sessionEnrollment.findUnique({
            where: { id: entityId },
          });
        return !!sessionEnrollment;

      default:
        return false;
    }
  }
}
