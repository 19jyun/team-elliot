import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionContentDto } from './dto/create-session-content.dto';
import { UpdateSessionContentDto } from './dto/update-session-content.dto';
import { ReorderSessionContentsDto } from './dto/reorder-session-contents.dto';
import { UpdateSessionPosesDto } from './dto/update-session-poses.dto';

@Injectable()
export class SessionContentService {
  constructor(private prisma: PrismaService) {}

  async findBySessionId(sessionId: number) {
    // 세션 정보와 함께 세션 내용 조회
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: {
        sessionSummary: true,
      },
    });

    if (!session) {
      throw new NotFoundException({
        code: 'SESSION_NOT_FOUND',
        message: '세션을 찾을 수 없습니다.',
        details: { sessionId },
      });
    }

    const contents = await this.prisma.sessionContent.findMany({
      where: { sessionId },
      include: {
        pose: true,
      },
      orderBy: { order: 'asc' },
    });

    return {
      sessionSummary: session.sessionSummary || undefined,
      contents,
    };
  }

  async findOne(id: number) {
    const content = await this.prisma.sessionContent.findUnique({
      where: { id },
      include: {
        pose: true,
      },
    });

    if (!content) {
      throw new NotFoundException({
        code: 'SESSION_CONTENT_NOT_FOUND',
        message: '세션 내용을 찾을 수 없습니다.',
        details: { contentId: id },
      });
    }

    return content;
  }

  async create(
    sessionId: number,
    createSessionContentDto: CreateSessionContentDto,
  ) {
    // 세션이 존재하는지 확인
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException({
        code: 'SESSION_NOT_FOUND',
        message: '세션을 찾을 수 없습니다.',
        details: { sessionId },
      });
    }

    // 발레 자세가 존재하는지 확인
    const pose = await this.prisma.balletPose.findUnique({
      where: { id: createSessionContentDto.poseId },
    });

    if (!pose) {
      throw new NotFoundException({
        code: 'BALLET_POSE_NOT_FOUND',
        message: '발레 자세를 찾을 수 없습니다.',
        details: { poseId: createSessionContentDto.poseId },
      });
    }

    // 순서가 지정되지 않은 경우, 현재 최대 순서 + 1로 설정
    let order = createSessionContentDto.order;
    if (order === undefined) {
      const maxOrderContent = await this.prisma.sessionContent.findFirst({
        where: { sessionId },
        orderBy: { order: 'desc' },
      });
      order = maxOrderContent ? maxOrderContent.order + 1 : 0;
    }

    return this.prisma.sessionContent.create({
      data: {
        sessionId,
        poseId: createSessionContentDto.poseId,
        order,
        notes: createSessionContentDto.notes,
      },
      include: {
        pose: true,
      },
    });
  }

  async update(id: number, updateSessionContentDto: UpdateSessionContentDto) {
    await this.findOne(id); // 존재 여부 확인

    return this.prisma.sessionContent.update({
      where: { id },
      data: updateSessionContentDto,
      include: {
        pose: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // 존재 여부 확인

    return this.prisma.sessionContent.delete({
      where: { id },
    });
  }

  async reorder(sessionId: number, reorderDto: ReorderSessionContentsDto) {
    // 세션이 존재하는지 확인
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException({
        code: 'SESSION_NOT_FOUND',
        message: '세션을 찾을 수 없습니다.',
        details: { sessionId },
      });
    }

    // 현재 세션의 모든 내용을 조회
    const currentContents = await this.prisma.sessionContent.findMany({
      where: { sessionId },
    });

    // 요청된 ID들을 number로 변환
    const contentIds = reorderDto.contentIds.map((id) => parseInt(id, 10));

    // 요청된 ID들이 모두 현재 세션에 속하는지 확인
    const currentContentIds = currentContents.map((content) => content.id);
    const isValidRequest = contentIds.every((id) =>
      currentContentIds.includes(id),
    );

    if (!isValidRequest) {
      throw new BadRequestException({
        code: 'INVALID_CONTENT_IDS',
        message: '유효하지 않은 세션 내용 ID가 포함되어 있습니다.',
        details: {
          sessionId,
          requestedIds: contentIds,
          validIds: currentContentIds,
        },
      });
    }

    // 순서 업데이트
    const updates = contentIds.map((contentId, index) =>
      this.prisma.sessionContent.update({
        where: { id: contentId },
        data: { order: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.findBySessionId(sessionId);
  }

  async updateSessionPoses(
    sessionId: number,
    updateSessionPosesDto: UpdateSessionPosesDto,
  ) {
    // 세션이 존재하는지 확인
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException({
        code: 'SESSION_NOT_FOUND',
        message: '세션을 찾을 수 없습니다.',
        details: { sessionId },
      });
    }

    // 발레 자세들이 존재하는지 확인
    const poseIds = updateSessionPosesDto.poseIds;
    if (poseIds.length > 0) {
      const existingPoses = await this.prisma.balletPose.findMany({
        where: { id: { in: poseIds } },
        select: { id: true },
      });

      const existingPoseIds = existingPoses.map((pose) => pose.id);
      const invalidPoseIds = poseIds.filter(
        (id) => !existingPoseIds.includes(id),
      );

      if (invalidPoseIds.length > 0) {
        throw new BadRequestException({
          code: 'INVALID_POSE_IDS',
          message: '유효하지 않은 발레 자세 ID가 포함되어 있습니다.',
          details: { invalidPoseIds },
        });
      }
    }

    // 노트 배열 길이 검증
    const notes = updateSessionPosesDto.notes || [];
    if (notes.length > 0 && notes.length !== poseIds.length) {
      throw new BadRequestException({
        code: 'NOTES_LENGTH_MISMATCH',
        message: '노트 배열의 길이가 포즈 ID 배열의 길이와 일치하지 않습니다.',
        details: { poseIdsLength: poseIds.length, notesLength: notes.length },
      });
    }

    // 트랜잭션으로 원자적 처리
    return this.prisma.$transaction(async (tx) => {
      // 1. 기존 세션 내용 모두 삭제
      await tx.sessionContent.deleteMany({
        where: { sessionId },
      });

      // 2. 새로운 세션 내용들 추가
      if (poseIds.length > 0) {
        const sessionContents = poseIds.map((poseId, index) => ({
          sessionId,
          poseId,
          order: index,
          notes: notes[index] || null,
        }));

        await tx.sessionContent.createMany({
          data: sessionContents,
        });
      }

      // 3. 업데이트된 세션 내용 반환
      return this.findBySessionId(sessionId);
    });
  }
}
