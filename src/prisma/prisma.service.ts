import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as type from "@src/prisma/types";
import { softDeleteExtension, softDeleteModels } from './extensions/prisma-soft-delte.extension';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    super({ adapter: pool });
    return this.$extends(softDeleteExtension(this)) as this;
  }
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  // Helper methods for explicit soft delete operations
  async softDelete(model: type.PrismaModels, where: any) {
    if (softDeleteModels.has(model)) {
      return this[model].update({
        where,
        data: { is_deleted: true },
      });
    }
    return (this[model] as any).delete({
      where,
    });
  }

  async restore(model: type.PrismaModels, where: any) {
    return this[model].update({
      where: { ...where, is_deleted: true },
      data: { is_deleted: false },
    });
  }

  async forceDelete(model: type.PrismaModels, where: any) {
    return this.$executeRaw`DELETE FROM ${model} WHERE id = ${where.id}`;
  }

  async findAllWithDeleted(model: type.PrismaModels, args: any = {}) {
    // Create a temporary client without extensions
    const tempClient = new PrismaClient();
    try {
      return await (tempClient[model] as any).findMany(args);
    } finally {
      await tempClient.$disconnect();
    }
  }

  async findOnlyDeleted(model: type.PrismaModels, args: any = {}) {
    return (this[model] as any).findMany({
      ...args,
      where: {
        ...args.where,
        is_deleted: false,
      },
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

