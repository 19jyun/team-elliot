import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('발레 수강신청 플랫폼 API')
    .setDescription(
      '발레 수강신청 플랫폼의 REST API 문서입니다. 학생, 선생님, 학원 관리자용 API를 제공합니다.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', '인증 관련 API')
    .addTag('Student', '학생 관련 API')
    .addTag('Teacher', '선생님 관련 API')
    .addTag('Academy', '학원 관련 API')
    .addTag('Class', '클래스 관련 API')
    .addTag('ClassSession', '클래스 세션 관련 API')
    .addTag('Payment', '결제 관련 API')
    .addTag('Refund', '환불 관련 API')
    .addTag('BalletPose', '발레 포즈 관련 API')
    .addTag('SessionContent', '세션 콘텐츠 관련 API')
    .addTag('Principal', '원장 관련 API')
    .addTag('SMS', 'SMS 관련 API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // CORS 설정 - 여러 origin 허용
  const allowedOrigins = [
    'http://localhost:3000', // 로컬 개발
    'https://team-elliot-git-main-junghun-yuns-projects.vercel.app',
    'https://team-elliot-eight.vercel.app',
    'https://team-elliot-pvv8c9z07-junghun-yuns-projects.vercel.app',
    process.env.FRONTEND_URL, // 환경변수로 설정된 URL
  ].filter(Boolean); // undefined 값 제거

  app.enableCors({
    origin: (origin, callback) => {
      // origin이 없거나 허용된 origin 목록에 있는 경우 허용
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
