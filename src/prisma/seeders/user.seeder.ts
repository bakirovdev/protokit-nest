import { PrismaClient } from "@prisma/client/extension";
import { BaseSeeder } from "@base/seeder/seeder.base";
import * as bcrypt from 'bcrypt';
import { Prisma } from "@generated/prisma";

export class UserSeeder extends BaseSeeder 
{
    modelName = Prisma.ModelName.User;
    
    async seed(prisma: PrismaClient): Promise<void> {

        const hashedPassword = await bcrypt.hash('test123', 12);

        const data: Prisma.UserCreateInput[] = [
            {
                email: 'protokit@example.com',
                password: hashedPassword,
                full_name: 'John Dou'
            },
        ];

        for (const user of data) {
            await prisma.user.create({ data: user });
        }        
    }
}