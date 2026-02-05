import { prisma } from "../lib/prisma"; // ajusta si tu ruta cambia

async function main() {
  const items = await prisma.saleItem.findMany({
    where: { lineProfit: 0 },
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      product: { select: { costPrice: true } },
    },
    take: 5000,
  });

  for (const it of items) {
    const unitPrice = Number(it.unitPrice);
    const unitCost = Number(it.product.costPrice ?? 0);
    const lineProfit = (unitPrice - unitCost) * it.quantity;

    await prisma.saleItem.update({
      where: { id: it.id },
      data: {
        unitCost: unitCost as any,
        lineProfit: lineProfit as any,
      },
    });
  }

  console.log("Backfill listo:", items.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
