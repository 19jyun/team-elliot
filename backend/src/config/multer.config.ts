import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

// 공통 파일 필터 함수
const imageFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return callback(new Error('이미지 파일만 업로드 가능합니다.'), false);
  }
  callback(null, true);
};

// 공통 파일명 생성 함수
const generateUniqueFilename = (originalname: string) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return `${uniqueSuffix}${extname(originalname)}`;
};

// 선생님 프로필 사진 업로드 설정
export const teacherProfileConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/teacher-photos',
    filename: (req, file, callback) => {
      callback(null, generateUniqueFilename(file.originalname));
    },
  }),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

// 원장 프로필 사진 업로드 설정
export const principalProfileConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/principal-photos',
    filename: (req, file, callback) => {
      callback(null, generateUniqueFilename(file.originalname));
    },
  }),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

// 발레 자세 사진 업로드 설정
export const balletPoseConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/ballet-poses',
    filename: (req, file, callback) => {
      callback(null, generateUniqueFilename(file.originalname));
    },
  }),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB (발레 자세는 더 큰 파일 허용)
  },
};

// 기존 설정 유지 (하위 호환성)
export const multerConfig: MulterOptions = teacherProfileConfig;
