import styles from "./VolumeStepper.module.css";

interface VolumeStepperProps {
  readonly label: string;
  readonly value: number;
  readonly step: number;
  readonly min: number;
  readonly max: number;
  readonly unit: string;
  readonly onChange: (value: number) => void;
}

export function VolumeStepper({
  label,
  value,
  step,
  min,
  max,
  unit,
  onChange,
}: VolumeStepperProps) {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = Math.max(min, value - step);
    onChange(next);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = Math.min(max, value + step);
    onChange(next);
  };

  return (
    <div className={styles.stepper}>
      <span className={styles.label}>{label}</span>
      <button
        type="button"
        className={styles.button}
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label={`${label}を減らす`}
      >
        -
      </button>
      <span className={styles.value}>
        {value}
        <span className={styles.unit}>{unit}</span>
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label={`${label}を増やす`}
      >
        +
      </button>
    </div>
  );
}
