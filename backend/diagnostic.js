const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected');
    // Try to get a count of ConversationLock to see if the table exists
    try {
      const count = await prisma.conversationLock.count();
      console.log(`ConversationLock count: ${count}`);
    } catch (e) {
      if (e.code === 'P2025') {
        console.log('ConversationLock table does not exist (yet)');
      } else {
        console.error('Error querying ConversationLock:', e.message);
      }
    }
  } catch (e) {
    console.error('Connection error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();