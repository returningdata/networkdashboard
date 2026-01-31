import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  const discordId = (session as any)?.user?.discordId as string | undefined;
  const userAccessToken = (session as any)?.discordAccessToken as string | undefined;

  if (!discordId || !userAccessToken) {
    return NextResponse.json({ error: "Not authenticated or missing Discord OAuth token." }, { status: 401 });
  }

  const { guildId } = await req.json().catch(() => ({}));
  if (!guildId || typeof guildId !== "string") return NextResponse.json({ error: "Missing guildId." }, { status: 400 });

  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: "Server misconfigured: missing bot token." }, { status: 500 });

  const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
    method: "PUT",
    headers: { "Authorization": `Bot ${botToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: userAccessToken })
  });

  const details = await res.text();
  if (!res.ok) return NextResponse.json({ error: "Discord join failed.", status: res.status, details }, { status: 400 });

  return NextResponse.json({ ok: true });
}
