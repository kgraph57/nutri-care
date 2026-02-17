import { Link } from "react-router-dom";
import { Plus, FlaskConical, Sparkles, Printer } from "lucide-react";
import { Button } from "../../components/ui";
import styles from "./StickyActionBar.module.css";

interface StickyActionBarProps {
  readonly patientId: string;
  readonly hasMenus: boolean;
  readonly onEditLabs: () => void;
  readonly onOpenAdvisor: () => void;
  readonly onPrint: () => void;
}

export function StickyActionBar({
  patientId,
  hasMenus,
  onEditLabs,
  onOpenAdvisor,
  onPrint,
}: StickyActionBarProps) {
  return (
    <div className={styles.actionBar}>
      <Link
        to={`/menu-builder/${patientId}?type=enteral`}
        className={styles.link}
      >
        <Button variant="primary" size="sm" icon={<Plus size={14} />}>
          経腸メニュー作成
        </Button>
      </Link>

      <Link
        to={`/menu-builder/${patientId}?type=parenteral`}
        className={styles.link}
      >
        <Button variant="secondary" size="sm" icon={<Plus size={14} />}>
          静脈メニュー作成
        </Button>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        icon={<FlaskConical size={14} />}
        onClick={onEditLabs}
      >
        検査値編集
      </Button>

      <Button
        variant="ghost"
        size="sm"
        icon={<Sparkles size={14} />}
        onClick={onOpenAdvisor}
      >
        AIアシスタント
      </Button>

      {hasMenus && (
        <Button
          variant="ghost"
          size="sm"
          icon={<Printer size={14} />}
          onClick={onPrint}
        >
          PDF出力
        </Button>
      )}
    </div>
  );
}
