import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$connect();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    console.log('Product count:', productCount);
    console.log('Category count:', categoryCount);
    const products = await prisma.product.findMany({ take: 5, include: { category: true } });
    console.log('First 5 products:', JSON.stringify(products, null, 2));
    const categories = await prisma.category.findMany({ take: 5 });
    console.log('First 5 categories:', JSON.stringify(categories, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();