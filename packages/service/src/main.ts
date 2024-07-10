import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";
import {ValidationPipe} from "@nestjs/common";
import {FormatResponseInterceptor} from "./common/interceptor/format-response.interceptor";
import {InvokeRecordInterceptor} from "./common/interceptor/invoke-record.interceptor";
import {UnLoginFilter} from "./common/filter/unLogin.filter";
import {CustomExceptionFilter} from "./common/filter/custom-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalInterceptors(new FormatResponseInterceptor())
  app.useGlobalInterceptors(new InvokeRecordInterceptor())
  app.useGlobalFilters(new UnLoginFilter())
  app.useGlobalFilters(new CustomExceptionFilter())

  const port = configService.get<number>('APPLICATION_PORT') || 3000;

  await app.listen(port, () => {
    console.log(`服务已经启动：http://localhost:${port}`)
  });
}

bootstrap();
