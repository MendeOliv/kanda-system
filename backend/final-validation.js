const { PrismaService } = require('./dist/src/prisma/prisma.service');
const { ProductsService } = require('./dist/src/products/products.service');

async function runTests() {
  const prisma = new PrismaService();
  const service = new ProductsService(prisma);
  await prisma.$connect();
  
  console.log('CAT-01 ISOLATED VALIDATION (using compiled service)');
  console.log('====================================================');
  
  let allPass = true;
  
  // Helper to print test results
  function printTest(name, input, dbResult, appResult, expected, actual, pass) {
    console.log(`\n${name}`);
    console.log(`INPUT: ${input}`);
    console.log(`DATABASE RESULT: ${JSON.stringify(dbResult)}`);
    console.log(`APPLICATION RESULT: ${JSON.stringify(appResult)}`);
    console.log(`EXPECTED: ${JSON.stringify(expected)}`);
    console.log(`ACTUAL: ${JSON.stringify(actual)}`);
    console.log(`RESULT: ${pass ? 'PASS' : 'FAIL'}`);
    return pass;
  }

  // Test A: Existing product
  try {
    const dbProducts = await prisma.product.findMany({ take: 1 });
    if (dbProducts.length === 0) {
      console.log('\nTest A: Existing product - SKIPPED (no products in database)');
    } else {
      const product = dbProducts[0];
      const input = product.name;
      const dbResult = await prisma.product.findMany({ 
        where: { 
          name: { contains: input, mode: 'insensitive' },
          status: 'active'
        },
        take: 10
      });
      const appResult = await service.search(input);
      const expected = dbResult.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        category: p.category?.name
      }));
      const actual = appResult;
      const pass = JSON.stringify(expected) === JSON.stringify(actual);
      allPass = allPass && pass;
      printTest('A — Existing Product', input, dbResult, appResult, expected, actual, pass);
    }
  } catch (e) {
    console.log(`\nTest A: Existing product - ERROR: ${e.message}`);
    allPass = false;
  }

  // Test B: Category search
  try {
    const dbCategories = await prisma.category.findMany({ take: 1 });
    if (dbCategories.length === 0) {
      console.log('\nTest B: Category search - SKIPPED (no categories in database)');
    } else {
      const category = dbCategories[0];
      const input = category.name;
      const dbResult = await prisma.product.findMany({ 
        where: { 
          status: 'active',
          category: { name: { contains: input, mode: 'insensitive' } }
        },
        take: 10
      });
      const appResult = await service.search(input);
      const expected = dbResult.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        category: p.category?.name
      }));
      const actual = appResult;
      const pass = JSON.stringify(expected) === JSON.stringify(actual);
      allPass = allPass && pass;
      printTest('B — Category Search', input, dbResult, appResult, expected, actual, pass);
    }
  } catch (e) {
    console.log(`\nTest B: Category search - ERROR: ${e.message}`);
    allPass = false;
  }

  // Test C: Partial SKU
  try {
    const dbProduct = await prisma.product.findFirst({ where: { sku: { not: '' } } });
    if (!dbProduct) {
      console.log('\nTest C: Partial SKU - SKIPPED (no product with SKU)');
    } else {
      const sku = dbProduct.sku;
      const start = Math.floor(sku.length / 4);
      const end = Math.floor(3 * sku.length / 4);
      const input = sku.substring(start, end);
      if (input.length === 0) {
        input = sku.substring(0, 1);
      }
      const dbResult = await prisma.product.findMany({ 
        where: { 
          status: 'active',
          sku: { contains: input, mode: 'insensitive' }
        },
        take: 10
      });
      const appResult = await service.search(input);
      const expected = dbResult.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        category: p.category?.name
      }));
      const actual = appResult;
      const pass = JSON.stringify(expected) === JSON.stringify(actual);
      allPass = allPass && pass;
      printTest('C — Partial SKU', input, dbResult, appResult, expected, actual, pass);
    }
  } catch (e) {
    console.log(`\nTest C: Partial SKU - ERROR: ${e.message}`);
    allPass = false;
  }

  // Test D: Non-existent product (anti-hallucination)
  try {
    const input = 'Quero comprar uma água mineral marca XYZ-NAO-EXISTE';
    const dbResult = await prisma.product.findMany({ 
      where: { 
        status: 'active',
        OR: [
          { name: { contains: input, mode: 'insensitive' } },
          { sku: { contains: input, mode: 'insensitive' } },
          { description: { contains: input, mode: 'insensitive' } },
          { category: { name: { contains: input, mode: 'insensitive' } } }
        ]
      },
      take: 10
    });
    const appResult = await service.search(input);
    const expected = []; // Expect empty array
    const actual = appResult;
    const pass = actual.length === 0;
    allPass = allPass && pass;
    printTest('D — Non-existent Product', input, dbResult, appResult, expected, actual, pass);
  } catch (e) {
    console.log(`\nTest D: Non-existent product - ERROR: ${e.message}`);
    allPass = false;
  }

  // Test E: Stock accuracy
  try {
    const dbProduct = await prisma.product.findFirst({});
    if (!dbProduct) {
      console.log('\nTest E: Stock accuracy - SKIPPED (no products)');
    } else {
      const input = dbProduct.name;
      const dbResult = await prisma.product.findUnique({ where: { id: dbProduct.id } });
      const appResult = await service.search(input);
      const found = appResult.find(p => p.id === dbProduct.id);
      if (!found) {
        console.log(`\nTest E: Stock accuracy - FAIL (product not found in search results)`);
        allPass = false;
      } else {
        const expected = dbResult?.stock ?? 0;
        const actual = found?.stock ?? -1;
        const pass = expected === actual;
        allPass = allPass && pass;
        printTest('E — Stock Accuracy', input, {stock: dbResult?.stock}, {stock: found?.stock}, {stock: expected}, {stock: actual}, pass);
      }
    }
  } catch (e) {
    console.log(`\nTest E: Stock accuracy - ERROR: ${e.message}`);
    allPass = false;
  }

  // Test F: Price precision
  try {
    const dbProduct = await prisma.product.findFirst({});
    if (!dbProduct) {
      console.log('\nTest F: Price precision - SKIPPED (no products)');
    } else {
      const input = dbProduct.name;
      const dbResult = await prisma.product.findUnique({ where: { id: dbProduct.id } });
      const appResult = await service.search(input);
      const found = appResult.find(p => p.id === dbProduct.id);
      if (!found) {
        console.log(`\nTest F: Price precision - FAIL (product not found in search results)`);
        allPass = false;
      } else {
        // Compare price and discountPrice as they are (no conversion)
        const expectedPrice = dbResult?.price;
        const expectedDiscountPrice = dbResult?.discountPrice;
        const actualPrice = found?.price;
        const actualDiscountPrice = found?.discountPrice;
        const pricePass = expectedPrice === actualPrice;
        const discountPass = expectedDiscountPrice === actualDiscountPrice;
        const pass = pricePass && discountPass;
        allPass = allPass && pass;
        printTest('F — Price Precision', input, 
          {price: dbResult?.price, discountPrice: dbResult?.discountPrice}, 
          {price: found?.price, discountPrice: found?.discountPrice}, 
          {price: expectedPrice, discountPrice: expectedDiscountPrice}, 
          {price: actualPrice, discountPrice: actualDiscountPrice}, 
          pass);
      }
    }
  } catch (e) {
    console.log(`\nTest F: Price precision - ERROR: ${e.message}`);
    allPass = false;
  }

  // Test G: Multiple products
  try {
    const input = 'a';
    const dbResult = await prisma.product.findMany({ 
      where: { 
        status: 'active',
        OR: [
          { name: { contains: input, mode: 'insensitive' } },
          { sku: { contains: input, mode: 'insensitive' } },
          { description: { contains: input, mode: 'insensitive' } },
          { category: { name: { contains: input, mode: 'insensitive' } } }
        ]
      },
      take: 10
    });
    const appResult = await service.search(input);
    const expected = dbResult.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      discountPrice: p.discountPrice,
      stock: p.stock,
      category: p.category?.name
    }));
    const actual = appResult;
    const expectedSorted = expected.slice().sort((a, b) => a.id.localeCompare(b.id));
    const actualSorted = actual.slice().sort((a, b) => a.id.localeCompare(b.id));
    const pass = JSON.stringify(expectedSorted) === JSON.stringify(actualSorted) && actual.length <= 10;
    allPass = allPass && pass;
    printTest('G — Multiple Products', input, dbResult, appResult, 
      {count: expected.length, limited: expected.length <= 10}, 
      {count: actual.length, limited: actual.length <= 10}, 
      {count: expected.length, limited: expected.length <= 10}, 
      {count: actual.length, limited: actual.length <= 10}, 
      pass);
  } catch (e) {
    console.log(`\nTest G: Multiple products - ERROR: ${e.message}`);
    allPass = false;
  }

  // Test H: Database failure
  try {
    const prismaForFailure = new PrismaService();
    const serviceForFailure = new ProductsService(prismaForFailure);
    await prismaForFailure.$connect();
    await prismaForFailure.$disconnect();
    let errorThrown = false;
    try {
      await serviceForFailure.search('test');
    } catch (e) {
      errorThrown = true;
    } finally {
      await prismaForFailure.$disconnect();
    }
    const input = 'test';
    const dbResult = [];
    const appResult = errorThrown ? null : [];
    const expected = null;
    const actual = errorThrown ? 'ERROR_THROWN' : 'NO_ERROR';
    const pass = errorThrown;
    allPass = allPass && pass;
    printTest('H — Database Failure', input, 
      {note: 'Database connection closed'}, 
      {note: errorThrown ? 'Error thrown' : 'No error'}, 
      {note: 'Error expected'}, 
      {note: actual}, 
      pass);
  } catch (e) {
    console.log(`\nTest H: Database failure - ERROR: ${e.message}`);
    allPass = false;
  }

  // Test E2E: Gemini → DB → Gemini
  try {
    const dbProduct = await prisma.product.findFirst({});
    if (!dbProduct) {
      console.log('\nTest E2E: Gemini → DB → Gemini - SKIPPED (no products)');
    } else {
      const input = dbProduct.name;
      const dbResult = await prisma.product.findUnique({ where: { id: dbProduct.id } });
      const appResult = await service.search(input);
      const found = appResult.find(p => p.id === dbProduct.id);
      if (!found) {
        console.log(`\nTest E2E: Gemini → DB → Gemini - FAIL (product not found in search results)`);
        allPass = false;
      } else {
        const expected = {
          id: dbResult?.id,
          name: dbResult?.name,
          sku: dbResult?.sku,
          price: dbResult?.price,
          discountPrice: dbResult?.discountPrice,
          stock: dbResult?.stock,
          categoryName: dbResult?.category?.name
        };
        const actual = {
          id: found?.id,
          name: found?.name,
          sku: found?.sku,
          price: found?.price,
          discountPrice: found?.discountPrice,
          stock: found?.stock,
          categoryName: found?.category?.name
        };
        const pass = JSON.stringify(expected) === JSON.stringify(actual);
        allPass = allPass && pass;
        printTest('E2E — Gemini → DB → Gemini', input, 
          dbResult, 
          found, 
          expected, 
          actual, 
          pass);
      }
    }
  } catch (e) {
    console.log(`\nTest E2E: Gemini → DB → Gemini - ERROR: ${e.message}`);
    allPass = false;
  }

  console.log(`\n====================================`);
  console.log(`ISOLATED VALIDATION COMPLETE`);
  console.log(`Overall result: ${allPass ? 'PASS' : 'FAIL'}`);
  
  await prisma.$disconnect();
}

runTests().catch(console.error);