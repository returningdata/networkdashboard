"use client";
import { useState } from "react";

export default function JoinPage() {
  const [guildId, setGuildId] = useState("");
  const [msg, setMsg] = useState("");

  async function doJoin() {
    setMsg("Joining...");
    const res = await fetch("/api/guilds/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guildId })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg((data?.error || "Join failed.") + (data?.details ? `\n${data.details}` : ""));
      return;
    }
    setMsg("✅ Joined (or already present). Now your bot can assign roles.");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Join Guild (OAuth guilds.join)</h1>
      <p>Paste a Guild ID to add yourself (bot must already be in that guild).</p>
      <input value={guildId} onChange={(e) => setGuildId(e.target.value)} placeholder="Guild ID" style={{ padding: 10, width: 360 }} />
      <button onClick={doJoin} style={{ padding: "10px 14px", marginLeft: 8 }}>Join</button>
      <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{msg}</pre>
    </main>
  );
}
