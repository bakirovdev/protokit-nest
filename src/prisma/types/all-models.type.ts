import { Prisma } from "@generated/prisma";


export type PrismaModels = (typeof Prisma.ModelName)[keyof typeof Prisma.ModelName];