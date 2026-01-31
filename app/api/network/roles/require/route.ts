import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserAndNetwork } from "@/lib/net";

export async function POST(req: Request) {
  const { user, network } = await getUserAndNetwork();
  if (!user || !network) return NextResponse.json({ error: "No network." }, { status: 401 });

  const { networkRoleId, guildDiscordId, required } = await req.json().catch(()=>({}));
  if (!networkRoleId || !guildDiscordId || typeof required !== "boolean") {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const guild = await prisma.guild.findFirst({ where: { guildId: guildDiscordId, networkId: network.id } });
  if (!guild) return NextResponse.json({ error: "Guild not found." }, { status: 404 });

  const exists = await prisma.requiredGuild.findUnique({
    where: { networkRoleId_guildId: { networkRoleId, guildId: guild.id } }
  });

  if (required && !exists) {
    await prisma.requiredGuild.create({ data: { networkRoleId, guildId: guild.id } });
  } else if (!required && exists) {
    await prisma.requiredGuild.delete({ where: { networkRoleId_guildId: { networkRoleId, guildId: guild.id } } });
  }

  return NextResponse.json({ ok: true });
}
