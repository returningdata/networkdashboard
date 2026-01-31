import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserAndNetwork } from "@/lib/net";

export async function GET() {
  const { user, network } = await getUserAndNetwork();
  if (!user || !network) return NextResponse.json({ error: "No network." }, { status: 401 });

  const staff = await prisma.networkMember.findMany({
    where: { networkId: network.id },
    include: { user: true },
    orderBy: { createdAt: "asc" }
  });

  const roles = await prisma.networkRole.findMany({ where: { networkId: network.id }, orderBy: { createdAt: "desc" } });

  const grants = await prisma.roleGrant.findMany({
    where: { networkRole: { networkId: network.id } },
    include: { user: true, networkRole: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ staff, roles, grants });
}
