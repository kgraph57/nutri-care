import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import styles from "./AppShell.module.css";

function AppShell() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    setIsCollapsed((prev) => !prev);
  };

  const mainClassName = [
    styles.main,
    isCollapsed ? styles.mainCollapsed : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.shell}>
      <Sidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
      <div className={mainClassName}>
        <Header />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default AppShell;
