import { useMemo } from 'react';
import { Route, Plus, Clock, Activity } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import type { FeedingRouteEntry, FeedingRouteType, FeedingScheduleMode } from '../../types/feedingRoute';
import { FEEDING_ROUTE_LABELS, FEEDING_SCHEDULE_MODE_LABELS } from '../../types/feedingRoute';
import styles from './FeedingRoutePanel.module.css';

/* ---- Props ---- */

interface FeedingRoutePanelProps {
  readonly history: readonly FeedingRouteEntry[];
  readonly onAddEntry: () => void;
}

/* ---- Helpers ---- */

function getRouteBadgeVariant(route: FeedingRouteType): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (route) {
    case 'oral':
      return 'success';
    case 'ng-tube':
    case 'og-tube':
    case 'nj-tube':
      return 'info';
    case 'gastrostomy':
    case 'jejunostomy':
      return 'warning';
    case 'peripheral-iv':
    case 'central-iv':
      return 'danger';
    default:
      return 'neutral';
  }
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return isoDate;
  }
}

function formatScheduleSummary(entry: FeedingRouteEntry): string {
  const { schedule } = entry;
  const modeLabel = FEEDING_SCHEDULE_MODE_LABELS[schedule.mode];

  if (schedule.mode === 'continuous') {
    return `${modeLabel} ${schedule.ratePerHour ?? 0} mL/hr`;
  }

  if (schedule.mode === 'intermittent' || schedule.mode === 'bolus') {
    const interval = schedule.intervalHours ? `${schedule.intervalHours}時間毎` : '';
    return `${modeLabel} ${schedule.volumePerSession} mL ${interval}`.trim();
  }

  return modeLabel;
}

function getLatestEntry(history: readonly FeedingRouteEntry[]): FeedingRouteEntry | undefined {
  if (history.length === 0) return undefined;
  return [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];
}

function computeDaysOnRoute(entry: FeedingRouteEntry): number {
  const entryDate = new Date(entry.date);
  const now = new Date();
  const diffMs = now.getTime() - entryDate.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/* ---- Sub-components ---- */

function CurrentRouteDisplay({ entry }: { readonly entry: FeedingRouteEntry }) {
  const daysOnRoute = useMemo(() => computeDaysOnRoute(entry), [entry]);
  const scheduleSummary = useMemo(() => formatScheduleSummary(entry), [entry]);

  return (
    <div className={styles.currentRouteSection}>
      <span className={styles.routeLabel}>現在のルート</span>
      <div className={styles.currentRouteHeader}>
        <Badge variant={getRouteBadgeVariant(entry.route)}>
          {FEEDING_ROUTE_LABELS[entry.route]}
        </Badge>
        <Badge variant="neutral">{scheduleSummary}</Badge>
      </div>

      <div className={styles.routeDetails}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>投与量/回</span>
          <span className={styles.detailValue}>{entry.schedule.volumePerSession} mL</span>
        </div>
        {entry.schedule.ratePerHour !== undefined && (
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>投与速度</span>
            <span className={styles.detailValue}>{entry.schedule.ratePerHour} mL/hr</span>
          </div>
        )}
        {entry.schedule.intervalHours !== undefined && (
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>投与間隔</span>
            <span className={styles.detailValue}>{entry.schedule.intervalHours} 時間毎</span>
          </div>
        )}
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>継続日数</span>
          <span className={styles.detailValue}>{daysOnRoute} 日</span>
        </div>
      </div>
    </div>
  );
}

function ScheduleDisplay({ entry }: { readonly entry: FeedingRouteEntry }) {
  const { schedule } = entry;

  return (
    <div className={styles.scheduleSection}>
      <span className={styles.scheduleSectionLabel}>スケジュール詳細</span>
      <div className={styles.scheduleDetails}>
        <span className={styles.scheduleTag}>
          <Clock size={12} />
          開始 {schedule.startTime}
        </span>
        <span className={styles.scheduleTag}>
          <Activity size={12} />
          {schedule.durationMinutes} 分/回
        </span>
        {entry.tubeSize && (
          <span className={styles.scheduleTag}>チューブ {entry.tubeSize}</span>
        )}
        {entry.insertionSite && (
          <span className={styles.scheduleTag}>挿入部位: {entry.insertionSite}</span>
        )}
      </div>
      {entry.notes && (
        <span className={styles.historyNotes}>{entry.notes}</span>
      )}
    </div>
  );
}

function HistoryEntry({ entry }: { readonly entry: FeedingRouteEntry }) {
  return (
    <div className={styles.historyEntry}>
      <span className={styles.historyDate}>{formatDate(entry.date)}</span>
      <Badge variant={getRouteBadgeVariant(entry.route)}>
        {FEEDING_ROUTE_LABELS[entry.route]}
      </Badge>
      <span className={styles.historyRoute}>
        {FEEDING_SCHEDULE_MODE_LABELS[entry.schedule.mode]}
      </span>
      <span className={styles.historySchedule}>
        {entry.schedule.volumePerSession} mL
        {entry.schedule.ratePerHour !== undefined ? ` @ ${entry.schedule.ratePerHour} mL/hr` : ''}
      </span>
      {entry.notes && (
        <span className={styles.historyNotes}>{entry.notes}</span>
      )}
    </div>
  );
}

/* ---- Main component ---- */

export function FeedingRoutePanel({ history, onAddEntry }: FeedingRoutePanelProps) {
  const latestEntry = useMemo(() => getLatestEntry(history), [history]);
  const sortedHistory = useMemo(
    () => [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
    [history],
  );

  if (history.length === 0) {
    return (
      <Card>
        <div className={styles.container}>
          <div className={styles.header}>
            <Route size={20} className={styles.headerIcon} />
            <h3 className={styles.title}>投与ルート管理</h3>
          </div>
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>投与ルートデータがありません</p>
            <Button size="sm" icon={<Plus size={16} />} onClick={onAddEntry}>追加</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Route size={20} className={styles.headerIcon} />
          <h3 className={styles.title}>投与ルート管理</h3>
          <Button size="sm" variant="ghost" icon={<Plus size={16} />} onClick={onAddEntry} className={styles.addButton}>
            追加
          </Button>
        </div>

        {/* Current route display */}
        {latestEntry && (
          <>
            <CurrentRouteDisplay entry={latestEntry} />
            <hr className={styles.divider} />
            <ScheduleDisplay entry={latestEntry} />
          </>
        )}

        {/* History list */}
        {sortedHistory.length > 1 && (
          <>
            <hr className={styles.divider} />
            <div className={styles.historySection}>
              <span className={styles.historySectionLabel}>変更履歴</span>
              <div className={styles.historyList}>
                {sortedHistory.slice(1).map((entry) => (
                  <HistoryEntry key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
