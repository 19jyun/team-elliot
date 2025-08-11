import { Test, TestingModule } from '@nestjs/testing';
import { SessionContentController } from '../session-content.controller';
import { SessionContentService } from '../session-content.service';
import { CreateSessionContentDto } from '../dto/create-session-content.dto';
import { UpdateSessionContentDto } from '../dto/update-session-content.dto';
import { ReorderSessionContentsDto } from '../dto/reorder-session-contents.dto';

describe('SessionContentController', () => {
  let controller: SessionContentController;
  let service: SessionContentService;

  const mockService = {
    findBySessionId: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reorder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionContentController],
      providers: [{ provide: SessionContentService, useValue: mockService }],
    }).compile();
    controller = module.get<SessionContentController>(SessionContentController);
    service = module.get<SessionContentService>(SessionContentService);
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
      mockService.findBySessionId.mockResolvedValue(contents);

      const result = await controller.findBySessionId(sessionId);

      expect(result).toEqual(contents);
      expect(service.findBySessionId).toHaveBeenCalledWith(sessionId);
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
      mockService.findOne.mockResolvedValue(content);

      const result = await controller.findOne(contentId);

      expect(result).toEqual(content);
      expect(service.findOne).toHaveBeenCalledWith(contentId);
    });
  });

  describe('create', () => {
    it('should create a session content', async () => {
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
      mockService.create.mockResolvedValue(createdContent);

      const result = await controller.create(
        sessionId,
        createSessionContentDto,
      );

      expect(result).toEqual(createdContent);
      expect(service.create).toHaveBeenCalledWith(
        sessionId,
        createSessionContentDto,
      );
    });
  });

  describe('reorder', () => {
    it('should reorder session contents', async () => {
      const sessionId = 1;
      const reorderDto: ReorderSessionContentsDto = {
        contentIds: ['2', '1', '3'],
      };
      const result = { message: '순서가 변경되었습니다.' };
      mockService.reorder.mockResolvedValue(result);

      const response = await controller.reorder(sessionId, reorderDto);

      expect(response).toEqual(result);
      expect(service.reorder).toHaveBeenCalledWith(sessionId, reorderDto);
    });
  });

  describe('update', () => {
    it('should update a session content', async () => {
      const contentId = 1;
      const updateSessionContentDto: UpdateSessionContentDto = {
        notes: 'Updated notes',
      };
      const updatedContent = {
        id: 1,
        sessionId: 1,
        poseId: 1,
        order: 0,
        notes: 'Updated notes',
        pose: { id: 1, name: 'First Position' },
      };
      mockService.update.mockResolvedValue(updatedContent);

      const result = await controller.update(
        contentId,
        updateSessionContentDto,
      );

      expect(result).toEqual(updatedContent);
      expect(service.update).toHaveBeenCalledWith(
        contentId,
        updateSessionContentDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a session content', async () => {
      const contentId = 1;
      const result = { message: '세션 내용이 삭제되었습니다.' };
      mockService.remove.mockResolvedValue(result);

      const response = await controller.remove(contentId);

      expect(response).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(contentId);
    });
  });
});
