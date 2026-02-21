import { useState, useCallback, useMemo } from 'react';
import { Button } from '../ui';
import type {
  FeedingRouteEntry,
  FeedingRouteType,
  FeedingScheduleMode,
  FeedingSchedule,
} from '../../types/feedingRoute';
import {
  FEEDING_ROUTE_LABELS,
  FEEDING_SCHEDULE_MODE_LABELS,
} from '../../types/feedingRoute';
import styles from './FeedingRouteForm.module.css';

/* ---- Props ---- */

interface FeedingRouteFormProps {
  readonly patientId: string;
  readonly initialData?: FeedingRouteEntry;
  readonly onSave: (entry: FeedingRouteEntry) => void;
  readonly onCancel: () => void;
}

/* ---- Constants ---- */

const ROUTE_OPTIONS: readonly { readonly value: FeedingRouteType; readonly label: string }[] = (
  Object.entries(FEEDING_ROUTE_LABELS) as ReadonlyArray<[FeedingRouteType, string]>
).map(([value, label]) => ({ value, label }));

const SCHEDULE_MODE_OPTIONS: readonly { readonly value: FeedingScheduleMode; readonly label: string }[] = (
  Object.entries(FEEDING_SCHEDULE_MODE_LABELS) as ReadonlyArray<[FeedingScheduleMode, string]>
).map(([value, label]) => ({ value, label }));

/* ---- Helpers ---- */

function generateId(): string {
  return `fr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseNumericValue(raw: string): number {
  const parsed = parseFloat(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function computeDailyVolume(
  mode: FeedingScheduleMode,
  volumePerSession: number,
  ratePerHour: number,
  intervalHours: number,
  durationMinutes: number,
): number {
  if (mode === 'continuous') {
    return Math.round(ratePerHour * 24);
  }
  if (intervalHours > 0) {
    const sessionsPerDay = Math.floor(24 / intervalHours);
    return Math.round(volumePerSession * sessionsPerDay);
  }
  return volumePerSession;
}

/* ---- Component ---- */

export function FeedingRouteForm({
  patientId,
  initialData,
  onSave,
  onCancel,
}: FeedingRouteFormProps) {
  const [date, setDate] = useState(
    initialData?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [route, setRoute] = useState<FeedingRouteType>(
    initialData?.route ?? 'ng-tube',
  );
  const [scheduleMode, setScheduleMode] = useState<FeedingScheduleMode>(
    initialData?.schedule.mode ?? 'continuous',
  );
  const [startTime, setStartTime] = useState(
    initialData?.schedule.startTime ?? '08:00',
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialData?.schedule.durationMinutes ?? 60,
  );
  const [volumePerSession, setVolumePerSession] = useState(
    initialData?.schedule.volumePerSession ?? 0,
  );
  const [ratePerHour, setRatePerHour] = useState(
    initialData?.schedule.ratePerHour ?? 0,
  );
  const [intervalHours, setIntervalHours] = useState(
    initialData?.schedule.intervalHours ?? 4,
  );
  const [tubeSize, setTubeSize] = useState(initialData?.tubeSize ?? '');
  const [insertionSite, setInsertionSite] = useState(initialData?.insertionSite ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  const dailyVolume = useMemo(
    () => computeDailyVolume(scheduleMode, volumePerSession, ratePerHour, intervalHours, durationMinutes),
    [scheduleMode, volumePerSession, ratePerHour, intervalHours, durationMinutes],
  );

  const handleRouteChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoute(e.target.value as FeedingRouteType);
  }, []);

  const handleScheduleModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setScheduleMode(e.target.value as FeedingScheduleMode);
  }, []);

  const isValid = useMemo(() => {
    if (!date) return false;
    if (scheduleMode === 'continuous' && ratePerHour <= 0) return false;
    if (scheduleMode !== 'continuous' && volumePerSession <= 0) return false;
    return true;
  }, [date, scheduleMode, ratePerHour, volumePerSession]);

  const handleSave = useCallback(() => {
    if (!isValid) return;

    const schedule: FeedingSchedule = {
      id: initialData?.schedule.id ?? generateId(),
      mode: scheduleMode,
      startTime,
      durationMinutes,
      volumePerSession,
      ...(scheduleMode === 'continuous' ? { ratePerHour } : {}),
      ...(scheduleMode !== 'continuous' ? { intervalHours } : {}),
    };

    const entry: FeedingRouteEntry = {
      id: initialData?.id ?? generateId(),
      patientId,
      date,
      route,
      schedule,
      notes,
      ...(tubeSize ? { tubeSize } : {}),
      ...(insertionSite ? { insertionSite } : {}),
    };

    onSave(entry);
  }, [
    isValid, initialData, patientId, date, route, scheduleMode,
    startTime, durationMinutes, volumePerSession, ratePerHour,
    intervalHours, tubeSize, insertionSite, notes, onSave,
  ]);

  return (
    <div className={styles.form}>
      {/* Date */}
      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>記録日:</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.dateInput}
        />
      </div>

      {/* Route type */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>投与ルート</h4>
        <div className={styles.field}>
          <label className={styles.label}>ルート種別</label>
          <select
            value={route}
            onChange={handleRouteChange}
            className={styles.select}
          >
            {ROUTE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.columns}>
          <div className={styles.field}>
            <label className={styles.label}>チューブサイズ</label>
            <input
              type="text"
              value={tubeSize}
              onChange={(e) => setTubeSize(e.target.value)}
              placeholder="例: 8Fr"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>挿入部位</label>
            <input
              type="text"
              value={insertionSite}
              onChange={(e) => setInsertionSite(e.target.value)}
              placeholder="例: 右鼻孔"
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Schedule mode */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>投与スケジュール</h4>
        <div className={styles.field}>
          <label className={styles.label}>投与モード</label>
          <select
            value={scheduleMode}
            onChange={handleScheduleModeChange}
            className={styles.select}
          >
            {SCHEDULE_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.columns}>
          <div className={styles.field}>
            <label className={styles.label}>開始時間</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              投与時間
              <span className={styles.unit}>(分/回)</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseNumericValue(e.target.value))}
              className={styles.input}
            />
          </div>
        </div>

        {/* Conditional fields based on schedule mode */}
        {scheduleMode === 'continuous' && (
          <div className={styles.columns}>
            <div className={styles.field}>
              <label className={styles.label}>
                投与速度
                <span className={styles.unit}>(mL/hr)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={ratePerHour}
                onChange={(e) => setRatePerHour(parseNumericValue(e.target.value))}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                1回投与量
                <span className={styles.unit}>(mL)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={volumePerSession}
                onChange={(e) => setVolumePerSession(parseNumericValue(e.target.value))}
                className={styles.input}
              />
            </div>
          </div>
        )}

        {scheduleMode === 'intermittent' && (
          <div className={styles.columns}>
            <div className={styles.field}>
              <label className={styles.label}>
                1回投与量
                <span className={styles.unit}>(mL)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={volumePerSession}
                onChange={(e) => setVolumePerSession(parseNumericValue(e.target.value))}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                投与間隔
                <span className={styles.unit}>(時間毎)</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={intervalHours}
                onChange={(e) => setIntervalHours(parseNumericValue(e.target.value))}
                className={styles.input}
              />
            </div>
          </div>
        )}

        {scheduleMode === 'bolus' && (
          <div className={styles.columns}>
            <div className={styles.field}>
              <label className={styles.label}>
                1回投与量
                <span className={styles.unit}>(mL)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={volumePerSession}
                onChange={(e) => setVolumePerSession(parseNumericValue(e.target.value))}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                投与間隔
                <span className={styles.unit}>(時間毎)</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={intervalHours}
                onChange={(e) => setIntervalHours(parseNumericValue(e.target.value))}
                className={styles.input}
              />
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className={styles.field}>
        <label className={styles.label}>メモ</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="特記事項があれば記入..."
          className={styles.textarea}
        />
      </div>

      {/* Daily volume summary */}
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>1日あたり推定投与量</span>
        <span className={styles.summaryValue}>{dailyVolume} mL/日</span>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={!isValid}>
          保存
        </Button>
      </div>
    </div>
  );
}
