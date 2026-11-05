import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@arsalandev.studio").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMeAdmin123!";
  const name = process.env.ADMIN_NAME || "Arsalan Arshad";

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      name,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
    create: {
      email,
      name,
      passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log("Admin ready:", { id: admin.id, email: admin.email, role: admin.role });
  console.log("Login password:", password === "ChangeMeAdmin123!" ? "(default — change it)" : "(from ADMIN_PASSWORD)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
