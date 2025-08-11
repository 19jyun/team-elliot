import { Test, TestingModule } from '@nestjs/testing';
import { AcademyController } from '../academy.controller';
import { AcademyService } from '../academy.service';
import { CreateAcademyDto, JoinAcademyDto, LeaveAcademyDto } from '../dto';

describe('AcademyController', () => {
  let controller: AcademyController;
  let service: AcademyService;

  const mockAcademyService = {
    createAcademy: jest.fn(),
    deleteAcademy: jest.fn(),
    getAcademies: jest.fn(),
    getAcademyById: jest.fn(),
    joinAcademy: jest.fn(),
    leaveAcademy: jest.fn(),
    getMyAcademies: jest.fn(),
  };

  const mockUser = {
    id: 1,
    userId: 'testuser',
    role: 'STUDENT',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademyController],
      providers: [
        {
          provide: AcademyService,
          useValue: mockAcademyService,
        },
      ],
    }).compile();

    controller = module.get<AcademyController>(AcademyController);
    service = module.get<AcademyService>(AcademyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAcademy', () => {
    it('should create an academy successfully', async () => {
      const createAcademyDto: CreateAcademyDto = {
        name: '테스트 학원',
        phoneNumber: '02-1234-5678',
        address: '서울시 강남구',
        description: '테스트 학원입니다.',
        code: 'TEST001',
      };

      const expectedResult = {
        id: 1,
        ...createAcademyDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAcademyService.createAcademy.mockResolvedValue(expectedResult);

      const result = await controller.createAcademy(createAcademyDto);

      expect(service.createAcademy).toHaveBeenCalledWith(createAcademyDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteAcademy', () => {
    it('should delete an academy successfully', async () => {
      const academyId = 1;
      const expectedResult = { message: '학원이 성공적으로 삭제되었습니다.' };

      mockAcademyService.deleteAcademy.mockResolvedValue(expectedResult);

      const result = await controller.deleteAcademy(academyId);

      expect(service.deleteAcademy).toHaveBeenCalledWith(academyId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAcademies', () => {
    it('should return all academies', async () => {
      const expectedAcademies = [
        {
          id: 1,
          name: '테스트 학원 1',
          phoneNumber: '02-1234-5678',
          address: '서울시 강남구',
          description: '테스트 학원 1입니다.',
          code: 'TEST001',
        },
        {
          id: 2,
          name: '테스트 학원 2',
          phoneNumber: '02-2345-6789',
          address: '서울시 서초구',
          description: '테스트 학원 2입니다.',
          code: 'TEST002',
        },
      ];

      mockAcademyService.getAcademies.mockResolvedValue(expectedAcademies);

      const result = await controller.getAcademies();

      expect(service.getAcademies).toHaveBeenCalled();
      expect(result).toEqual(expectedAcademies);
    });
  });

  describe('getAcademyById', () => {
    it('should return academy by id', async () => {
      const academyId = 1;
      const expectedAcademy = {
        id: academyId,
        name: '테스트 학원',
        phoneNumber: '02-1234-5678',
        address: '서울시 강남구',
        description: '테스트 학원입니다.',
        code: 'TEST001',
      };

      mockAcademyService.getAcademyById.mockResolvedValue(expectedAcademy);

      const result = await controller.getAcademyById(academyId);

      expect(service.getAcademyById).toHaveBeenCalledWith(academyId);
      expect(result).toEqual(expectedAcademy);
    });
  });

  describe('joinAcademy', () => {
    it('should join academy successfully', async () => {
      const joinAcademyDto: JoinAcademyDto = {
        code: 'TEST001',
      };

      const expectedResult = { message: '학원 가입이 완료되었습니다.' };

      mockAcademyService.joinAcademy.mockResolvedValue(expectedResult);

      const result = await controller.joinAcademy(mockUser, joinAcademyDto);

      expect(service.joinAcademy).toHaveBeenCalledWith(
        mockUser.id,
        joinAcademyDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('leaveAcademy', () => {
    it('should leave academy successfully', async () => {
      const leaveAcademyDto: LeaveAcademyDto = {
        academyId: 1,
      };

      const expectedResult = { message: '학원 탈퇴가 완료되었습니다.' };

      mockAcademyService.leaveAcademy.mockResolvedValue(expectedResult);

      const result = await controller.leaveAcademy(mockUser, leaveAcademyDto);

      expect(service.leaveAcademy).toHaveBeenCalledWith(
        mockUser.id,
        leaveAcademyDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMyAcademies', () => {
    it('should return my academies', async () => {
      const expectedMyAcademies = [
        {
          id: 1,
          name: '테스트 학원 1',
          phoneNumber: '02-1234-5678',
          address: '서울시 강남구',
          description: '테스트 학원 1입니다.',
          code: 'TEST001',
        },
      ];

      mockAcademyService.getMyAcademies.mockResolvedValue(expectedMyAcademies);

      const result = await controller.getMyAcademies(mockUser);

      expect(service.getMyAcademies).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(expectedMyAcademies);
    });
  });
});
