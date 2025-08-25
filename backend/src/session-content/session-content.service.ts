import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionContentDto } from './dto/create-session-content.dto';
import { UpdateSessionContentDto } from './dto/update-session-content.dto';
import { ReorderSessionContentsDto } from './dto/reorder-session-contents.dto';

@Injectable()
export class SessionContentService {
  constructor(private prisma: PrismaService) {}

  async findBySessionId(sessionId: number) {
    return this.prisma.sessionContent.findMany({
      where: { sessionId },
      include: {
        pose: true,
      },
      orderBy: { order: 'asc' },
    });
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
}
