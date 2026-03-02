import { Prisma } from "@prisma/client";


export type PrismaModels = (typeof Prisma.ModelName)[keyof typeof Prisma.ModelName];