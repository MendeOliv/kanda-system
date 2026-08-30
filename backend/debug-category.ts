import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { PrismaClient } from '@prisma/client';

async function testDirect() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    
    // Test 1: Find the category
    const category = await prisma.category.findFirst({
      where: { name: 'Categoria Padrão' }
    });
    console.log('Category found:', category);
    
    // Test 2: Find products by category ID
    const productsById = await prisma.product.findMany({
      where: {
        status: 'active',
        categoryId: category?.id
      },
      include: { category: true }
    });
    console.log('Products by category ID:', productsById.length);
    
    // Test 3: Find products by category name (using relation)
    const productsByName = await prisma.product.findMany({
      where: {
        status: 'active',
        category: {
          name: {
            contains: 'Categoria Padrão',
            mode: 'insensitive'
          }
        }
      },
      include: { category: true }
    });
    console.log('Products by category name (relation):', productsByName.length);
    
    // Test 4: Search using our service method
    const { ProductsService } = require('./src/products/products.service');
    const service = new ProductsService(prisma);
    const searchResults = await service.search('Categoria Padrão');
    console.log('Service search results:', searchResults.length);
    
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
testDirect();