import Link from "next/link";
import { getUserAndNetwork } from "@/lib/net";
import { prisma } from "@/lib/db";

export default async function Dashboard() {
  const { user, network } = await getUserAndNetwork();
  if (!user) return <div style={{ padding: 24 }}>Not logged in.</div>;
  if (!network) return <div style={{ padding: 24 }}>No network found yet. Run /authorize in a server first.</div>;

  const rolesCount = await prisma.networkRole.count({ where: { networkId: network.id } });

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Network: <b>{network.name}</b></p>

      <div style={{ display: "flex", gap: 12, margin: "12px 0 20px" }}>
        <Link href="/dashboard/roles">Roles ({rolesCount})</Link>
        <Link href="/dashboard/members">Members</Link>
        <Link href="/dashboard/sync">Sync</Link>
        <Link href="/dashboard/join">OAuth Join Test</Link>
      </div>

      <h2>Linked Servers</h2>
      <ul>
        {network.guilds.map((g) => (
          <li key={g.guildId}>
            {g.name ?? "Unknown"} — <code>{g.guildId}</code>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 16 }}>
        Tip: Create Network Roles, map them to server roles, then grant roles to members. Use Sync to apply changes.
      </p>
    </main>
  );
}
