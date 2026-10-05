import type { ReactNode } from "react";
import "../globals.css";

/** Root layout for the bare "/" address, which only routes visitors to /en/ or /ar/. */
export default function GatewayLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-svh bg-night text-ice">{children}</body>
    </html>
  );
}
