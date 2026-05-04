const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envMatch = envFile.match(/^DATABASE_URL=["']?(.+?)["']?$/m);
    if (envMatch) process.env.DATABASE_URL = envMatch[1];
  }
}

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.student.count();
  console.log(`Total students in database: ${count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
