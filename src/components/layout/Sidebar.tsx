import { NavLink } from "react-router-dom";
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  Calculator,
  ClipboardList,
  Archive,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./Sidebar.module.css";

interface NavItem {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly path: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { icon: LayoutDashboard, label: "ダッシュボード", path: "/" },
  { icon: Users, label: "患者管理", path: "/patients" },
  { icon: Calculator, label: "栄養計算", path: "/calculator" },
  { icon: ClipboardList, label: "メニュー作成", path: "/menu-builder" },
  { icon: Archive, label: "保存メニュー", path: "/menus" },
  { icon: Settings, label: "設定", path: "/settings" },
] as const;

interface SidebarProps {
  readonly isCollapsed: boolean;
  readonly onToggle: () => void;
}

function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const sidebarClassName = [styles.sidebar, isCollapsed ? styles.collapsed : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={sidebarClassName}>
      <div className={styles.brand}>
        <Stethoscope className={styles.brandIcon} size={28} />
        <span className={styles.brandText}>Pedi NutriCare</span>
        <button
          className={styles.toggleButton}
          onClick={onToggle}
          aria-label={
            isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"
          }
          type="button"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <li key={item.path} className={styles.navItem}>
              <NavLink
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ""]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                <item.icon className={styles.navIcon} size={20} />
                <span className={styles.navLabel}>{item.label}</span>
                <span className={styles.tooltip}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
