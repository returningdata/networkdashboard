import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserAndNetwork } from "@/lib/net";

export async function POST(req: Request) {
  const { user, network } = await getUserAndNetwork();
  if (!user || !network) return NextResponse.json({ error: "No network." }, { status: 401 });

  const { targetDiscordId, networkRoleId } = await req.json().catch(()=>({}));
  if (!targetDiscordId || !networkRoleId) return NextResponse.json({ error: "Missing fields." }, { status: 400 });

  const role = await prisma.networkRole.findFirst({ where: { id: networkRoleId, networkId: network.id } });
  if (!role) return NextResponse.json({ error: "Role not found." }, { status: 404 });

  const target = await prisma.user.upsert({
    where: { discordId: String(targetDiscordId) },
    update: {},
    create: { discordId: String(targetDiscordId) }
  });

  const grant = await prisma.roleGrant.upsert({
    where: { userId_networkRoleId: { userId: target.id, networkRoleId } },
    update: { grantedBy: user.discordId },
    create: { userId: target.id, networkRoleId, grantedBy: user.discordId }
  });

  return NextResponse.json({ ok: true, grant });
}
