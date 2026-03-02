import * as dotenv from 'dotenv';
dotenv.config();

import { UserSeeder } from './user.seeder';
import { PostSeeder } from './post.seeder';
import { PrismaClient } from '@generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();
const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

const seeders = [
    UserSeeder,
    PostSeeder,
];

export async function runSeed() {
    try {
        console.log('Seeding...');

        for (const SeederClass of seeders) {
            const seeder = new SeederClass();            
            await seeder.process(prisma);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('Seeding Done !!!');
    } catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

runSeed().catch((e) => console.error(e));