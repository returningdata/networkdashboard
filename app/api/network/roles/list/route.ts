import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserAndNetwork } from "@/lib/net";

export async function GET() {
  const { user, network } = await getUserAndNetwork();
  if (!user || !network) return NextResponse.json({ error: "No network." }, { status: 401 });

  const roles = await prisma.networkRole.findMany({ where: { networkId: network.id }, orderBy: { createdAt: "desc" } });
  const guilds = await prisma.guild.findMany({ where: { networkId: network.id }, select: { guildId: true, name: true } });

  const mappings = await prisma.roleMapping.findMany({
    where: { networkRole: { networkId: network.id } },
    select: { networkRoleId: true, guild: { select: { guildId: true } }, discordRoleId: true }
  });

  const required = await prisma.requiredGuild.findMany({
    where: { networkRole: { networkId: network.id } },
    select: { networkRoleId: true, guild: { select: { guildId: true } } }
  });

  return NextResponse.json({
    roles,
    guilds,
    mappings: mappings.map(m => ({ networkRoleId: m.networkRoleId, guildDiscordId: m.guild.guildId, roleDiscordId: m.discordRoleId })),
    required: required.map(r => ({ networkRoleId: r.networkRoleId, guildDiscordId: r.guild.guildId }))
  });
}
