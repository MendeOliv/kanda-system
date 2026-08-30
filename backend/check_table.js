require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('./node_modules/@prisma/client');
async function main() {
  const prisma = new PrismaClient();
  try {
    // Check if table exists
    const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ProcessedMessage'`;
    // The result is an array of objects, e.g., [ { table_name: 'ProcessedMessage' } ]
    if (Array.isArray(result) && result.length > 0) {
      console.log('Table already exists.');
    } else {
      console.log('Creating ProcessedMessage table...');
      await prisma.$executeRaw`CREATE TABLE "ProcessedMessage" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "externalMessageId" TEXT UNIQUE NOT NULL,
        "userId" TEXT NOT NULL,
        "processedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
      await prisma.$executeRaw`CREATE INDEX "ProcessedMessage_externalMessageId_key" ON "ProcessedMessage"("externalMessageId")`;
      await prisma.$executeRaw`CREATE INDEX "ProcessedMessage_userId_idx" ON "ProcessedMessage"("userId")`;
      console.log('Table created.');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(e => { console.error(e); process.exit(1); });