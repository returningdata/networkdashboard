import React from "react";
import Providers from "./providers";

export const metadata = {
  title: "Sector Panel",
  description: "Network roles dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
