const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const batches = [
    'apssb',
    'class 6',
    'class 7',
    'class 8',
    'class 9',
    'class 10',
    'class 11',
    'class 12'
  ]

  console.log('Adding batches to the live database...')
  for (const name of batches) {
    await prisma.batch.create({
      data: { name }
    })
    console.log(`Added batch: ${name}`)
  }
  console.log('All batches added successfully!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
