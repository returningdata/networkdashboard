import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserAndNetwork } from "@/lib/net";

export async function GET() {
  const { user, network } = await getUserAndNetwork();
  if (!user || !network) return NextResponse.json({ error: "No network." }, { status: 401 });

  const actions = await prisma.syncAction.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return NextResponse.json({ actions });
}
