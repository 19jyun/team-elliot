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
    .setDescription('API 문서 자동화 with Swagger')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // CORS 설정 - 여러 origin 허용
  const allowedOrigins = [
    'http://localhost:3000', // 로컬 개발
    'https://team-elliot-git-main-junghun-yuns-projects.vercel.app',
    'https://team-elliot-eight.vercel.app',
    'https://team-elliot-pvv8c9z07-junghun-yuns-projects.vercel.app',
    'capacitor://localhost',
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
