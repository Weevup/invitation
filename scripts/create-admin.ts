import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@weevup.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.ADMIN_NAME || 'Admin Weevup'

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    console.log(`✅ Admin user already exists: ${email}`)
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log(`✅ Admin user created successfully!`)
  console.log(`📧 Email: ${email}`)
  console.log(`🔑 Password: ${password}`)
  console.log(`⚠️  Please change the password after first login`)
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
