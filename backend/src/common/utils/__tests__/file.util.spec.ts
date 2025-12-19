import * as fs from 'fs';
import * as path from 'path';
import { FileUtil } from '../file.util';

// fs 모듈 모킹
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
  promises: {
    unlink: jest.fn(),
  },
}));

describe('FileUtil', () => {
  const mockFilePath = './uploads/teacher-photos/test-123456.jpg';
  const mockAbsolutePath = path.join(process.cwd(), mockFilePath);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteFileSync', () => {
    it('파일이 존재하면 삭제 성공', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      const result = FileUtil.deleteFileSync(mockFilePath);

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(mockAbsolutePath);
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockAbsolutePath);
    });

    it('파일이 존재하지 않으면 false 반환', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = FileUtil.deleteFileSync(mockFilePath);

      expect(result).toBe(false);
      expect(fs.existsSync).toHaveBeenCalledWith(mockAbsolutePath);
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('파일 경로가 null이면 false 반환', () => {
      const result = FileUtil.deleteFileSync(null as any);

      expect(result).toBe(false);
      expect(fs.existsSync).not.toHaveBeenCalled();
    });

    it('파일 삭제 실패 시 false 반환하고 에러 로깅', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = FileUtil.deleteFileSync(mockFilePath);

      expect(result).toBe(false);
    });

    it('절대 경로를 받으면 그대로 사용', () => {
      const absolutePath = '/absolute/path/to/file.jpg';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      FileUtil.deleteFileSync(absolutePath);

      expect(fs.existsSync).toHaveBeenCalledWith(absolutePath);
      expect(fs.unlinkSync).toHaveBeenCalledWith(absolutePath);
    });
  });

  describe('deleteFile', () => {
    it('비동기로 파일 삭제 성공', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.promises.unlink as jest.Mock).mockResolvedValue(undefined);

      const result = await FileUtil.deleteFile(mockFilePath);

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(mockAbsolutePath);
      expect(fs.promises.unlink).toHaveBeenCalledWith(mockAbsolutePath);
    });

    it('파일이 존재하지 않으면 false 반환', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await FileUtil.deleteFile(mockFilePath);

      expect(result).toBe(false);
      expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    it('비동기 삭제 실패 시 false 반환', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.promises.unlink as jest.Mock).mockRejectedValue(
        new Error('Permission denied'),
      );

      const result = await FileUtil.deleteFile(mockFilePath);

      expect(result).toBe(false);
    });
  });

  describe('extractFilePathFromUrl', () => {
    it('/uploads/로 시작하는 URL을 ./uploads/로 변환', () => {
      const url = '/uploads/teacher-photos/123456.jpg';
      const result = FileUtil.extractFilePathFromUrl(url);

      expect(result).toBe('./uploads/teacher-photos/123456.jpg');
    });

    it('./uploads/로 시작하는 경로는 그대로 반환', () => {
      const url = './uploads/teacher-photos/123456.jpg';
      const result = FileUtil.extractFilePathFromUrl(url);

      expect(result).toBe('./uploads/teacher-photos/123456.jpg');
    });

    it('uploads/로 시작하는 경로에 ./를 추가', () => {
      const url = 'uploads/teacher-photos/123456.jpg';
      const result = FileUtil.extractFilePathFromUrl(url);

      expect(result).toBe('./uploads/teacher-photos/123456.jpg');
    });

    it('null이면 null 반환', () => {
      const result = FileUtil.extractFilePathFromUrl(null);

      expect(result).toBe(null);
    });

    it('undefined이면 null 반환', () => {
      const result = FileUtil.extractFilePathFromUrl(undefined);

      expect(result).toBe(null);
    });

    it('빈 문자열이면 null 반환', () => {
      const result = FileUtil.extractFilePathFromUrl('');

      expect(result).toBe(null);
    });

    it('잘못된 형식의 URL은 null 반환', () => {
      const result = FileUtil.extractFilePathFromUrl(
        'https://example.com/image.jpg',
      );

      expect(result).toBe(null);
    });
  });

  describe('deleteProfilePhoto', () => {
    it('프로필 사진 URL을 파싱하여 삭제', () => {
      const photoUrl = '/uploads/teacher-photos/123456.jpg';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      const result = FileUtil.deleteProfilePhoto(photoUrl);

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('null URL이면 false 반환', () => {
      const result = FileUtil.deleteProfilePhoto(null);

      expect(result).toBe(false);
      expect(fs.existsSync).not.toHaveBeenCalled();
    });

    it('잘못된 URL 형식이면 false 반환', () => {
      const result = FileUtil.deleteProfilePhoto(
        'https://example.com/photo.jpg',
      );

      expect(result).toBe(false);
    });
  });

  describe('deleteMultipleFiles', () => {
    it('여러 파일을 순차적으로 삭제', () => {
      const filePaths = [
        './uploads/photo1.jpg',
        './uploads/photo2.jpg',
        './uploads/photo3.jpg',
      ];

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      const deletedCount = FileUtil.deleteMultipleFiles(filePaths);

      expect(deletedCount).toBe(3);
      expect(fs.existsSync).toHaveBeenCalledTimes(3);
      expect(fs.unlinkSync).toHaveBeenCalledTimes(3);
    });

    it('null이나 undefined 항목은 건너뛰기', () => {
      const filePaths = [
        './uploads/photo1.jpg',
        null,
        undefined,
        './uploads/photo2.jpg',
      ];

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      const deletedCount = FileUtil.deleteMultipleFiles(filePaths);

      expect(deletedCount).toBe(2);
      expect(fs.existsSync).toHaveBeenCalledTimes(2);
    });

    it('일부 파일 삭제 실패해도 계속 진행', () => {
      const filePaths = ['./uploads/photo1.jpg', './uploads/photo2.jpg'];

      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // 첫 번째 파일 존재
        .mockReturnValueOnce(false); // 두 번째 파일 없음

      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      const deletedCount = FileUtil.deleteMultipleFiles(filePaths);

      expect(deletedCount).toBe(1);
    });

    it('빈 배열이면 0 반환', () => {
      const deletedCount = FileUtil.deleteMultipleFiles([]);

      expect(deletedCount).toBe(0);
      expect(fs.existsSync).not.toHaveBeenCalled();
    });
  });
});
