import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Ensure a default category exists
  const categoryName = 'Categoria Padrão'
  const categorySlug = 'categoria-padrao'
  const category = await prisma.category.upsert({
    where: { slug: categorySlug },
    update: { name: categoryName, isActive: true },
    create: { name: categoryName, slug: categorySlug, isActive: true },
  })
  console.log(`Category ${categoryName} ensured with id: ${category.id}`)

  // Define initial brands (these will be used for products)
  const brandNames = ['Marca A', 'Marca B', 'Marca C']

  for (const name of brandNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    await prisma.brand.upsert({
      where: { slug },
      update: { name, active: true },
      create: { name, slug, active: true },
    })
    console.log(`Brand ${name} ensured`)
  }

  // Fetch all brands to get their IDs
  const brands = await prisma.brand.findMany({
    select: { id: true, name: true },
  })
  console.log('Brands fetched:', brands.map(b => ({ id: b.id, name: b.name })))

  // Define initial products per brand
  const productsToCreate = [
    // Brand A
    {
      name: 'Produto A1',
      sku: 'PROD-A1-001',
      price: 100,
      stock: 10,
      brandName: 'Marca A',
    },
    {
      name: 'Produto A2',
      sku: 'PROD-A2-001',
      price: 150,
      stock: 5,
      brandName: 'Marca A',
    },
    // Brand B
    {
      name: 'Produto B1',
      sku: 'PROD-B1-001',
      price: 200,
      stock: 20,
      brandName: 'Marca B',
    },
    {
      name: 'Produto B2',
      sku: 'PROD-B2-001',
      price: 250,
      stock: 15,
      brandName: 'Marca B',
    },
    // Brand C (no products, just to show brand without products)
  ]

  for (const productData of productsToCreate) {
    const brand = brands.find(b => b.name === productData.brandName)
    if (!brand) {
      console.error(`Brand ${productData.brandName} not found`)
      continue
    }
    await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {
        name: productData.name,
        price: productData.price,
        stock: productData.stock,
        categoryId: category.id,
        brandId: brand.id,
      },
      create: {
        name: productData.name,
        sku: productData.sku,
        categoryId: category.id,
        price: productData.price,
        stock: productData.stock,
        brandId: brand.id,
        description: '',
        imageUrl: '',
        status: 'active',
      },
    })
    console.log(`Product ${productData.name} ensured for brand ${brand.name}`)
  }

  console.log('Seed finished.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })