import { PrismaClient, Prisma } from '@prisma/client';

export abstract class BaseSeeder {
    abstract modelName: string;

    async process(prisma: PrismaClient): Promise<void> {
        console.log(this.modelName + 's is being seeded...');
        await this.truncate(prisma);
        await this.seed(prisma);
        console.log(this.modelName + 's Seeded');

    }

    async truncate(prisma: PrismaClient): Promise<void> {
        const tableName = Prisma.dmmf.datamodel.models.find(
            model => model.name === this.modelName
        )?.dbName || this.modelName;

        const result = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
            `SELECT COUNT(*) as count FROM "${tableName}"`
        );

        const count = Number(result[0].count);

        if (count > 0) {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
        } else {
            console.log(`${tableName} is already empty, skipping truncate`);
        }
    }

    abstract seed(prisma: PrismaClient): Promise<void>;
}