import { Injectable, NotFoundException } from '@nestjs/common';
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
      throw new NotFoundException('발레 자세를 찾을 수 없습니다.');
    }

    return pose;
  }

  async create(createBalletPoseDto: CreateBalletPoseDto) {
    return this.prisma.balletPose.create({
      data: createBalletPoseDto,
    });
  }

  async update(id: number, updateBalletPoseDto: UpdateBalletPoseDto) {
    await this.findOne(id); // 존재 여부 확인

    return this.prisma.balletPose.update({
      where: { id },
      data: updateBalletPoseDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // 존재 여부 확인

    return this.prisma.balletPose.delete({
      where: { id },
    });
  }

  async findByDifficulty(difficulty: string) {
    return this.prisma.balletPose.findMany({
      where: { difficulty: difficulty as any },
      orderBy: { name: 'asc' },
    });
  }
}
