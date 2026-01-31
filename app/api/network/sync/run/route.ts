import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserAndNetwork } from "@/lib/net";

export async function POST() {
  const { user, network } = await getUserAndNetwork();
  if (!user || !network) return NextResponse.json({ error: "No network." }, { status: 401 });

  // Build desired role assignments from grants+mappings
  const grants = await prisma.roleGrant.findMany({
    where: { networkRole: { networkId: network.id } },
    include: { user: true, networkRole: true }
  });

  const mappings = await prisma.roleMapping.findMany({
    where: { networkRole: { networkId: network.id } },
    include: { guild: true, networkRole: true }
  });

  const required = await prisma.requiredGuild.findMany({
    where: { networkRole: { networkId: network.id } },
    include: { guild: true, networkRole: true }
  });

  // Index required guilds per networkRole
  const requiredByRole: Record<string, Set<string>> = {};
  for (const r of required) {
    const key = r.networkRoleId;
    if (!requiredByRole[key]) requiredByRole[key] = new Set();
    requiredByRole[key].add(r.guild.guildId);
  }

  // Desired pairs: (guildDiscordId, userDiscordId, roleDiscordId)
  const desired = new Set<string>();
  for (const g of grants) {
    const userDiscordId = g.user.discordId;
    const roleId = g.networkRoleId;

    for (const m of mappings.filter(x => x.networkRoleId === roleId)) {
      const guildDiscordId = m.guild.guildId;

      const reqSet = requiredByRole[roleId];
      if (reqSet && reqSet.size > 0 && !reqSet.has(guildDiscordId)) continue;

      desired.add(`${guildDiscordId}:${userDiscordId}:${m.discordRoleId}`);
    }
  }

  // Existing done/pending actions represent applied state poorly; instead we store a "best effort" reconcile:
  // - Enqueue ADD for desired that are not present as DONE in the past (we still may re-add; bot is idempotent).
  // - Enqueue REMOVE for actions that were previously done but no longer desired (approx).
  // For simplicity, we only enqueue ADD for now, and enqueue REMOVE for grants removed by comparing current desired to mappings+users with no grant.
  // We'll implement REMOVE by scanning users+role mappings and checking if pair is NOT desired.

  let enqueued = 0;

  // Enqueue ADD_ROLE actions for all desired pairs
  for (const key of desired) {
    const [guildDiscordId, userDiscordId, roleDiscordId] = key.split(":");
    await prisma.syncAction.create({
      data: {
        type: "ADD_ROLE",
        guildDiscordId,
        userDiscordId,
        roleDiscordId,
        requestedBy: user.discordId
      }
    });
    enqueued += 1;
  }

  // Enqueue REMOVE_ROLE for users in network that have mappings but no longer have grants for that network role.
  // Compute "should not have" by checking all role mappings for all users that appear in grants OR staff list.
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { grants: { some: { networkRole: { networkId: network.id } } } },
        { memberships: { some: { networkId: network.id } } }
      ]
    },
    select: { discordId: true }
  });

  // For each mapping and each user, if not desired => remove (this can be heavy for large networks, but fine for MVP)
  const userIds = users.map(u => u.discordId);
  for (const m of mappings) {
    const guildDiscordId = m.guild.guildId;
    const roleDiscordId = m.discordRoleId;
    const roleId = m.networkRoleId;

    const reqSet = requiredByRole[roleId];

    for (const userDiscordId of userIds) {
      if (reqSet && reqSet.size > 0 && !reqSet.has(guildDiscordId)) continue;
      const k = `${guildDiscordId}:${userDiscordId}:${roleDiscordId}`;
      if (desired.has(k)) continue;

      await prisma.syncAction.create({
        data: {
          type: "REMOVE_ROLE",
          guildDiscordId,
          userDiscordId,
          roleDiscordId,
          requestedBy: user.discordId
        }
      });
      enqueued += 1;
    }
  }

  return NextResponse.json({ ok: true, enqueued });
}
