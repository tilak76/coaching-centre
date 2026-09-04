const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const existingBatch = await prisma.batch.findFirst({
    where: { name: 'apssb' }
  })

  if (existingBatch) {
    await prisma.batch.update({
      where: { id: existingBatch.id },
      data: { name: 'APSSB EXAM' }
    })
    console.log('Renamed "apssb" to "APSSB EXAM"')
  } else {
    await prisma.batch.create({
      data: { name: 'APSSB EXAM' }
    })
    console.log('Created batch "APSSB EXAM"')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
