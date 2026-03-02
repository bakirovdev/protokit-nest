import { Module, Global } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/prisma/prisma.service';
import { JwtAuthGuard, RoleGuard } from '@src/base/guards';
import { AuthUserService } from '@src/base/http/services/auth-user.service';
import { FileService } from '@src/base/http/services/file.service';
import { HierarchyService } from '@src/base/http/services';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    PrismaService,
    JwtService,
    JwtAuthGuard,
    RoleGuard,
    AuthUserService,
    FileService,
    HierarchyService
  ],
  exports: [
    PrismaService,
    JwtService,
    JwtAuthGuard,
    RoleGuard,
    AuthUserService,
    FileService,
    HierarchyService
  ],
})
export class SharedModule {}