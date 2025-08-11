import { Test, TestingModule } from '@nestjs/testing';
import { BalletPoseController } from '../ballet-pose.controller';
import { BalletPoseService } from '../ballet-pose.service';
import {
  CreateBalletPoseDto,
  PoseDifficulty,
} from '../dto/create-ballet-pose.dto';
import { UpdateBalletPoseDto } from '../dto/update-ballet-pose.dto';

describe('BalletPoseController', () => {
  let controller: BalletPoseController;
  let service: BalletPoseService;

  const mockBalletPoseService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByDifficulty: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalletPoseController],
      providers: [
        {
          provide: BalletPoseService,
          useValue: mockBalletPoseService,
        },
      ],
    }).compile();

    controller = module.get<BalletPoseController>(BalletPoseController);
    service = module.get<BalletPoseService>(BalletPoseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all ballet poses', async () => {
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

      mockBalletPoseService.findAll.mockResolvedValue(expectedPoses);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedPoses);
    });

    it('should return poses by difficulty when difficulty query is provided', async () => {
      const difficulty = 'BEGINNER';
      const expectedPoses = [
        {
          id: 1,
          name: '플리에',
          description: '발레의 기본 동작',
          difficulty: PoseDifficulty.BEGINNER,
          imageUrl: '/uploads/ballet-poses/plie.jpg',
        },
      ];

      mockBalletPoseService.findByDifficulty.mockResolvedValue(expectedPoses);

      const result = await controller.findAll(difficulty);

      expect(service.findByDifficulty).toHaveBeenCalledWith(difficulty);
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

      mockBalletPoseService.findOne.mockResolvedValue(expectedPose);

      const result = await controller.findOne(poseId);

      expect(service.findOne).toHaveBeenCalledWith(poseId);
      expect(result).toEqual(expectedPose);
    });
  });

  describe('create', () => {
    it('should create a ballet pose successfully', async () => {
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

      mockBalletPoseService.create.mockResolvedValue(expectedPose);

      const result = await controller.create(createBalletPoseDto, mockImage);

      expect(service.create).toHaveBeenCalledWith(
        createBalletPoseDto,
        mockImage,
      );
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

      mockBalletPoseService.create.mockResolvedValue(expectedPose);

      const result = await controller.create(createBalletPoseDto);

      expect(service.create).toHaveBeenCalledWith(
        createBalletPoseDto,
        undefined,
      );
      expect(result).toEqual(expectedPose);
    });
  });

  describe('update', () => {
    it('should update a ballet pose successfully', async () => {
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

      const expectedPose = {
        id: poseId,
        name: '플리에 수정',
        description: '발레의 기본 동작 수정',
        difficulty: PoseDifficulty.BEGINNER,
        imageUrl: '/uploads/ballet-poses/plie-updated.jpg',
        updatedAt: new Date(),
      };

      mockBalletPoseService.update.mockResolvedValue(expectedPose);

      const result = await controller.update(
        poseId,
        updateBalletPoseDto,
        mockImage,
      );

      expect(service.update).toHaveBeenCalledWith(
        poseId,
        updateBalletPoseDto,
        mockImage,
      );
      expect(result).toEqual(expectedPose);
    });

    it('should update a ballet pose without image', async () => {
      const poseId = 1;
      const updateBalletPoseDto: UpdateBalletPoseDto = {
        name: '플리에 수정',
        description: '발레의 기본 동작 수정',
      };

      const expectedPose = {
        id: poseId,
        name: '플리에 수정',
        description: '발레의 기본 동작 수정',
        difficulty: PoseDifficulty.BEGINNER,
        imageUrl: null,
        updatedAt: new Date(),
      };

      mockBalletPoseService.update.mockResolvedValue(expectedPose);

      const result = await controller.update(poseId, updateBalletPoseDto);

      expect(service.update).toHaveBeenCalledWith(
        poseId,
        updateBalletPoseDto,
        undefined,
      );
      expect(result).toEqual(expectedPose);
    });
  });

  describe('remove', () => {
    it('should remove a ballet pose successfully', async () => {
      const poseId = 1;
      const expectedPose = {
        id: poseId,
        name: '플리에',
        description: '발레의 기본 동작',
        difficulty: PoseDifficulty.BEGINNER,
        imageUrl: '/uploads/ballet-poses/plie.jpg',
      };

      mockBalletPoseService.remove.mockResolvedValue(expectedPose);

      const result = await controller.remove(poseId);

      expect(service.remove).toHaveBeenCalledWith(poseId);
      expect(result).toEqual(expectedPose);
    });
  });
});
