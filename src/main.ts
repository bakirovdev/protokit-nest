import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   const config = new DocumentBuilder()
    .setTitle('API Title')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('API Tag') // Optional: groups endpoints under a tag in the UI
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 'api' is the endpoint URL for the Swagger UI

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
