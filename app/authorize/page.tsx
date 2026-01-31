"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

export default function AuthorizePage() {
  const { data: session, status } = useSession();
  const [msg, setMsg] = useState("Waiting...");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (!code) {
      setMsg("Missing ?code=. Run /authorize in Discord to get a link.");
      return;
    }

    if (status === "loading") return;

    if (!session) {
      setMsg("Please sign in with Discord to continue...");
      signIn("discord");
      return;
    }

    if (done) return;

    (async () => {
      setMsg("Redeeming authorization code...");
      const res = await fetch("/api/authorize/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg(data?.error || "Failed to redeem code.");
      setMsg("✅ Success! Server linked. Redirecting...");
      setDone(true);
      window.location.href = "/dashboard";
    })();
  }, [session, status, done]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Authorize Server</h1>
      <p>{msg}</p>
    </main>
  );
}
