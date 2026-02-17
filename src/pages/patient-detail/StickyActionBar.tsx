import { Link } from "react-router-dom";
import {
  Plus,
  FlaskConical,
  Sparkles,
  Printer,
  Baby,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { Button } from "../../components/ui";
import styles from "./StickyActionBar.module.css";

interface StickyActionBarProps {
  readonly patientId: string;
  readonly hasMenus: boolean;
  readonly onEditLabs: () => void;
  readonly onOpenAdvisor: () => void;
  readonly onPrint: () => void;
  readonly isPediatric?: boolean;
  readonly onAddTolerance?: () => void;
  readonly onAddGrowthEntry?: () => void;
  readonly onAddFeedingRoute?: () => void;
}

export function StickyActionBar({
  patientId,
  hasMenus,
  onEditLabs,
  onOpenAdvisor,
  onPrint,
  isPediatric,
  onAddTolerance,
  onAddGrowthEntry,
  onAddFeedingRoute,
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

      {isPediatric && onAddTolerance && (
        <Button
          variant="ghost"
          size="sm"
          icon={<Baby size={14} />}
          onClick={onAddTolerance}
        >
          耐性評価
        </Button>
      )}

      {isPediatric && onAddGrowthEntry && (
        <Button
          variant="ghost"
          size="sm"
          icon={<TrendingUp size={14} />}
          onClick={onAddGrowthEntry}
        >
          成長記録
        </Button>
      )}

      {isPediatric && onAddFeedingRoute && (
        <Button
          variant="ghost"
          size="sm"
          icon={<Utensils size={14} />}
          onClick={onAddFeedingRoute}
        >
          投与ルート
        </Button>
      )}

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
