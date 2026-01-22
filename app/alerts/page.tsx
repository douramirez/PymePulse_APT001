import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import AlertsClient from "./AlertsClient";

export default async function AlertsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  const alerts = await prisma.alert.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      type: true,
      severity: true,
      message: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <main className="page-card">
      <h1 style={{ fontSize: 26, fontWeight: 1000 }}>Alertas</h1>
      <p style={{ opacity: 0.75, marginTop: 6 }}>
        Revisa alertas de stock bajo y ciérralas cuando estén resueltas.
      </p>

      <AlertsClient alerts={alerts} />
    </main>
  );
}
