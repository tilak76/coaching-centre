const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@coaching.com'
  const newPassword = 'Examcracker@2025'
  
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      email,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })
  
  console.log(`Updated admin password for ${user.email}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
