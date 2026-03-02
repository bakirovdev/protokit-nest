import { PrismaService } from '@src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AuthUserService } from '../http/services/auth-user.service';

type AvailableRoles = {
    permissions: string[]
    tree: object
    available: {
        permissions: string[]
        tree: {}
    }
}

@Injectable()
export class RoleHelper {
    constructor(
        private prisma: PrismaService,
        private authService: AuthUserService
    ) {}

    async availableRoles(): Promise<AvailableRoles>{
        const fullUser  = await this.authService.getFullUser();

        let permissions: any  = await this.prisma.permission.findMany({});
        permissions = permissions.map(perm => perm.name);
        const tree =  this.makeTree(permissions);

        return {
            permissions,
            tree,
            available: {
                permissions: fullUser.role?.permissions || [],
                tree: this.makeTree(fullUser.role?.permissions || [])
            }
        }
    }

    makeTree(permissions: string[]): object
    {        
        const tree = {}
        
        permissions.forEach((permission) => {
            const parts = permission.split(".");
            let current = tree;
            
            parts.forEach((part, idx) => {
                if (idx === parts.length - 1) {
                    current[part] = permission;
                }else  {
                    current[part] ||= {};
                    current = current[part];
                }                
            });
        })    

        return tree;
    }

    async validatedPermissions(permissions: string[]): Promise<string[]>
    {
        const fullUser  = await this.authService.getFullUser();
        const userPermissions = fullUser.role?.permissions || [];
        const approvedPermissions = permissions.filter(item => userPermissions.includes(item));
        return approvedPermissions;
    }
}
