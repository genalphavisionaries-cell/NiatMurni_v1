import { DashboardLayout } from "@/components/dashboard";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // User portal stays on shared dashboard-shell only.
  return <DashboardLayout role="participant">{children}</DashboardLayout>;
}
