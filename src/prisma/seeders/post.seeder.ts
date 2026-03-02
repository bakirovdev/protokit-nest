import { Prisma } from "@generated/prisma";
import { PrismaClient } from "@prisma/client/extension";
import { BaseSeeder } from "@src/base/seeder/seeder.base";

export class PostSeeder extends BaseSeeder
{
    modelName: string = Prisma.ModelName.Post;
    
    async seed(prisma: PrismaClient): Promise<void> {        

        const data: Prisma.PostCreateManyInput[] = [
            {
                title: "this is the test post",
                content: "about this post....",
                user_id: 1
            },
            {
                title: "this is the test post",
                content: "about this post....",
                user_id: 2
            }
        ];

        for (const item of data) {
            await prisma.brand.create({ data: item });
        }        
    }
}