import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const [brandsCount, productsCount, productsWithBrand, productsWithoutBrand] = await Promise.all([
    prisma.brand.count(),
    prisma.product.count(),
    prisma.product.count({ where: { brandId: { not: null } } }),
    prisma.product.count({ where: { brandId: null } }),
  ])
  
  console.log('Total Brands:', brandsCount)
  console.log('Total Products:', productsCount)
  console.log('Products with brandId:', productsWithBrand)
  console.log('Products without brandId:', productsWithoutBrand)
  
  // Also verify the relationship works
  const brandWithProducts = await prisma.brand.findFirst({
    include: { products: true },
  })
  
  if (brandWithProducts) {
    console.log(`Brand "${brandWithProducts.name}" has ${brandWithProducts.products.length} products`)
  }
  
  const productWithBrand = await prisma.product.findFirst({
    where: { brandId: { not: null } },
    include: { brand: true },
  })
  
  if (productWithBrand) {
    console.log(`Product "${productWithBrand.name}" belongs to brand "${productWithBrand.brand?.name}"`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })