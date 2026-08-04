import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Alimentares', slug: 'alimentares', sortOrder: 1 },
  { name: 'Bebidas', slug: 'bebidas', sortOrder: 2 },
  { name: 'Higiene', slug: 'higiene', sortOrder: 3 },
  { name: 'Produtos de Casa', slug: 'produtos-de-casa', sortOrder: 4 },
];

const products: { sku: string; name: string; description: string; price: number; stock: number; categorySlug: string }[] = [
  { sku: 'AL-001', name: 'Arroz Sol 25kg', description: 'Arroz agulha 25kg', price: 18500, stock: 25, categorySlug: 'alimentares' },
  { sku: 'AL-002', name: 'Óleo Fula 5L', description: 'Óleo alimentar 5 litros', price: 9500, stock: 30, categorySlug: 'alimentares' },
  { sku: 'AL-003', name: 'Feijão Macote 1kg', description: 'Feijão macote 1kg', price: 1200, stock: 40, categorySlug: 'alimentares' },
  { sku: 'AL-004', name: 'Massa Espaguete 500g', description: 'Massa espaguete 500g', price: 850, stock: 35, categorySlug: 'alimentares' },
  { sku: 'AL-005', name: 'Farinha Trigo 1kg', description: 'Farinha de trigo 1kg', price: 650, stock: 40, categorySlug: 'alimentares' },
  { sku: 'AL-006', name: 'Açúcar Açucareira 1kg', description: 'Açúcar refinado 1kg', price: 950, stock: 50, categorySlug: 'alimentares' },
  { sku: 'AL-007', name: 'Café Puro 250g', description: 'Café torrado 250g', price: 1200, stock: 20, categorySlug: 'alimentares' },
  { sku: 'AL-008', name: 'Leite Líquido 1L', description: 'Leite UHT 1 litro', price: 750, stock: 30, categorySlug: 'alimentares' },
  { sku: 'AL-009', name: 'Ovos (Dúzia)', description: 'Ovos frescos dúzia', price: 1800, stock: 20, categorySlug: 'alimentares' },
  { sku: 'BE-001', name: 'Água Mineral 5L', description: 'Garrafão água 5L', price: 1200, stock: 30, categorySlug: 'bebidas' },
  { sku: 'BE-002', name: 'Água Mineral 1.5L', description: 'Garrafa água 1.5L', price: 450, stock: 50, categorySlug: 'bebidas' },
  { sku: 'BE-003', name: 'Coca-Cola 2L', description: 'Refrigerante Coca-Cola 2L', price: 950, stock: 35, categorySlug: 'bebidas' },
  { sku: 'BE-004', name: 'Fanta 2L', description: 'Refrigerante Fanta 2L', price: 900, stock: 30, categorySlug: 'bebidas' },
  { sku: 'BE-005', name: 'Sumo Tang 25g', description: 'Sumo em pó sabores', price: 250, stock: 60, categorySlug: 'bebidas' },
  { sku: 'BE-006', name: 'Gelo em Saco 5kg', description: 'Saco de gelo 5kg', price: 800, stock: 15, categorySlug: 'bebidas' },
  { sku: 'HI-001', name: 'Sabonete Dove 90g', description: 'Sabonete Dove original', price: 750, stock: 40, categorySlug: 'higiene' },
  { sku: 'HI-002', name: 'Pasta Colgate 100g', description: 'Pasta dental Colgate', price: 950, stock: 35, categorySlug: 'higiene' },
  { sku: 'HI-003', name: 'Detergente OMO 1kg', description: 'Detergente em pó OMO', price: 2200, stock: 25, categorySlug: 'higiene' },
  { sku: 'HI-004', name: 'Lixívia CIF 1L', description: 'Lixívia CIF 1 litro', price: 850, stock: 30, categorySlug: 'higiene' },
  { sku: 'HI-005', name: 'Papel Higiénico Neve', description: 'Papel higiénico rolo', price: 450, stock: 60, categorySlug: 'higiene' },
  { sku: 'HI-006', name: 'Amaciador Confort 2L', description: 'Amaciador Confort 2 litros', price: 1850, stock: 20, categorySlug: 'higiene' },
  { sku: 'CA-001', name: 'Pilhas AA (2 unid)', description: 'Pilhas alcalinas AA', price: 650, stock: 40, categorySlug: 'produtos-de-casa' },
  { sku: 'CA-002', name: 'Pilhas AAA (2 unid)', description: 'Pilhas alcalinas AAA', price: 650, stock: 40, categorySlug: 'produtos-de-casa' },
  { sku: 'CA-003', name: 'Velas Brancas (6 unid)', description: 'Velas brancas 6 unidades', price: 500, stock: 30, categorySlug: 'produtos-de-casa' },
  { sku: 'CA-004', name: 'Vela de Arrumação', description: 'Vela em copo vidro', price: 350, stock: 25, categorySlug: 'produtos-de-casa' },
  { sku: 'CA-005', name: 'Fósforo (caixa)', description: 'Caixa de fósforos', price: 150, stock: 50, categorySlug: 'produtos-de-casa' },
  { sku: 'CA-006', name: 'Esponja de Limpeza', description: 'Esponja multiuso', price: 280, stock: 45, categorySlug: 'produtos-de-casa' },
];

async function main() {
  console.log('🌱 Seeding Kanda catalog...\n');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.aiContext.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.deliveryZone.deleteMany();
  await prisma.user.deleteMany();

  // DeliveryZones
  await prisma.deliveryZone.create({ data: { name: 'KK5000', fee: 700, minOrderValue: 0, active: true } });
  console.log('  ✅ DeliveryZone: KK5000 (700 Kz)');
  await prisma.deliveryZone.create({ data: { name: 'Kilamba', fee: 500, minOrderValue: 0, active: true } });
  console.log('  ✅ DeliveryZone: Kilamba (500 Kz)');

  for (const cat of categories) {
    await prisma.category.create({ data: { name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder } });
    console.log(`  ✅ Category: ${cat.name}`);
  }

  const dbCategories = await prisma.category.findMany();
  const slugToId: Record<string, string> = {};
  for (const c of dbCategories) { slugToId[c.slug] = c.id; }

  let count = 0;
  for (const p of products) {
    const categoryId = slugToId[p.categorySlug];
    if (!categoryId) { console.warn(`  ⚠️ No category for '${p.categorySlug}', skipping ${p.sku}`); continue; }
    const imageUrl = `https://placehold.co/400x400/FFF/333?text=${encodeURIComponent(p.name.split(' ')[0])}`;
    await prisma.product.create({
      data: {
        name: p.name, sku: p.sku, description: p.description, price: p.price,
        stock: p.stock, categoryId, imageUrl, status: 'ACTIVE',
      },
    });
    count++;
    console.log(`  ✅ ${p.sku} - ${p.name} (${p.price.toLocaleString()} Kz)`);
  }

  // Create a test user for API tests
  const testUser = await prisma.user.create({
    data: {
      firebaseUid: 'test-user-firebase-uid',
      phone: '+244900000000',
      firstName: 'Kairós',
      role: 'USER',
      status: 'active',
    },
  });
  console.log(`\n  ✅ Test user: ${testUser.firstName} (${testUser.phone})`);

  console.log(`\n🎉 Seed complete! ${count} products, ${categories.length} categories, 2 zones, 1 user.\n`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());