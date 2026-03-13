import {
  Award,
  BookOpen,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Settings,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DashboardRole = "admin" | "tutor" | "participant";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: { label: string; href: string }[];
};

export const SIDEBAR_WIDTH = 260;

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Programs", href: "/admin/programs", icon: FolderOpen },
  { label: "Classes", href: "/admin/classes", icon: Calendar },
  { label: "Bookings", href: "/admin/bookings", icon: BookOpen },
  { label: "Participants", href: "/admin/participants", icon: Users },
  { label: "Tutors", href: "/admin/tutors", icon: GraduationCap },
  { label: "Certificates", href: "/admin/certificates", icon: Award },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  {
    label: "CMS",
    href: "/admin/cms",
    icon: FileText,
    children: [
      { label: "Homepage", href: "/admin/cms/homepage" },
      { label: "Testimonials", href: "/admin/cms/testimonials" },
      { label: "Logos", href: "/admin/cms/logos" },
      { label: "Footer", href: "/admin/cms/footer" },
    ],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { label: "Users", href: "/admin/settings/users" },
      { label: "System", href: "/admin/settings/system" },
    ],
  },
];

const tutorNav: NavItem[] = [
  { label: "Dashboard", href: "/tutor", icon: LayoutDashboard },
  { label: "My Classes", href: "/tutor/classes", icon: Calendar },
  { label: "Students", href: "/tutor/students", icon: Users },
  { label: "Attendance", href: "/tutor/attendance", icon: ClipboardCheck },
  { label: "Materials", href: "/tutor/materials", icon: FolderOpen },
  { label: "Profile", href: "/tutor/profile", icon: User },
];

const participantNav: NavItem[] = [
  { label: "Dashboard", href: "/participant", icon: LayoutDashboard },
  { label: "My Courses", href: "/participant/courses", icon: BookOpen },
  { label: "Certificates", href: "/participant/certificates", icon: Award },
  { label: "Profile", href: "/participant/profile", icon: User },
  { label: "Support", href: "/participant/support", icon: HelpCircle },
];

export function getNavForRole(role: DashboardRole): NavItem[] {
  switch (role) {
    case "admin":
      return adminNav;
    case "tutor":
      return tutorNav;
    case "participant":
      return participantNav;
    default:
      return [];
  }
}
