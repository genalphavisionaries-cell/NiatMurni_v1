import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niat Murni — KKM Food Handling Course",
  description: "KKM Food Handling Course Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
