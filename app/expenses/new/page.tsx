import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import NewExpenseClient from "./NewExpenseClient";

export default async function NewExpensePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  const categories = await prisma.expenseCategory.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="page-card" style={{ maxWidth: 780 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Nuevo gasto</h1>
      <NewExpenseClient categories={categories} />
    </main>
  );
}
