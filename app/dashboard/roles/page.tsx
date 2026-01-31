"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Role = { id: string; name: string; createdAt: string };

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/network/roles/list");
    const data = await res.json();
    setRoles(data.roles || []);
  }

  useEffect(() => { load(); }, []);

  async function createRole() {
    setMsg("Creating...");
    const res = await fetch("/api/network/roles/create", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ name })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(data?.error || "Failed.");
    setName("");
    setMsg("✅ Created");
    await load();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Network Roles</h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="New role name (e.g. Staff)" style={{ padding: 10, width: 320 }} />
        <button onClick={createRole} style={{ padding: "10px 14px" }}>Create</button>
        <span>{msg}</span>
      </div>

      <h2 style={{ marginTop: 20 }}>Roles</h2>
      <ul>
        {roles.map(r => (
          <li key={r.id}>
            <b>{r.name}</b> — <Link href={`/dashboard/roles/${r.id}/mapping`}>mapping</Link>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 20 }}>
        Mapping: for each role, set which Discord role ID it becomes in each linked server, and optionally mark required servers.
      </p>
    </main>
  );
}
