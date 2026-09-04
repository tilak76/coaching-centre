const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const classes = [
    'APSSB',
    'CLASS 5',
    'CLASS 6',
    'CLASS 7',
    'CLASS 8',
    'CLASS 9',
    'CLASS 10',
    'CLASS 11',
    'CLASS 12'
  ]

  for (const name of classes) {
    // Check if it exists
    const existing = await prisma.batch.findFirst({ where: { name } })
    if (!existing) {
      await prisma.batch.create({ data: { name } })
      console.log(`Created course: ${name}`)
    } else {
      console.log(`Course ${name} already exists.`)
    }
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
