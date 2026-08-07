import {
  LayoutDashboard,
  ImageIcon,
  Briefcase,
  Building2,
  Users,
  Quote,
  Newspaper,
  CalendarDays,
  MessagesSquare,
  Contact,
  UserPlus,
  ClipboardList,
  PanelBottom,
  Palette,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: "leads" | "messages";
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Site content",
    items: [
      { label: "Hero section", href: "/hero", icon: ImageIcon },
      { label: "Services", href: "/services", icon: Briefcase },
      { label: "About & values", href: "/about", icon: Building2 },
      { label: "Team", href: "/team", icon: Users },
      { label: "Testimonials", href: "/testimonials", icon: Quote },
      { label: "Blog", href: "/blog", icon: Newspaper },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Availability", href: "/calendar", icon: CalendarDays },
      { label: "Messages", href: "/messages", icon: MessagesSquare, badgeKey: "messages" },
      { label: "Contact info", href: "/contact", icon: Contact },
      { label: "Leads", href: "/leads", icon: UserPlus, badgeKey: "leads" },
      { label: "Tasks", href: "/tasks", icon: ClipboardList },
    ],
  },
  {
    title: "Site settings",
    items: [
      { label: "Footer", href: "/footer", icon: PanelBottom },
      { label: "Appearance", href: "/appearance", icon: Palette },
      { label: "Account", href: "/settings", icon: Settings },
    ],
  },
];
