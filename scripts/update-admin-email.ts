import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const NEW_EMAIL = "faiza.farook85@gmail.com";
const OLD_EMAILS = ["admin@theminiwear.com", "faiza.farook85@gmail.com"];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
      email: { in: OLD_EMAILS },
    },
  });

  if (!admin) {
    const anyAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!anyAdmin) {
      throw new Error("No ADMIN user found in the database.");
    }

    if (anyAdmin.email === NEW_EMAIL) {
      console.log(`Admin email is already ${NEW_EMAIL}`);
      return;
    }

    await prisma.user.update({
      where: { id: anyAdmin.id },
      data: { email: NEW_EMAIL },
    });
    console.log(`Updated admin email from ${anyAdmin.email} to ${NEW_EMAIL}`);
    return;
  }

  if (admin.email === NEW_EMAIL) {
    console.log(`Admin email is already ${NEW_EMAIL}`);
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { email: NEW_EMAIL },
  });

  console.log(`Updated admin email from ${admin.email} to ${NEW_EMAIL}`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
