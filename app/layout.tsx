import type { Metadata } from "next";
import "./globals.css";
import "./editorial.css";

export const metadata: Metadata = {
  title: "Yerevan Cart · Buy with clarity",
  description: "Compare products and the full cost of delivery to Yerevan in Armenian, Russian and English.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
