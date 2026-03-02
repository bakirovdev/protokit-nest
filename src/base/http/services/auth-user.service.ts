import { Injectable, Scope, Inject, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserProfile, UserTypeEnum } from '@prisma/client';
import { CustomTokenPayload } from '@src/base/interfaces';
import { UserSearch } from '@src/modules/user/user/user.search';
import { PrismaService } from '@src/prisma/prisma.service';
import type { Request } from 'express';

declare module 'express' {
    export interface Request {
        user?: any;
    }
}

export type FullUserType = {
    id: number,
    email: string,
    type: UserTypeEnum,
    created_at: Date,
    updated_at: Date,
    is_deleted: Boolean,
    company_id?: number | null
    profile?: UserProfile | null,
    role?: {
        id: number,
        name: string
        type: UserTypeEnum
        description?: string|null
        permissions: string[]
    }|null
}

@Injectable({ scope: Scope.REQUEST })
export class AuthUserService {
    constructor(
        @Inject(REQUEST) private readonly request: Request,
        private prisma: PrismaService,
    ) {}

    getCurrentUser(): FullUserType
    {    
        return this.request.user;
    }

    getCurrentUserId(): number 
    {
        const user = this.getCurrentUser();
        if (!user) {
            throw new UnauthorizedException('User not authenticated');
        }
        return user.id;
    }

    isAuthenticated(): boolean {
        return !!this.request.user;
    }

    async getFullUser(): Promise<FullUserType>
    {
        const user = this.getCurrentUser();
        if (!user) {
            throw new UnauthorizedException('User not authenticated');
        }

        let userSearch = new UserSearch();

        let fullUser = await this.prisma.user.findUnique({
            select: {
                ...userSearch.safeSelect,
                profile: true,
                role: {
                    include: {
                        role_permission_ref: {
                            include: { permission: true }
                        }
                    }
                }
            },
            where: { id: user.id },
        });

        if (!fullUser) {
            throw new UnauthorizedException('User not found');
        }
        let permissions = fullUser.role?.role_permission_ref?.map(r => r.permission.name) || [];
        
        const userWithPermissions = {
            ...fullUser,
            role: fullUser.role ? {
                id: fullUser.role.id,
                name: fullUser.role.name,
                type: fullUser.role.type,
                description: fullUser.role.description,
                permissions: permissions
            }: null
        }

        return userWithPermissions;
    }
}
