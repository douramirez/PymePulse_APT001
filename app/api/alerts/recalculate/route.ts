import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = (session as any).organizationId as string;

  const since30 = daysAgo(30);

  const [sales30, expenses30] = await Promise.all([
    prisma.sale.findMany({
      where: { organizationId, dateTime: { gte: since30 } },
      select: { total: true },
    }),
    prisma.expense.findMany({
      where: { organizationId, date: { gte: since30 } },
      select: { amount: true },
    }),
  ]);

  const totalSales30 = sales30.reduce((a, s) => a + Number(s.total), 0);
  const totalExpenses30 = expenses30.reduce((a, e) => a + Number(e.amount), 0);

  const avgSalesDay = totalSales30 / 30;
  const avgExpDay = totalExpenses30 / 30;

  const forecastSales7 = avgSalesDay * 7;
  const forecastExp7 = avgExpDay * 7;

  const risk = forecastSales7 < forecastExp7;

  // si hay riesgo, crea/actualiza alerta abierta; si no, cierra las abiertas
  if (risk) {
    const open = await prisma.alert.findFirst({
      where: { organizationId, type: "CASH_RISK", status: "OPEN" },
    });

    const msg = `Riesgo caja (7 días): ventas est. ${forecastSales7.toFixed(
      0
    )} < gastos est. ${forecastExp7.toFixed(0)}`;

    if (open) {
      await prisma.alert.update({
        where: { id: open.id },
        data: { message: msg, severity: "HIGH" },
      });
    } else {
      await prisma.alert.create({
        data: {
          organizationId,
          type: "CASH_RISK",
          severity: "HIGH",
          message: msg,
          status: "OPEN",
        },
      });
    }
  } else {
    await prisma.alert.updateMany({
      where: { organizationId, type: "CASH_RISK", status: "OPEN" },
      data: { status: "CLOSED" },
    });
  }

  return NextResponse.json({ ok: true, risk }, { status: 200 });
}
