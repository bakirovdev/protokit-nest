import { Inject, Injectable } from '@nestjs/common';
import { AuthUserService, BaseService } from '@src/base/http/services';
import type { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { __ } from '@src/base/helpers/translator.helper';
import { RoleSearch } from './role.search';
import { ApiResponse, ApiResponseType, handleError, RoleHelper } from '@src/base/helpers';
import { CreateRoleDto } from './dto/create-role.dto';
import { Prisma } from '@generated/prisma';
import { RoleResource } from './resource/role.resource';

@Injectable()
export class RoleService extends BaseService {
    protected resource = RoleResource;

    constructor(
        protected search: RoleSearch,
        @Inject(REQUEST) request: Request,
        protected roleHelper: RoleHelper,        
        protected authService: AuthUserService
    ) {
        super(Prisma.ModelName.Role, request, CreateRoleDto, search);
    }

    protected async baseFilters(): Promise<void> {            }


    async store(data: CreateRoleDto): Promise<ApiResponseType> {
        try {
            let inputData = await this.validateDto(data, 'create') as CreateRoleDto;
            
            const permissionIds = await this.validatePermissions(inputData.permissions) ;

            const role = await this.prisma.$transaction(async (tx) => {
                const result = await tx.role.create({
                    data: {
                        name: inputData.name,
                        description: inputData.description,                        
                    },
                    select: this.search?.safeSelect || undefined
                });

                const refData = permissionIds.map(perId => ({
                    permission_id: perId,
                    role_id: result.id
                }))

                await tx.rolePermissionRef.createMany({
                    data: refData
                })
                return result;
            });

            const result = await this.buildRoleData(role.id);

            return ApiResponse.success(this.resource.make(result));

        } catch (error) {
            return handleError(error)
        }
    }

    async update(id: string, data: CreateRoleDto): Promise<ApiResponseType<any>> {
        try {
            await this.baseFilters();    

            let inputData = await this.validateDto(data, 'update') as CreateRoleDto;
            const permissionIds = await this.validatePermissions(inputData.permissions);
            const checkRole = await this.search.findFirst({ where: { id: id } });

            if (!checkRole) throw handleError(__('messages.does_not_exist'), 404);

            const role = await this.prisma.$transaction(async (tx) => {
                const result = await tx.role.update({
                    where: {
                        id
                    },
                    data: {
                        name: inputData.name,
                        description: inputData.description,                        
                    },
                    select: this.search?.safeSelect || undefined
                });

                await tx.rolePermissionRef.deleteMany({
                    where: {
                        role_id: id
                    }
                })

                const refData = permissionIds.map(perId => ({
                    permission_id: perId,
                    role_id: result.id
                }))

                await tx.rolePermissionRef.createMany({
                    data: refData
                })

                return result;
            });

            const result = await this.buildRoleData(role.id);

            return ApiResponse.success(this.resource.make(result));

        } catch (error) {
            throw handleError(error)
        }
    }

    async delete(id: string): Promise<ApiResponseType<any>> {
        try {
            return super.delete(id)
        } catch (error) {
            throw handleError(error)
        }
    }

    async restore(id: string): Promise<ApiResponseType<any>> {
        try {
            return super.restore(id);
        } catch (error) {
            throw handleError(error)
        }
    }

    private async validatePermissions(permissionKeys: string[]): Promise<string[]> {
        const validatedPermissions = await this.roleHelper.validatedPermissions(permissionKeys);
        const permissions = await this.prisma.permission.findMany({
            where: {
                name: {
                    in: validatedPermissions
                }
            },
            select: { id: true }
        });
        const permissionIds = permissions.map(per => per.id);
        return permissionIds;
    }

    private async buildRoleData(role_id: string): Promise<ApiResponseType<any>> {
        this.search.setInclude(['role_permission_ref.permission']);
        let result: any = await this.search.findFirst({ where: { id: role_id } });

        let permission = [];
        if (result) {
            permission = result.role_permission_ref.map(role_ref => role_ref.permission.name)
        }
        result = {
            ...result,
            permission,
            role_permission_ref: undefined
        }
        return result;
    }
}