const { PrismaClient } = require('./node_modules/@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  console.log(Object.keys(prisma).filter(k => k.endsWith('Lock') || k.includes('Lock')));
  // Check if conversationLock is a property
  if (prisma.conversationLock) {
    console.log('conversationLock property exists');
  } else {
    console.log('conversationLock property does NOT exist');
    // Let's see what properties are available under prisma
    const props = Object.getOwnPropertyNames(prisma);
    console.log('Available properties:', props.filter(p => typeof prisma[p] === 'object' && prisma[p] !== null));
  }
}

main().catch(console.error);