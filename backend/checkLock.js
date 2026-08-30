const { PrismaClient } = require('./node_modules/@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('Connected to database');
    try {
      const count = await prisma.conversationLock.count();
      console.log('ConversationLock count:', count);
    } catch (e) {
      console.error('Error querying ConversationLock:', e.message);
      // If the table doesn't exist, we might get a P2025
      if (e.code === 'P2025') {
        console.log('ConversationLock table does not exist.');
      }
    }
  } catch (e) {
    console.error('Connection error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();