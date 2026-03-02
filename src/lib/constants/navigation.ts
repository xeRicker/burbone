import { LucideIcon } from "lucide-react";
import { LayoutDashboard, MapPin, Users, ShoppingBasket, Settings, Tag } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const mainNav: NavItem[] = [
  {
    label: "Statystyki",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Punkty",
    href: "/locations",
    icon: MapPin,
  },
  {
    label: "Zarządzanie ekipą",
    href: "/employees",
    icon: Users,
  },
  {
    label: "Produkty",
    href: "/products",
    icon: ShoppingBasket,
  },
];

export const settingsNav: NavItem[] = [
    {
        label: "Kategorie",
        href: "/categories",
        icon: Tag,
    },
    {
        label: "Ustawienia",
        href: "/settings",
        icon: Settings,
    }
]
