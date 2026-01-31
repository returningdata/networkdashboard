"use client";
import { useEffect, useState } from "react";

export default function SyncPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/network/sync/list");
    const d = await res.json();
    setActions(d.actions || []);
  }

  useEffect(()=>{ load(); }, []);

  async function runSync() {
    setMsg("Running sync...");
    const res = await fetch("/api/network/sync/run", { method: "POST" });
    const d = await res.json().catch(()=>({}));
    if (!res.ok) return setMsg(d?.error || "Sync failed.");
    setMsg(`✅ Enqueued ${d.enqueued || 0} actions`);
    await load();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Sync</h1>
      <p>This enqueues role add/remove actions. Your Python bot processes them.</p>
      <button onClick={runSync} style={{ padding: "10px 14px" }}>Run Sync</button>
      <p>{msg}</p>

      <h2>Recent Actions</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Status</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Type</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Guild</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>User</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Role</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Error</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((a:any)=>(
            <tr key={a.id}>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{a.status}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{a.type}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}><code>{a.guildDiscordId}</code></td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}><code>{a.userDiscordId}</code></td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}><code>{a.roleDiscordId}</code></td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8, whiteSpace: "pre-wrap" }}>{a.error || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
