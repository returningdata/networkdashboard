import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashAuthCode } from "@/lib/hash";
import { getUserAndNetwork } from "@/lib/net";

export async function POST(req: Request) {
  const { user } = await getUserAndNetwork();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { code } = await req.json().catch(() => ({}));
  if (!code || typeof code !== "string" || code.length < 8) {
    return NextResponse.json({ error: "Invalid code." }, { status: 400 });
  }

  const codeHash = hashAuthCode(code);
  const authCode = await prisma.authCode.findUnique({ where: { codeHash } });

  if (!authCode) return NextResponse.json({ error: "Code not found." }, { status: 404 });
  if (authCode.usedAt) return NextResponse.json({ error: "Code already used." }, { status: 409 });
  if (authCode.expiresAt.getTime() < Date.now()) return NextResponse.json({ error: "Code expired." }, { status: 410 });
  if (authCode.issuedToUserId !== user.discordId) return NextResponse.json({ error: "This code was not issued to you." }, { status: 403 });

  let network = await prisma.network.findFirst({
    where: { members: { some: { userId: user.id, role: "OWNER" } } }
  });

  if (!network) {
    network = await prisma.network.create({
      data: {
        name: `${user.username ?? "My"} Network`,
        members: { create: [{ userId: user.id, role: "OWNER" }] }
      }
    });
  }

  await prisma.guild.upsert({
    where: { guildId: authCode.guildDiscordId },
    update: { networkId: network.id, name: authCode.guildName ?? undefined },
    create: { guildId: authCode.guildDiscordId, name: authCode.guildName ?? undefined, networkId: network.id }
  });

  await prisma.authCode.update({ where: { codeHash }, data: { usedAt: new Date() } });

  return NextResponse.json({ ok: true, networkId: network.id, guildId: authCode.guildDiscordId });
}
