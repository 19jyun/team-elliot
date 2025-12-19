import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';

/**
 * 파일 시스템 유틸리티
 * 프로필 사진 및 기타 업로드 파일 관리
 */
export class FileUtil {
  private static readonly logger = new Logger(FileUtil.name);

  /**
   * 파일 삭제 (동기)
   * @param filePath - 삭제할 파일의 상대 또는 절대 경로
   * @returns 삭제 성공 여부
   */
  static deleteFileSync(filePath: string): boolean {
    try {
      if (!filePath) {
        return false;
      }

      // 상대 경로를 절대 경로로 변환
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);

      // 파일 존재 여부 확인
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        this.logger.log(`File deleted successfully: ${absolutePath}`);
        return true;
      } else {
        this.logger.warn(`File not found, skipping deletion: ${absolutePath}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error);
      return false;
    }
  }

  /**
   * 파일 삭제 (비동기)
   * @param filePath - 삭제할 파일의 상대 또는 절대 경로
   * @returns 삭제 성공 여부
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (!filePath) {
        return false;
      }

      // 상대 경로를 절대 경로로 변환
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);

      // 파일 존재 여부 확인
      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
        this.logger.log(`File deleted successfully: ${absolutePath}`);
        return true;
      } else {
        this.logger.warn(`File not found, skipping deletion: ${absolutePath}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error);
      return false;
    }
  }

  /**
   * URL에서 파일 경로 추출
   * @param url - 파일 URL (예: /uploads/teacher-photos/123456.jpg)
   * @returns 파일 시스템 경로 (예: ./uploads/teacher-photos/123456.jpg)
   */
  static extractFilePathFromUrl(url: string | null | undefined): string | null {
    if (!url) {
      return null;
    }

    // URL이 /uploads/로 시작하는 경우
    if (url.startsWith('/uploads/')) {
      return '.' + url; // ./uploads/...
    }

    // 이미 상대 경로인 경우
    if (url.startsWith('./uploads/')) {
      return url;
    }

    // 절대 경로인 경우
    if (url.startsWith('uploads/')) {
      return './' + url;
    }

    return null;
  }

  /**
   * 프로필 사진 삭제 (URL 기반)
   * @param photoUrl - 데이터베이스에 저장된 사진 URL
   * @returns 삭제 성공 여부
   */
  static deleteProfilePhoto(photoUrl: string | null | undefined): boolean {
    const filePath = this.extractFilePathFromUrl(photoUrl);
    if (!filePath) {
      return false;
    }
    return this.deleteFileSync(filePath);
  }

  /**
   * 여러 파일 일괄 삭제
   * @param filePaths - 삭제할 파일 경로 배열
   * @returns 삭제 성공한 파일 수
   */
  static deleteMultipleFiles(filePaths: (string | null | undefined)[]): number {
    let deletedCount = 0;
    for (const filePath of filePaths) {
      if (filePath && this.deleteFileSync(filePath)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }
}
