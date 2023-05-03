import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // add this line to make dto working
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // any addtional input will be ignore if the whitelist is true
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(3001);
}
bootstrap();
