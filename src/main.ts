import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Seedlet API')
    .setDescription('Seedlet API endpoints documentation')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    })
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/api-docs', app, documentFactory, {
    jsonDocumentUrl: 'v1/api-docs.json',
  });

  app.enableCors({
    origin: ['http://localhost:3000', 'https://seedlet-api.onrender.com'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.setGlobalPrefix('/api/v1');
  await app.listen(process.env.PORT ?? 4321);
}
void bootstrap();
