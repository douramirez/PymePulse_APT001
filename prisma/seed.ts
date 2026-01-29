import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const seedEmail = "dueno@demo.cl";
  const seedPass = "Admin123!";

  // 1) Usar organización existente si el usuario ya está creado
  let orgId: string | null = null;
  const existingUser = await prisma.user.findUnique({
    where: { email: seedEmail },
    select: { organizationId: true },
  });

  if (existingUser) {
    orgId = existingUser.organizationId;
  }

  // 2) Si no existe, crear organización y usuario dueño
  if (!orgId) {
    const org = await prisma.organization.create({
      data: { name: "Pyme Demo" },
    });
    orgId = org.id;

    const passwordHash = await bcrypt.hash(seedPass, 10);
    await prisma.user.create({
      data: {
        organizationId: orgId,
        name: "Dueño Demo",
        email: seedEmail,
        passwordHash,
        role: Role.OWNER,
      },
    });
  }

  // 3) Categorías base
  await prisma.expenseCategory.createMany({
    data: [
      { organizationId: orgId, name: "Arriendo" },
      { organizationId: orgId, name: "Servicios" },
      { organizationId: orgId, name: "Insumos" },
      { organizationId: orgId, name: "Transporte" },
    ],
  });

  // 4) Productos demo (minimarket)
  // Limpiar productos existentes de esa organización para que se vea el seed completo
  await prisma.$transaction([
    prisma.saleItem.deleteMany({
      where: { sale: { organizationId: orgId } },
    }),
    prisma.inventoryMovement.deleteMany({
      where: { organizationId: orgId },
    }),
    prisma.sale.deleteMany({
      where: { organizationId: orgId },
    }),
    prisma.product.deleteMany({
      where: { organizationId: orgId },
    }),
  ]);

  const defaultImageUrl =
    "https://images.unsplash.com/photo-1655809356482-6a0d443ed5ef?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000";

  const products = [
    { name: "Pan marraqueta", unit: "unidad", costPrice: 200, salePrice: 350, stockCurrent: 80, stockMin: 20 },
    { name: "Pan hallulla", unit: "unidad", costPrice: 220, salePrice: 380, stockCurrent: 70, stockMin: 20 },
    { name: "Leche entera 1L", unit: "unidad", costPrice: 820, salePrice: 1190, stockCurrent: 45, stockMin: 12 },
    { name: "Leche descremada 1L", unit: "unidad", costPrice: 820, salePrice: 1190, stockCurrent: 40, stockMin: 12 },
    { name: "Yogurt natural 1L", unit: "unidad", costPrice: 950, salePrice: 1490, stockCurrent: 30, stockMin: 10 },
    { name: "Queso gauda 250g", unit: "unidad", costPrice: 1850, salePrice: 2590, stockCurrent: 22, stockMin: 6 },
    { name: "Mantequilla 250g", unit: "unidad", costPrice: 1600, salePrice: 2290, stockCurrent: 18, stockMin: 6 },
    { name: "Huevos 30 un", unit: "unidad", costPrice: 4200, salePrice: 5590, stockCurrent: 12, stockMin: 4 },
    { name: "Arroz 1kg", unit: "unidad", costPrice: 1100, salePrice: 1690, stockCurrent: 35, stockMin: 10 },
    { name: "Fideos 400g", unit: "unidad", costPrice: 600, salePrice: 990, stockCurrent: 60, stockMin: 15 },
    { name: "Lentejas 1kg", unit: "unidad", costPrice: 1500, salePrice: 2190, stockCurrent: 25, stockMin: 8 },
    { name: "Harina 1kg", unit: "unidad", costPrice: 820, salePrice: 1290, stockCurrent: 28, stockMin: 8 },
    { name: "Azúcar 1kg", unit: "unidad", costPrice: 980, salePrice: 1490, stockCurrent: 32, stockMin: 10 },
    { name: "Sal fina 1kg", unit: "unidad", costPrice: 450, salePrice: 790, stockCurrent: 40, stockMin: 12 },
    { name: "Aceite vegetal 1L", unit: "unidad", costPrice: 2300, salePrice: 3190, stockCurrent: 20, stockMin: 6 },
    { name: "Café instantáneo 170g", unit: "unidad", costPrice: 2800, salePrice: 3990, stockCurrent: 14, stockMin: 4 },
    { name: "Té 100 bolsitas", unit: "unidad", costPrice: 1400, salePrice: 2190, stockCurrent: 18, stockMin: 6 },
    { name: "Galletas de soda", unit: "unidad", costPrice: 700, salePrice: 1190, stockCurrent: 50, stockMin: 12 },
    { name: "Galletas dulces 150g", unit: "unidad", costPrice: 650, salePrice: 1090, stockCurrent: 55, stockMin: 12 },
    { name: "Atún en lata 160g", unit: "unidad", costPrice: 980, salePrice: 1590, stockCurrent: 40, stockMin: 10 },
    { name: "Jurel en lata 425g", unit: "unidad", costPrice: 1800, salePrice: 2690, stockCurrent: 24, stockMin: 6 },
    { name: "Salsa de tomate 200g", unit: "unidad", costPrice: 420, salePrice: 790, stockCurrent: 48, stockMin: 12 },
    { name: "Mayonesa 500g", unit: "unidad", costPrice: 1500, salePrice: 2290, stockCurrent: 20, stockMin: 6 },
    { name: "Ketchup 500g", unit: "unidad", costPrice: 1400, salePrice: 2190, stockCurrent: 22, stockMin: 6 },
    { name: "Mostaza 200g", unit: "unidad", costPrice: 750, salePrice: 1190, stockCurrent: 26, stockMin: 8 },
    { name: "Bebida cola 1.5L", unit: "unidad", costPrice: 1200, salePrice: 1890, stockCurrent: 40, stockMin: 12 },
    { name: "Bebida naranja 1.5L", unit: "unidad", costPrice: 1150, salePrice: 1790, stockCurrent: 36, stockMin: 12 },
    { name: "Agua mineral 1.5L", unit: "unidad", costPrice: 700, salePrice: 1190, stockCurrent: 50, stockMin: 12 },
    { name: "Jugo en caja 1L", unit: "unidad", costPrice: 900, salePrice: 1390, stockCurrent: 30, stockMin: 10 },
    { name: "Cerveza lata 350cc", unit: "unidad", costPrice: 800, salePrice: 1290, stockCurrent: 60, stockMin: 15 },
    { name: "Vino tinto 750ml", unit: "unidad", costPrice: 3200, salePrice: 4990, stockCurrent: 12, stockMin: 4 },
    { name: "Papas fritas 200g", unit: "unidad", costPrice: 900, salePrice: 1490, stockCurrent: 35, stockMin: 10 },
    { name: "Maní salado 200g", unit: "unidad", costPrice: 850, salePrice: 1390, stockCurrent: 28, stockMin: 8 },
    { name: "Chocolate 100g", unit: "unidad", costPrice: 900, salePrice: 1590, stockCurrent: 26, stockMin: 8 },
    { name: "Helado 1L", unit: "unidad", costPrice: 2400, salePrice: 3590, stockCurrent: 10, stockMin: 4 },
    { name: "Detergente 1L", unit: "unidad", costPrice: 1500, salePrice: 2390, stockCurrent: 18, stockMin: 6 },
    { name: "Lavaloza 750ml", unit: "unidad", costPrice: 1200, salePrice: 1990, stockCurrent: 20, stockMin: 6 },
    { name: "Cloro 1L", unit: "unidad", costPrice: 750, salePrice: 1290, stockCurrent: 24, stockMin: 8 },
    { name: "Papel higiénico 4 un", unit: "unidad", costPrice: 1600, salePrice: 2590, stockCurrent: 18, stockMin: 6 },
    { name: "Toalla papel 2 un", unit: "unidad", costPrice: 1400, salePrice: 2290, stockCurrent: 16, stockMin: 5 },
    { name: "Shampoo 750ml", unit: "unidad", costPrice: 2100, salePrice: 3290, stockCurrent: 12, stockMin: 4 },
    { name: "Pasta dental 90g", unit: "unidad", costPrice: 900, salePrice: 1490, stockCurrent: 22, stockMin: 6 },
    { name: "Jabón de manos", unit: "unidad", costPrice: 700, salePrice: 1190, stockCurrent: 30, stockMin: 10 },
    { name: "Cepillo de dientes", unit: "unidad", costPrice: 600, salePrice: 990, stockCurrent: 24, stockMin: 8 },
    { name: "Pilas AA x4", unit: "unidad", costPrice: 1200, salePrice: 1990, stockCurrent: 14, stockMin: 4 },
    { name: "Cargador USB", unit: "unidad", costPrice: 2500, salePrice: 3990, stockCurrent: 8, stockMin: 2 },
    { name: "Tomate 1kg", unit: "kg", costPrice: 1200, salePrice: 1890, stockCurrent: 25, stockMin: 8 },
    { name: "Papa 1kg", unit: "kg", costPrice: 900, salePrice: 1490, stockCurrent: 30, stockMin: 10 },
    { name: "Cebolla 1kg", unit: "kg", costPrice: 950, salePrice: 1590, stockCurrent: 28, stockMin: 10 },
    { name: "Manzana 1kg", unit: "kg", costPrice: 1300, salePrice: 1990, stockCurrent: 22, stockMin: 8 },
    { name: "Plátano 1kg", unit: "kg", costPrice: 1200, salePrice: 1890, stockCurrent: 20, stockMin: 8 },
    { name: "Limón 1kg", unit: "kg", costPrice: 1000, salePrice: 1690, stockCurrent: 18, stockMin: 6 },
  ].map((p, idx) => ({
    ...p,
    organizationId: orgId,
    sku: `SKU-${String(idx + 1).padStart(4, "0")}`,
    imageUrl: defaultImageUrl,
  }));

  await prisma.product.createMany({
    data: products,
  });

  console.log("✅ Seed listo:", { orgId, user: `${seedEmail} / ${seedPass}` });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
