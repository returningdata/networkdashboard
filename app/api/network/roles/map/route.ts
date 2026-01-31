import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserAndNetwork } from "@/lib/net";

export async function POST(req: Request) {
  const { user, network } = await getUserAndNetwork();
  if (!user || !network) return NextResponse.json({ error: "No network." }, { status: 401 });

  const { networkRoleId, guildDiscordId, discordRoleId } = await req.json().catch(()=>({}));
  if (!networkRoleId || !guildDiscordId || !discordRoleId) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const role = await prisma.networkRole.findFirst({ where: { id: networkRoleId, networkId: network.id } });
  if (!role) return NextResponse.json({ error: "Role not found." }, { status: 404 });

  const guild = await prisma.guild.findFirst({ where: { guildId: guildDiscordId, networkId: network.id } });
  if (!guild) return NextResponse.json({ error: "Guild not found." }, { status: 404 });

  const mapping = await prisma.roleMapping.upsert({
    where: { networkRoleId_guildId: { networkRoleId, guildId: guild.id } },
    update: { discordRoleId: String(discordRoleId) },
    create: { networkRoleId, guildId: guild.id, discordRoleId: String(discordRoleId) }
  });

  return NextResponse.json({ ok: true, mapping });
}
