import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing brand filtering...')

  // Get all brands
  const brands = await prisma.brand.findMany()
  console.log('Brands:', brands.map(b => ({ id: b.id, name: b.name })))

  if (brands.length === 0) {
    console.error('No brands found')
    return
  }

  const brandA = brands.find(b => b.name === 'Marca A')
  const brandB = brands.find(b => b.name === 'Marca B')

  if (!brandA || !brandB) {
    console.error('Expected brands Marca A and Marca B not found')
    return
  }

  // Test single brandId filter
  const productsA = await prisma.product.findMany({
    where: { brandId: brandA.id },
    include: { brand: true },
  })
  console.log(`Products for brand ${brandA.name}:`, productsA.map(p => ({ id: p.id, name: p.name, brand: p.brand?.name })))

  // Test multiple brandIds filter
  const productsAB = await prisma.product.findMany({
    where: { brandId: { in: [brandA.id, brandB.id] } },
    include: { brand: true },
  })
  console.log(`Products for brands ${brandA.name} OR ${brandB.name}:`, productsAB.map(p => ({ id: p.id, name: p.name, brand: p.brand?.name })))

  // Ensure we have a category
  const category = await prisma.category.findFirst()
  if (!category) {
    console.error('No category found')
    return
  }

  // Test category + brandIds filter
  const productsCatAB = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      brandId: { in: [brandA.id, brandB.id] }
    },
    include: { brand: true, category: true },
  })
  console.log(`Products in category ${category.name} and brands ${brandA.name} OR ${brandB.name}:`, productsCatAB.map(p => ({ id: p.id, name: p.name, brand: p.brand?.name, category: p.category?.name })))

  // Test pagination with brand filter
  const page1 = await prisma.product.findMany({
    where: { brandId: brandA.id },
    take: 1,
    skip: 0,
    orderBy: { createdAt: 'desc' },
    include: { brand: true },
  })
  console.log(`First page (limit 1) for brand ${brandA.name}:`, page1.map(p => ({ id: p.id, name: p.name })))

  const page2 = await prisma.product.findMany({
    where: { brandId: brandA.id },
    take: 1,
    skip: 1,
    orderBy: { createdAt: 'desc' },
    include: { brand: true },
  })
  console.log(`Second page (limit 1, offset 1) for brand ${brandA.name}:`, page2.map(p => ({ id: p.id, name: p.name })))

  console.log('All tests passed.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })