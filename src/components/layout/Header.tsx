import { useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { isSupabaseConfigured } from "../../lib/supabase";
import styles from "./Header.module.css";

interface RouteTitle {
  readonly path: string;
  readonly title: string;
}

const ROUTE_TITLES: readonly RouteTitle[] = [
  { path: "/patients", title: "患者管理" },
  { path: "/calculator", title: "栄養計算" },
  { path: "/menu-builder", title: "メニュー作成" },
  { path: "/menus", title: "保存メニュー" },
] as const;

const DEFAULT_TITLE = "ダッシュボード";

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = weekdays[date.getDay()];
  return `${year}/${month}/${day} (${weekday})`;
}

function getPageTitle(pathname: string): string {
  const matched = ROUTE_TITLES.find((route) =>
    pathname.startsWith(route.path),
  );
  return matched ? matched.title : DEFAULT_TITLE;
}

function Header() {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const { user, signOut } = useAuth();
  const today = new Date();

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{pageTitle}</h1>
      <div className={styles.headerRight}>
        <time className={styles.date} dateTime={today.toISOString()}>
          {formatDate(today)}
        </time>
        {isSupabaseConfigured && user && (
          <button
            type="button"
            className={styles.logoutButton}
            onClick={signOut}
            title="ログアウト"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
