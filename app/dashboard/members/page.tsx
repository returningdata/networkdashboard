"use client";

import { useEffect, useState } from "react";

export default function MembersPage() {
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [targetDiscordId, setTargetDiscordId] = useState("");
  const [networkRoleId, setNetworkRoleId] = useState("");

  async function load() {
    const res = await fetch("/api/network/members/list");
    const d = await res.json();
    setData(d);
    if (!networkRoleId && d?.roles?.[0]?.id) setNetworkRoleId(d.roles[0].id);
  }

  useEffect(()=>{ load(); }, []);

  async function grant() {
    setMsg("Granting...");
    const res = await fetch("/api/network/roles/grant", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ targetDiscordId, networkRoleId })
    });
    const d = await res.json().catch(()=>({}));
    if (!res.ok) return setMsg(d?.error || "Grant failed.");
    setMsg("✅ Granted. Now run Sync to apply.");
    await load();
  }

  async function revoke(grantId: string) {
    setMsg("Revoking...");
    const res = await fetch("/api/network/roles/revoke", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ grantId })
    });
    const d = await res.json().catch(()=>({}));
    if (!res.ok) return setMsg(d?.error || "Revoke failed.");
    setMsg("✅ Revoked. Now run Sync to remove.");
    await load();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Members & Staff</h1>
      <p>{msg}</p>

      <h2>Grant Network Role</h2>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input value={targetDiscordId} onChange={(e)=>setTargetDiscordId(e.target.value)} placeholder="Target Discord User ID" style={{ padding: 10, width: 320 }} />
        <select value={networkRoleId} onChange={(e)=>setNetworkRoleId(e.target.value)} style={{ padding: 10 }}>
          {(data?.roles || []).map((r:any)=>(
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <button onClick={grant} style={{ padding: "10px 14px" }}>Grant</button>
      </div>

      <h2 style={{ marginTop: 24 }}>Network Staff (dashboard access)</h2>
      <ul>
        {(data?.staff || []).map((m:any)=>(
          <li key={m.id}>
            <b>{m.user?.username || "User"}</b> — <code>{m.user?.discordId}</code> — {m.role}
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: 24 }}>Role Grants (network members)</h2>
      <ul>
        {(data?.grants || []).map((g:any)=>(
          <li key={g.id}>
            <b>{g.user?.username || "User"}</b> (<code>{g.user?.discordId}</code>) → <b>{g.networkRole?.name}</b>
            {" "}
            <button onClick={()=>revoke(g.id)} style={{ marginLeft: 8 }}>Revoke</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
