import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe())

  const port = configService.get<number>('APPLICATION_PORT') || 3000;

  await app.listen(port, () => {
    console.log(`服务已经启动：http://localhost:${port}`)
  });
}
bootstrap();
