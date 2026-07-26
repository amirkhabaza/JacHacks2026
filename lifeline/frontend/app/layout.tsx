import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // Lets the opengraph-image file convention resolve to an absolute URL.
  // Set NEXT_PUBLIC_SITE_URL once this is deployed somewhere other than localhost.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Lifeline — Crisis Intelligence",
  description:
    "AI-powered humanitarian crisis intelligence on Jac's graph-native runtime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased font-sans">{children}</body>
    </html>
  );
}
