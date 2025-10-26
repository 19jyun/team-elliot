import { Test, TestingModule } from '@nestjs/testing';
import { SessionContentService } from '../session-content.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionContentDto } from '../dto/create-session-content.dto';
import { UpdateSessionContentDto } from '../dto/update-session-content.dto';
import { ReorderSessionContentsDto } from '../dto/reorder-session-contents.dto';
import { NotFoundException } from '@nestjs/common';

describe('SessionContentService', () => {
  let service: SessionContentService;
  let prisma: any;

  const mockPrisma = {
    sessionContent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    classSession: {
      findUnique: jest.fn(),
    },
    balletPose: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionContentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<SessionContentService>(SessionContentService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findBySessionId', () => {
    it('should get session contents by session id', async () => {
      const sessionId = 1;
      const contents = [
        {
          id: 1,
          sessionId: 1,
          poseId: 1,
          order: 0,
          notes: 'First pose',
          pose: { id: 1, name: 'First Position' },
        },
        {
          id: 2,
          sessionId: 1,
          poseId: 2,
          order: 1,
          notes: 'Second pose',
          pose: { id: 2, name: 'Second Position' },
        },
      ];

      prisma.classSession.findUnique.mockResolvedValue({
        id: sessionId,
        sessionSummary: null,
      });
      prisma.sessionContent.findMany.mockResolvedValue(contents);

      const result = await service.findBySessionId(sessionId);

      expect(result).toEqual({
        sessionSummary: undefined,
        contents,
      });
      expect(prisma.sessionContent.findMany).toHaveBeenCalledWith({
        where: { sessionId },
        include: { pose: true },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should get a specific session content', async () => {
      const contentId = 1;
      const content = {
        id: 1,
        sessionId: 1,
        poseId: 1,
        order: 0,
        notes: 'First pose',
        pose: { id: 1, name: 'First Position' },
      };

      prisma.sessionContent.findUnique.mockResolvedValue(content);

      const result = await service.findOne(contentId);

      expect(result).toEqual(content);
      expect(prisma.sessionContent.findUnique).toHaveBeenCalledWith({
        where: { id: contentId },
        include: { pose: true },
      });
    });

    it('should throw NotFoundException when content not found', async () => {
      const contentId = 999;

      prisma.sessionContent.findUnique.mockResolvedValue(null);

      await expect(service.findOne(contentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a session content with specified order', async () => {
      const sessionId = 1;
      const createSessionContentDto: CreateSessionContentDto = {
        poseId: 1,
        order: 0,
        notes: 'New pose',
      };
      const createdContent = {
        id: 1,
        sessionId: 1,
        ...createSessionContentDto,
        pose: { id: 1, name: 'First Position' },
      };

      prisma.classSession.findUnique.mockResolvedValue({ id: sessionId });
      prisma.balletPose.findUnique.mockResolvedValue({ id: 1 });
      prisma.sessionContent.create.mockResolvedValue(createdContent);

      const result = await service.create(sessionId, createSessionContentDto);

      expect(result).toEqual(createdContent);
      expect(prisma.classSession.findUnique).toHaveBeenCalledWith({
        where: { id: sessionId },
      });
      expect(prisma.balletPose.findUnique).toHaveBeenCalledWith({
        where: { id: createSessionContentDto.poseId },
      });
      expect(prisma.sessionContent.create).toHaveBeenCalledWith({
        data: {
          sessionId,
          poseId: createSessionContentDto.poseId,
          order: createSessionContentDto.order,
          notes: createSessionContentDto.notes,
        },
        include: { pose: true },
      });
    });

    it('should create a session content with auto-generated order', async () => {
      const sessionId = 1;
      const createSessionContentDto: CreateSessionContentDto = {
        poseId: 1,
        notes: 'New pose',
      };
      const createdContent = {
        id: 1,
        sessionId: 1,
        poseId: 1,
        order: 2,
        notes: 'New pose',
        pose: { id: 1, name: 'First Position' },
      };

      prisma.classSession.findUnique.mockResolvedValue({ id: sessionId });
      prisma.balletPose.findUnique.mockResolvedValue({ id: 1 });
      prisma.sessionContent.findFirst.mockResolvedValue({ order: 1 });
      prisma.sessionContent.create.mockResolvedValue(createdContent);

      const result = await service.create(sessionId, createSessionContentDto);

      expect(result).toEqual(createdContent);
      expect(prisma.sessionContent.findFirst).toHaveBeenCalledWith({
        where: { sessionId },
        orderBy: { order: 'desc' },
      });
      expect(prisma.sessionContent.create).toHaveBeenCalledWith({
        data: {
          sessionId,
          poseId: createSessionContentDto.poseId,
          order: 2, // maxOrder + 1
          notes: createSessionContentDto.notes,
        },
        include: { pose: true },
      });
    });

    it('should create a session content with order 0 when no existing content', async () => {
      const sessionId = 1;
      const createSessionContentDto: CreateSessionContentDto = {
        poseId: 1,
        notes: 'New pose',
      };
      const createdContent = {
        id: 1,
        sessionId: 1,
        poseId: 1,
        order: 0,
        notes: 'New pose',
        pose: { id: 1, name: 'First Position' },
      };

      prisma.classSession.findUnique.mockResolvedValue({ id: sessionId });
      prisma.balletPose.findUnique.mockResolvedValue({ id: 1 });
      prisma.sessionContent.findFirst.mockResolvedValue(null);
      prisma.sessionContent.create.mockResolvedValue(createdContent);

      const result = await service.create(sessionId, createSessionContentDto);

      expect(result).toEqual(createdContent);
      expect(prisma.sessionContent.create).toHaveBeenCalledWith({
        data: {
          sessionId,
          poseId: createSessionContentDto.poseId,
          order: 0, // no existing content
          notes: createSessionContentDto.notes,
        },
        include: { pose: true },
      });
    });

    it('should throw NotFoundException when session not found', async () => {
      const sessionId = 999;
      const createSessionContentDto: CreateSessionContentDto = {
        poseId: 1,
        notes: 'New pose',
      };

      prisma.classSession.findUnique.mockResolvedValue(null);

      await expect(
        service.create(sessionId, createSessionContentDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when pose not found', async () => {
      const sessionId = 1;
      const createSessionContentDto: CreateSessionContentDto = {
        poseId: 999,
        notes: 'New pose',
      };

      prisma.classSession.findUnique.mockResolvedValue({ id: sessionId });
      prisma.balletPose.findUnique.mockResolvedValue(null);

      await expect(
        service.create(sessionId, createSessionContentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a session content', async () => {
      const contentId = 1;
      const updateSessionContentDto: UpdateSessionContentDto = {
        notes: 'Updated notes',
      };
      const existingContent = {
        id: 1,
        sessionId: 1,
        poseId: 1,
        order: 0,
        notes: 'Original notes',
        pose: { id: 1, name: 'First Position' },
      };
      const updatedContent = {
        ...existingContent,
        ...updateSessionContentDto,
      };

      prisma.sessionContent.findUnique.mockResolvedValue(existingContent);
      prisma.sessionContent.update.mockResolvedValue(updatedContent);

      const result = await service.update(contentId, updateSessionContentDto);

      expect(result).toEqual(updatedContent);
      expect(prisma.sessionContent.update).toHaveBeenCalledWith({
        where: { id: contentId },
        data: updateSessionContentDto,
        include: { pose: true },
      });
    });

    it('should throw NotFoundException when content not found', async () => {
      const contentId = 999;
      const updateSessionContentDto: UpdateSessionContentDto = {
        notes: 'Updated notes',
      };

      prisma.sessionContent.findUnique.mockResolvedValue(null);

      await expect(
        service.update(contentId, updateSessionContentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a session content', async () => {
      const contentId = 1;
      const existingContent = {
        id: 1,
        sessionId: 1,
        poseId: 1,
        order: 0,
        notes: 'Original notes',
        pose: { id: 1, name: 'First Position' },
      };
      prisma.sessionContent.findUnique.mockResolvedValue(existingContent);
      prisma.sessionContent.delete.mockResolvedValue(existingContent);

      const response = await service.remove(contentId);

      expect(response).toEqual(existingContent);
      expect(prisma.sessionContent.delete).toHaveBeenCalledWith({
        where: { id: contentId },
      });
    });

    it('should throw NotFoundException when content not found', async () => {
      const contentId = 999;

      prisma.sessionContent.findUnique.mockResolvedValue(null);

      await expect(service.remove(contentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reorder', () => {
    it('should reorder session contents', async () => {
      const sessionId = 1;
      const reorderDto: ReorderSessionContentsDto = {
        contentIds: ['2', '1', '3'],
      };
      const currentContents = [
        { id: 1, sessionId: 1, order: 0 },
        { id: 2, sessionId: 1, order: 1 },
        { id: 3, sessionId: 1, order: 2 },
      ];
      const reorderedContents = [
        {
          id: 2,
          sessionId: 1,
          order: 0,
          pose: { id: 1, name: 'Second Position' },
        },
        {
          id: 1,
          sessionId: 1,
          order: 1,
          pose: { id: 1, name: 'First Position' },
        },
        {
          id: 3,
          sessionId: 1,
          order: 2,
          pose: { id: 1, name: 'Third Position' },
        },
      ];

      prisma.classSession.findUnique.mockResolvedValue({
        id: sessionId,
        sessionSummary: null,
      });
      prisma.sessionContent.findMany.mockResolvedValue(currentContents);
      prisma.$transaction.mockResolvedValue([]);
      prisma.sessionContent.findMany
        .mockResolvedValueOnce(currentContents)
        .mockResolvedValueOnce(reorderedContents);

      const response = await service.reorder(sessionId, reorderDto);

      expect(response).toEqual({
        sessionSummary: undefined,
        contents: reorderedContents,
      });
      expect(prisma.classSession.findUnique).toHaveBeenCalledWith({
        where: { id: sessionId },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
