import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserAndNetwork } from "@/lib/net";

export async function POST(req: Request) {
  const { user, network } = await getUserAndNetwork();
  if (!user || !network) return NextResponse.json({ error: "No network." }, { status: 401 });

  const { grantId } = await req.json().catch(()=>({}));
  if (!grantId) return NextResponse.json({ error: "Missing grantId." }, { status: 400 });

  // ensure belongs to network
  const grant = await prisma.roleGrant.findFirst({
    where: { id: grantId, networkRole: { networkId: network.id } }
  });
  if (!grant) return NextResponse.json({ error: "Grant not found." }, { status: 404 });

  await prisma.roleGrant.delete({ where: { id: grantId } });
  return NextResponse.json({ ok: true });
}
