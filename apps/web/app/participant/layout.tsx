import { DashboardLayout } from "@/components/dashboard";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="participant">{children}</DashboardLayout>;
}
