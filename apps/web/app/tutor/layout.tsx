import { DashboardLayout } from "@/components/dashboard";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="tutor">{children}</DashboardLayout>;
}
