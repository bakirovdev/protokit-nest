import { Body, Delete, Get, Param, Post, Put, Query, Type, UploadedFile } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger";
import { BaseService } from "../services/base.service";
import { ApiResponseType, PGResponseType } from "@src/helpers";

export function BaseController<T>(createDto: Type<T>) {
  class BaseControllerHost {
    constructor(
      public readonly service: BaseService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get all items' })
    async index(@Query() filter:any): Promise<PGResponseType<any>> {
      return this.service.findAll(filter);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get item by ID' })
    @ApiParam({ name: 'id', type: 'number' })
    async show(@Param('id') id: number): Promise<ApiResponseType<any>> {
      return this.service.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create new item' })
    @ApiBody({ type: createDto })
    async store(
      @UploadedFile() file: Express.Multer.File,
      @Body() data: T
    ): Promise<ApiResponseType<any>> 
    {
      return this.service.store(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update item' })
    @ApiParam({ name: 'id', type: 'number' })
    @ApiBody({ type: createDto })
    async update(
      @UploadedFile() file: Express.Multer.File,
      @Param('id') id: number|string,
      @Body() data: T
    ): Promise<ApiResponseType<any>> 
    {
      return this.service.update(+id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete item' })
    @ApiParam({ name: 'id', type: 'number' })
    async delete(@Param('id') id: number): Promise<ApiResponseType<any>> {
      return this.service.delete(id);
    }

    @Delete(':id/restore')
    @ApiOperation({ summary: 'Delete item' })
    @ApiParam({ name: 'id', type: 'number' })
    async restore(@Param('id') id: number): Promise<ApiResponseType<any>> {
      return this.service.restore(id);
    }
  }

  return BaseControllerHost;
}