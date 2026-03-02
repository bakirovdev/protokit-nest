import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}
    exceptions = ['common'];
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const handler = context.getHandler();        
        
        const controller = context.getClass();
        const user = request.user; // 👈 comes from JwtAuthGuard

        if (!user) {
            throw new ForbiddenException('No user found in request');
        }            

        let path2 = Reflect.getMetadata('path', controller);
        path2 = path2.split('/');
        
        if (this.exceptions.includes(path2[0])) {
            return true;
        }

        path2 = path2.join('.');
        const permission = `${path2}.${handler.name}`;
        
        const userPermissions = await this.prisma.permission.findFirst({
            where: {
                role_permission_ref: {
                    some:{
                        role: {
                            users: { 
                                some : { 
                                    id: user.id
                                }
                            }
                        }
                    }
                },
                name: permission
            }
        });

        if (userPermissions === null) {
            throw new ForbiddenException('Access to this resource is denied');   
        }
        
        return true;
    }
}