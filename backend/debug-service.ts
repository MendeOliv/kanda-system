import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { PrismaService } from './src/prisma/prisma.service';
import { ProductsService } from './src/products/products.service';

async function testServiceSearch() {
  const prisma = new PrismaService();
  const service = new ProductsService(prisma);
  try {
    await prisma.$connect();
    
    // Test the search method directly
    console.log('Testing search method...');
    const results = await service.search('Categoria Padrão');
    console.log('Search results for "Categoria Padrão":', results.length);
    console.log('Results:', JSON.stringify(results, null, 2));
    
    // Also test with a product name
    const productResults = await service.search('Produto A1');
    console.log('Search results for "Produto A1":', productResults.length);
    console.log('Results:', JSON.stringify(productResults, null, 2));
    
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
testServiceSearch();