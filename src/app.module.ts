import configs from './configs';
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { ConfigModule } from '@nestjs/config';
import { AcceptLanguageResolver, I18nJsonLoader, I18nModule, QueryResolver } from 'nestjs-i18n';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ValidatorsModule } from './base/validators';
import { PipeModule } from './base/pipes/pipe.module';
import { PrismaModule } from './prisma/prisma.module';
import { SharedModule } from './shared/shared.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { I18nExceptionFilter } from './base/filters/i18-exception.filter';
import { createValidationException } from './base/exceptions/i18-validation-exception.factor';
import { RequestContextMiddleware } from './base/middlewares/request-context/request-context.middleware';
import { MethodOverrideMiddleware } from './base/middlewares/method-overdirve.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configs],
    }),
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: 'en',
        loader: I18nJsonLoader,
        loaderOptions: {
          path: join(__dirname, '/locales/'),
          watch: true,
        },        
      }),
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
      exclude: ['/api*'], // Exclude API routes
    }),
    ValidatorsModule,
    PipeModule,
    PrismaModule,
    UserModule, 
    PostModule,
    SharedModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: I18nExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,        
        transformOptions: {
          exposeUnsetFields: false,
          excludeExtraneousValues: false,
          enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
          return createValidationException(errors);
        },
      }),
    },
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware, MethodOverrideMiddleware)
      .forRoutes('*');
  }
}
