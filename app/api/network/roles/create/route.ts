import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserAndNetwork } from "@/lib/net";

export async function POST(req: Request) {
  const { user, network } = await getUserAndNetwork();
  if (!user || !network) return NextResponse.json({ error: "No network." }, { status: 401 });

  const { name } = await req.json().catch(()=>({}));
  if (!name || typeof name !== "string" || name.length < 2) {
    return NextResponse.json({ error: "Invalid name." }, { status: 400 });
  }

  const role = await prisma.networkRole.create({
    data: { networkId: network.id, name: name.trim() }
  });

  return NextResponse.json({ ok: true, role });
}
