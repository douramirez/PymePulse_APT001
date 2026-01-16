import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // 1) Crear organización
  const org = await prisma.organization.create({
    data: { name: "Pyme Demo" },
  });

  // 2) Crear usuario dueño
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Dueño Demo",
      email: "dueno@demo.cl",
      passwordHash,
      role: Role.OWNER,
    },
  });

  // 3) Categorías base
  await prisma.expenseCategory.createMany({
    data: [
      { organizationId: org.id, name: "Arriendo" },
      { organizationId: org.id, name: "Servicios" },
      { organizationId: org.id, name: "Insumos" },
      { organizationId: org.id, name: "Transporte" },
    ],
  });

  console.log("✅ Seed listo:", { orgId: org.id, user: "dueno@demo.cl / Admin123!" });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
