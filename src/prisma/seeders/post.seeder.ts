import { Prisma } from "@generated/prisma";
import { PrismaClient } from "@prisma/client/extension";
import { BaseSeeder } from "@src/base/seeder/seeder.base";

export class PostSeeder extends BaseSeeder
{
    modelName: string = Prisma.ModelName.Post;

    async seed(prisma: PrismaClient): Promise<void> {
        // Resolve a real user UUID — primary keys are UUIDs since the migration.
        const user = await prisma.user.findFirst({ select: { id: true } });
        if (!user) {
            console.warn('PostSeeder: no users found, skipping post seed.');
            return;
        }

        const data: Prisma.PostCreateManyInput[] = [
            {
                title: "this is the test post",
                content: "about this post....",
                user_id: user.id
            },
            {
                title: "this is another test post",
                content: "about this post....",
                user_id: user.id
            }
        ];

        for (const item of data) {
            await prisma.brand.create({ data: item });
        }
    }
}
