import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBalletPoseDto } from './dto/create-ballet-pose.dto';
import { UpdateBalletPoseDto } from './dto/update-ballet-pose.dto';

@Injectable()
export class BalletPoseService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.balletPose.findMany({
      orderBy: [{ difficulty: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: number) {
    const pose = await this.prisma.balletPose.findUnique({
      where: { id },
    });

    if (!pose) {
      throw new NotFoundException({
        code: 'BALLET_POSE_NOT_FOUND',
        message: '발레 자세를 찾을 수 없습니다.',
        details: { poseId: id },
      });
    }

    return pose;
  }

  async create(
    createBalletPoseDto: CreateBalletPoseDto,
    image?: Express.Multer.File,
  ) {
    // 동일한 이름의 발레 자세가 있는지 확인
    const existingPose = await this.prisma.balletPose.findFirst({
      where: { name: createBalletPoseDto.name },
    });

    if (existingPose) {
      throw new ConflictException({
        code: 'BALLET_POSE_NAME_ALREADY_EXISTS',
        message: '이미 존재하는 발레 자세명입니다.',
        details: { name: createBalletPoseDto.name },
      });
    }

    // 이미지 형식 검증
    if (image) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(image.mimetype)) {
        throw new BadRequestException({
          code: 'INVALID_IMAGE_FORMAT',
          message: '지원하지 않는 이미지 형식입니다. (JPG, PNG, WEBP만 가능)',
          details: {
            providedType: image.mimetype,
            allowedTypes: allowedMimeTypes,
          },
        });
      }

      // 이미지 크기 검증 (5MB 제한)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (image.size > maxSize) {
        throw new BadRequestException({
          code: 'IMAGE_TOO_LARGE',
          message: '이미지 크기가 너무 큽니다. (5MB 이하만 가능)',
          details: {
            providedSize: image.size,
            maxSize,
          },
        });
      }
    }

    const data: any = { ...createBalletPoseDto };

    // 이미지가 업로드된 경우 URL 추가
    if (image) {
      data.imageUrl = `/uploads/ballet-poses/${image.filename}`;
    }

    return this.prisma.balletPose.create({
      data,
    });
  }

  async update(
    id: number,
    updateBalletPoseDto: UpdateBalletPoseDto,
    image?: Express.Multer.File,
  ) {
    // 발레 자세 존재 여부 확인
    await this.findOne(id);

    // 이름이 변경되는 경우 중복 확인
    if (updateBalletPoseDto.name) {
      const existingPose = await this.prisma.balletPose.findFirst({
        where: {
          name: updateBalletPoseDto.name,
          id: { not: id }, // 현재 자세 제외
        },
      });

      if (existingPose) {
        throw new ConflictException({
          code: 'BALLET_POSE_NAME_ALREADY_EXISTS',
          message: '이미 존재하는 발레 자세명입니다.',
          details: { name: updateBalletPoseDto.name },
        });
      }
    }

    // 이미지 형식 검증
    if (image) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(image.mimetype)) {
        throw new BadRequestException({
          code: 'INVALID_IMAGE_FORMAT',
          message: '지원하지 않는 이미지 형식입니다. (JPG, PNG, WEBP만 가능)',
          details: {
            providedType: image.mimetype,
            allowedTypes: allowedMimeTypes,
          },
        });
      }

      // 이미지 크기 검증 (5MB 제한)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (image.size > maxSize) {
        throw new BadRequestException({
          code: 'IMAGE_TOO_LARGE',
          message: '이미지 크기가 너무 큽니다. (5MB 이하만 가능)',
          details: {
            providedSize: image.size,
            maxSize,
          },
        });
      }
    }

    const data: any = { ...updateBalletPoseDto };

    // 이미지가 업로드된 경우 URL 추가
    if (image) {
      data.imageUrl = `/uploads/ballet-poses/${image.filename}`;
    }

    return this.prisma.balletPose.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    // 발레 자세 존재 여부 확인
    await this.findOne(id);

    // 세션 콘텐츠에서 사용 중인지 확인
    const sessionContents = await this.prisma.sessionContent.findMany({
      where: { poseId: id },
    });

    if (sessionContents.length > 0) {
      throw new BadRequestException({
        code: 'BALLET_POSE_IN_USE',
        message: '세션에서 사용 중인 발레 자세는 삭제할 수 없습니다.',
        details: {
          sessionContentCount: sessionContents.length,
          sessionIds: sessionContents.map((sc) => sc.sessionId),
        },
      });
    }

    return this.prisma.balletPose.delete({
      where: { id },
    });
  }

  async findByDifficulty(difficulty: string) {
    // 난이도 값 검증
    const validDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    if (!validDifficulties.includes(difficulty)) {
      throw new BadRequestException({
        code: 'INVALID_DIFFICULTY',
        message: '유효하지 않은 난이도입니다.',
        details: {
          providedDifficulty: difficulty,
          validDifficulties,
        },
      });
    }

    return this.prisma.balletPose.findMany({
      where: { difficulty: difficulty as any },
      orderBy: { name: 'asc' },
    });
  }
}
