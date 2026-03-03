import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niat Murni Academy",
  description: "KKM Food Handling & Training",
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
