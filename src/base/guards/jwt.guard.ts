import { CanActivate, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { CustomTokenPayload } from "../interfaces";
import { PrismaService } from "@src/prisma/prisma.service";
import { UserSearch } from "@src/modules/user/user/user.search";
import { UserProfile, UserTypeEnum } from "@prisma/client";
import { RequestContextService } from "../middlewares/request-context/request-context.service";

export type AuthUserType = {
  id: number,
  email: string,
  type: UserTypeEnum,
  created_at: Date,
  updated_at: Date,
  is_deleted: Boolean,
  company_id: number | null
  profile: UserProfile | null,    
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<CustomTokenPayload>(token, {
        secret: process.env.JWT_SECRET || 'testsecret',
      });

      if (payload.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      const userSelect = (new UserSearch()).safeSelect;

      const user: AuthUserType | null = await this.prisma.user.findUnique({
        where: {
          id: payload.sub
        },
        select: {
          ...userSelect,
          profile: true
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');  
      }

      request.user = user;
      RequestContextService.setAuth(user);      

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ') || [];
    return type === 'Bearer' ? token : undefined;
  }
}