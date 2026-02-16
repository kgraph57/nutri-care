import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calculator,
  ClipboardList,
  Archive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./BottomNav.module.css";

interface NavItem {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly path: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { icon: LayoutDashboard, label: "ホーム", path: "/" },
  { icon: Users, label: "患者", path: "/patients" },
  { icon: ClipboardList, label: "作成", path: "/menu-builder" },
  { icon: Archive, label: "メニュー", path: "/menus" },
  { icon: Calculator, label: "計算", path: "/calculator" },
] as const;

function BottomNav() {
  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          className={({ isActive }) =>
            [styles.navItem, isActive ? styles.navItemActive : ""]
              .filter(Boolean)
              .join(" ")
          }
        >
          <item.icon className={styles.navIcon} size={20} />
          <span className={styles.navLabel}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
