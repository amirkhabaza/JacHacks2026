import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
