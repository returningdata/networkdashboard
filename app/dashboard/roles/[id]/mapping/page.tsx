"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Guild = { guildId: string; name: string | null };
type Mapping = { guildId: string; discordRoleId: string };
type Required = { guildId: string };

export default function MappingPage() {
  const params = useParams();
  const roleId = params?.id as string;

  const [roleName, setRoleName] = useState("");
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [mappings, setMappings] = useState<Record<string,string>>({});
  const [required, setRequired] = useState<Record<string,boolean>>({});
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/network/roles/list");
    const data = await res.json();
    const role = (data.roles || []).find((r:any)=>r.id===roleId);
    setRoleName(role?.name || "Role");

    setGuilds(data.guilds || []);

    const mapObj: Record<string,string> = {};
    (data.mappings || []).filter((m:any)=>m.networkRoleId===roleId).forEach((m:any)=>{ mapObj[m.guildDiscordId]=m.roleDiscordId; });
    setMappings(mapObj);

    const reqObj: Record<string,boolean> = {};
    (data.required || []).filter((x:any)=>x.networkRoleId===roleId).forEach((x:any)=>{ reqObj[x.guildDiscordId]=true; });
    setRequired(reqObj);
  }

  useEffect(()=>{ load(); }, [roleId]);

  async function saveMapping(guildDiscordId: string) {
    setMsg("Saving...");
    const discordRoleId = mappings[guildDiscordId] || "";
    const res = await fetch("/api/network/roles/map", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ networkRoleId: roleId, guildDiscordId, discordRoleId })
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) return setMsg(data?.error || "Failed to save mapping.");
    setMsg("✅ Saved mapping");
    await load();
  }

  async function toggleRequired(guildDiscordId: string) {
    const next = !required[guildDiscordId];
    setMsg("Saving...");
    const res = await fetch("/api/network/roles/require", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ networkRoleId: roleId, guildDiscordId, required: next })
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) return setMsg(data?.error || "Failed to set required.");
    setMsg("✅ Updated required");
    await load();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Mapping: {roleName}</h1>
      <p>{msg}</p>

      <h2>Servers</h2>
      <p>Enter the Discord Role ID you want this Network Role to apply in each server.</p>

      <div style={{ display: "grid", gap: 12 }}>
        {guilds.map(g => (
          <div key={g.guildId} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <b>{g.name || "Unknown"}</b> — <code>{g.guildId}</code>
              </div>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={!!required[g.guildId]} onChange={()=>toggleRequired(g.guildId)} />
                Required
              </label>
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={mappings[g.guildId] || ""}
                onChange={(e)=>setMappings(prev => ({...prev, [g.guildId]: e.target.value}))}
                placeholder="Discord Role ID"
                style={{ padding: 10, width: 360 }}
              />
              <button onClick={()=>saveMapping(g.guildId)} style={{ padding: "10px 14px" }}>Save</button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 16 }}>
        If any servers are marked Required for this role, sync will enforce membership in those servers.
        If none are marked required, the role can apply anywhere it has a mapping.
      </p>
    </main>
  );
}
