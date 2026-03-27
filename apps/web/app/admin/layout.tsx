import { AdminLayoutClient } from "./AdminLayoutClient";

// WARNING: Do not mix admin and dashboard layouts. They are isolated systems.
// This layout is exclusively for /admin/* routes.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
