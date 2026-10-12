import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Growth Lodge",
  description: "Hotel management platform for modern hotels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}