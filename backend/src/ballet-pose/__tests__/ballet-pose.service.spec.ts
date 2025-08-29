import { Test, TestingModule } from '@nestjs/testing';
import { BalletPoseService } from '../ballet-pose.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateBalletPoseDto,
  PoseDifficulty,
} from '../dto/create-ballet-pose.dto';
import { UpdateBalletPoseDto } from '../dto/update-ballet-pose.dto';
import { NotFoundException } from '@nestjs/common';

describe('BalletPoseService', () => {
  let service: BalletPoseService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    balletPose: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    sessionContent: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalletPoseService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BalletPoseService>(BalletPoseService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all ballet poses ordered by difficulty and name', async () => {
      const expectedPoses = [
        {
          id: 1,
          name: '플리에',
          description: '발레의 기본 동작',
          difficulty: PoseDifficulty.BEGINNER,
          imageUrl: '/uploads/ballet-poses/plie.jpg',
        },
        {
          id: 2,
          name: '아라베스크',
          description: '고급 발레 동작',
          difficulty: PoseDifficulty.ADVANCED,
          imageUrl: '/uploads/ballet-poses/arabesque.jpg',
        },
      ];

      mockPrismaService.balletPose.findMany.mockResolvedValue(expectedPoses);

      const result = await service.findAll();

      expect(prismaService.balletPose.findMany).toHaveBeenCalledWith({
        orderBy: [{ difficulty: 'asc' }, { name: 'asc' }],
      });
      expect(result).toEqual(expectedPoses);
    });
  });

  describe('findOne', () => {
    it('should return a ballet pose by id', async () => {
      const poseId = 1;
      const expectedPose = {
        id: poseId,
        name: '플리에',
        description: '발레의 기본 동작',
        difficulty: PoseDifficulty.BEGINNER,
        imageUrl: '/uploads/ballet-poses/plie.jpg',
      };

      mockPrismaService.balletPose.findUnique.mockResolvedValue(expectedPose);

      const result = await service.findOne(poseId);

      expect(prismaService.balletPose.findUnique).toHaveBeenCalledWith({
        where: { id: poseId },
      });
      expect(result).toEqual(expectedPose);
    });

    it('should throw NotFoundException when pose not found', async () => {
      const poseId = 999;

      mockPrismaService.balletPose.findUnique.mockResolvedValue(null);

      await expect(service.findOne(poseId)).rejects.toThrow(NotFoundException);
      expect(prismaService.balletPose.findUnique).toHaveBeenCalledWith({
        where: { id: poseId },
      });
    });
  });

  describe('create', () => {
    it('should create a ballet pose with image', async () => {
      const createBalletPoseDto: CreateBalletPoseDto = {
        name: '플리에',
        description: '발레의 기본 동작',
        difficulty: PoseDifficulty.BEGINNER,
      };

      const mockImage = {
        filename: 'plie.jpg',
        originalname: 'plie.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      const expectedPose = {
        id: 1,
        ...createBalletPoseDto,
        imageUrl: '/uploads/ballet-poses/plie.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.balletPose.findFirst.mockResolvedValue(null);
      mockPrismaService.balletPose.create.mockResolvedValue(expectedPose);

      const result = await service.create(createBalletPoseDto, mockImage);

      expect(prismaService.balletPose.create).toHaveBeenCalledWith({
        data: {
          ...createBalletPoseDto,
          imageUrl: '/uploads/ballet-poses/plie.jpg',
        },
      });
      expect(result).toEqual(expectedPose);
    });

    it('should create a ballet pose without image', async () => {
      const createBalletPoseDto: CreateBalletPoseDto = {
        name: '플리에',
        description: '발레의 기본 동작',
        difficulty: PoseDifficulty.BEGINNER,
      };

      const expectedPose = {
        id: 1,
        ...createBalletPoseDto,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.balletPose.findFirst.mockResolvedValue(null);
      mockPrismaService.balletPose.create.mockResolvedValue(expectedPose);

      const result = await service.create(createBalletPoseDto);

      expect(prismaService.balletPose.create).toHaveBeenCalledWith({
        data: createBalletPoseDto,
      });
      expect(result).toEqual(expectedPose);
    });
  });

  describe('update', () => {
    it('should update a ballet pose with image', async () => {
      const poseId = 1;
      const updateBalletPoseDto: UpdateBalletPoseDto = {
        name: '플리에 수정',
        description: '발레의 기본 동작 수정',
      };

      const mockImage = {
        filename: 'plie-updated.jpg',
        originalname: 'plie-updated.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      const existingPose = {
        id: poseId,
        name: '플리에',
        description: '발레의 기본 동작',
        difficulty: PoseDifficulty.BEGINNER,
        imageUrl: '/uploads/ballet-poses/plie.jpg',
      };

      const expectedPose = {
        id: poseId,
        name: '플리에 수정',
        description: '발레의 기본 동작 수정',
        difficulty: PoseDifficulty.BEGINNER,
        imageUrl: '/uploads/ballet-poses/plie-updated.jpg',
        updatedAt: new Date(),
      };

      mockPrismaService.balletPose.findUnique.mockResolvedValue(existingPose);
      mockPrismaService.balletPose.findFirst.mockResolvedValue(null);
      mockPrismaService.balletPose.update.mockResolvedValue(expectedPose);

      const result = await service.update(
        poseId,
        updateBalletPoseDto,
        mockImage,
      );

      expect(prismaService.balletPose.findUnique).toHaveBeenCalledWith({
        where: { id: poseId },
      });
      expect(prismaService.balletPose.update).toHaveBeenCalledWith({
        where: { id: poseId },
        data: {
          ...updateBalletPoseDto,
          imageUrl: '/uploads/ballet-poses/plie-updated.jpg',
        },
      });
      expect(result).toEqual(expectedPose);
    });

    it('should update a ballet pose without image', async () => {
      const poseId = 1;
      const updateBalletPoseDto: UpdateBalletPoseDto = {
        name: '플리에 수정',
        description: '발레의 기본 동작 수정',
      };

      const existingPose = {
        id: poseId,
        name: '플리에',
        description: '발레의 기본 동작',
        difficulty: PoseDifficulty.BEGINNER,
        imageUrl: '/uploads/ballet-poses/plie.jpg',
      };

      const expectedPose = {
        id: poseId,
        name: '플리에 수정',
        description: '발레의 기본 동작 수정',
        difficulty: PoseDifficulty.BEGINNER,
        imageUrl: '/uploads/ballet-poses/plie.jpg',
        updatedAt: new Date(),
      };

      mockPrismaService.balletPose.findUnique.mockResolvedValue(existingPose);
      mockPrismaService.balletPose.findFirst.mockResolvedValue(null);
      mockPrismaService.balletPose.update.mockResolvedValue(expectedPose);

      const result = await service.update(poseId, updateBalletPoseDto);

      expect(prismaService.balletPose.findUnique).toHaveBeenCalledWith({
        where: { id: poseId },
      });
      expect(prismaService.balletPose.update).toHaveBeenCalledWith({
        where: { id: poseId },
        data: updateBalletPoseDto,
      });
      expect(result).toEqual(expectedPose);
    });

    it('should throw NotFoundException when pose not found during update', async () => {
      const poseId = 999;
      const updateBalletPoseDto: UpdateBalletPoseDto = {
        name: '플리에 수정',
      };

      mockPrismaService.balletPose.findUnique.mockResolvedValue(null);

      await expect(service.update(poseId, updateBalletPoseDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.balletPose.findUnique).toHaveBeenCalledWith({
        where: { id: poseId },
      });
    });
  });

  describe('remove', () => {
    it('should remove a ballet pose successfully', async () => {
      const poseId = 1;
      const existingPose = {
        id: poseId,
        name: '플리에',
        description: '발레의 기본 동작',
        difficulty: PoseDifficulty.BEGINNER,
        imageUrl: '/uploads/ballet-poses/plie.jpg',
      };

      const deletedPose = {
        id: poseId,
        name: '플리에',
        description: '발레의 기본 동작',
        difficulty: PoseDifficulty.BEGINNER,
        imageUrl: '/uploads/ballet-poses/plie.jpg',
      };

      mockPrismaService.balletPose.findUnique.mockResolvedValue(existingPose);
      mockPrismaService.sessionContent.findMany.mockResolvedValue([]);
      mockPrismaService.balletPose.delete.mockResolvedValue(deletedPose);

      const result = await service.remove(poseId);

      expect(prismaService.balletPose.findUnique).toHaveBeenCalledWith({
        where: { id: poseId },
      });
      expect(prismaService.balletPose.delete).toHaveBeenCalledWith({
        where: { id: poseId },
      });
      expect(result).toEqual(deletedPose);
    });

    it('should throw NotFoundException when pose not found during remove', async () => {
      const poseId = 999;

      mockPrismaService.balletPose.findUnique.mockResolvedValue(null);

      await expect(service.remove(poseId)).rejects.toThrow(NotFoundException);
      expect(prismaService.balletPose.findUnique).toHaveBeenCalledWith({
        where: { id: poseId },
      });
    });
  });

  describe('findByDifficulty', () => {
    it('should return poses by difficulty', async () => {
      const difficulty = 'BEGINNER';
      const expectedPoses = [
        {
          id: 1,
          name: '플리에',
          description: '발레의 기본 동작',
          difficulty: PoseDifficulty.BEGINNER,
          imageUrl: '/uploads/ballet-poses/plie.jpg',
        },
        {
          id: 2,
          name: '탠듀',
          description: '발레의 기본 동작',
          difficulty: PoseDifficulty.BEGINNER,
          imageUrl: '/uploads/ballet-poses/tendu.jpg',
        },
      ];

      mockPrismaService.balletPose.findMany.mockResolvedValue(expectedPoses);

      const result = await service.findByDifficulty(difficulty);

      expect(prismaService.balletPose.findMany).toHaveBeenCalledWith({
        where: { difficulty: difficulty as any },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(expectedPoses);
    });
  });
});
