import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Sector Panel</h1>
      <p>Run <code>/authorize</code> in your Discord server to link it to your dashboard.</p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/authorize">Authorize</Link>
        <Link href="/dashboard">Dashboard</Link>
      </div>
    </main>
  );
}
