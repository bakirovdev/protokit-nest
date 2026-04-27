import { ApiResponse, ApiResponseType, PGResponseType } from "@src/base/helpers/response.helper";
import { PrismaService } from "@src/prisma/prisma.service";
import { JsonResource } from "../resources/json.resource";
import { BaseResource } from "../resources/base.resource";
import { Inject, Injectable } from "@nestjs/common";
import { handleError } from "@src/base/helpers/error-handle.helper";
import type { PrismaModels } from "@src/prisma/types";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { BaseDto, ToPrismaTypeEnum } from "../dto";
import { BaseSearch } from "@src/base/search/base.search";
import QueryString from "qs";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";
import { __ } from "@src/base/helpers/translator.helper";

@Injectable()
export abstract class BaseService {
    
    @Inject(PrismaService)
    protected prisma: PrismaService;
    protected queryParams: any;

    protected resource: typeof BaseResource = JsonResource;
    protected search: BaseSearch;

    constructor(
        protected model: PrismaModels, 
        @Inject(REQUEST) request: Request,
        protected dtoClass: (new () => BaseDto) | null,
        search?: BaseSearch
    ) {
        const url = request.url;
        const queryString = url.split('?')[1] || '';
        
        this.queryParams = QueryString.parse(queryString, {
            depth: 5,
            arrayLimit: 100
        });
        
        this.search = search || new BaseSearch();
        this.initializeFromQuery();
    }

    protected initializeFromQuery() {        
        this.search.setModel(this.model)
            .setFilter(this.queryParams.filters)
            .setInclude(this.queryParams.includes)
            .setOrders(this.queryParams.order)
            .setDeleted(this.queryParams.deleted || '')
            .setPg(this.queryParams.perPage, this.queryParams.page);        
    }

    protected async baseFilters(): Promise<void>
    {
        // your loging in child class
    }

    async findAll(filterDto?:any): Promise<PGResponseType<any>>{
        try {
            await this.baseFilters();
            const result = await this.search.paginate({});        
            const data = this.resource.collection(result.data)
            return ApiResponse.successPaginate({ data, meta: result.meta });            
        } catch (error) {
            throw handleError(error)
        }
    }

    async findOne(id: string, filters?: any): Promise<ApiResponseType<any>> {
        try {
            await this.baseFilters();
            const result = await this.search.findFirst({ where: { id } ,select: this.search?.safeSelect || undefined});
            if (!result) {
                throw handleError(__('messages.does_not_exist'), 404)
            }
            return ApiResponse.success(this.resource.make(result));
        } catch (error) {
            throw handleError(error)
        }
    }

    async store(data:any): Promise<ApiResponseType<any>> {
        try {
            await this.baseFilters();
            let inputData = await this.validateDto(data, 'create');
            const result = await this.prisma[this.model].create({ 
                data: inputData,
                select: this.search?.safeSelect || undefined
            });
            return ApiResponse.success(this.resource.make(result));
        } catch (error) {
            return handleError(error)
        }
    }

    async update(id: string, data: any): Promise<ApiResponseType<any>> {
        try {
            await this.baseFilters();
            let inputData = await this.validateDto(data, 'update');
            
            const model = await this.search.findFirst({where: {id}});
            if (!model) throw handleError(__('messages.does_not_exist'), 404);

            await this.prisma[this.model].update({ where: { id: model.id }, data: inputData});
            const result = await this.prisma[this.model].findFirst({where: {id}, select: this.search?.safeSelect || undefined});

            return ApiResponse.success(this.resource.make(result));
        } catch (error) {
            throw handleError(error)
        }
    }

    async delete(id: string): Promise<ApiResponseType<any>> {
        try {
            await this.baseFilters();            
                        
            const model = await this.search.findFirst({where: {id}});                        

            if (!model) throw handleError(__('messages.does_not_exist'), 404);
            await this.prisma[this.model].softDelete({ id: model.id });

            return ApiResponse.success(undefined);
        } catch (error) {
            throw handleError(error)
        }
    }

    async restore(id: string): Promise<ApiResponseType<any>> {
        try {
            await this.baseFilters();
            const model = await this.search.findFirst({where: {id, is_deleted: true}});
            
            if (!model) throw handleError(__('messages.does_not_exist'), 404);            
            await this.prisma[this.model].update({ where: { is_deleted: true, id: model.id }, data: { is_deleted: false } });
            
            const result = await this.prisma[this.model].findFirst({where: {id}});
            return ApiResponse.success(result);
        } catch (error) {
            throw handleError(error)
        }
    }

    protected async validateDto(data: any, type: 'update' | 'create', dto: ClassConstructor<any>| null = null): Promise<any>
    {
        let inputData = data || {};
        if (this.dtoClass) {
            const dtoInstance = plainToInstance(dto ? dto : this.dtoClass, inputData);
            const errors = await validate(dtoInstance);

            if (errors.length > 0) {
                throw handleError(errors)
            }
            inputData = await dtoInstance.toCreate(ToPrismaTypeEnum[type])
        }

        return inputData;
    }
}
