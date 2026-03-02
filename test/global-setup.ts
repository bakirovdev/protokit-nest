import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

export default async () => {  
  try {
    // Load test environment variables
    dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
    
    console.log('🔄 Running database migrations...');
    execSync('npx prisma db push --force-reset --accept-data-loss', { 
      stdio: 'inherit',
      env: process.env 
    });
    
    console.log('🌱 Seeding test database...');
    execSync('npm run seed', { 
      stdio: 'inherit',
      env: process.env 
    });
    
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
};