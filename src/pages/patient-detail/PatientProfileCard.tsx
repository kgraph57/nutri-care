import { useMemo } from "react";
import { MapPin, Calendar, Stethoscope, User } from "lucide-react";
import { Card, Badge } from "../../components/ui";
import {
  calculateBMI,
  bmiCategory,
  calculateBSA,
  calculateIBW,
} from "../../utils/bodyMetrics";
import type { Patient } from "../../types";
import styles from "./PatientProfileCard.module.css";

interface PatientProfileCardProps {
  readonly patient: Patient;
  readonly daysAdmitted: number;
}

interface BodyMetrics {
  readonly bmi: number;
  readonly bmiCat: string;
  readonly bsa: number;
  readonly ibw: number;
  readonly hasValidInputs: boolean;
}

function computeBodyMetrics(patient: Patient): BodyMetrics {
  const hasValidInputs = patient.weight > 0 && patient.height > 0;
  const bmi = calculateBMI(patient.weight, patient.height);
  const bmiCat = bmiCategory(bmi);
  const bsa = calculateBSA(patient.weight, patient.height);
  const ibw = calculateIBW(patient.height, patient.gender);

  return { bmi, bmiCat, bsa, ibw, hasValidInputs };
}

function bmiCategoryClass(category: string): string {
  if (category === "低体重") return styles.bmiUnderweight;
  if (category === "普通体重") return styles.bmiNormal;
  if (category === "肥満(1度)") return styles.bmiOverweight;
  if (category === "肥満(2度以上)") return styles.bmiObese;
  return "";
}

function formatAdmissionDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

function truncateNotes(notes: string, maxLength: number): string {
  if (notes.length <= maxLength) return notes;
  return `${notes.slice(0, maxLength)}...`;
}

/* ---- Sub-components ---- */

interface MetricCardProps {
  readonly label: string;
  readonly value: number;
  readonly unit: string;
  readonly hasValidInputs: boolean;
  readonly children?: React.ReactNode;
}

function MetricCard({
  label,
  value,
  unit,
  hasValidInputs,
  children,
}: MetricCardProps) {
  return (
    <div className={styles.metricCard}>
      <span className={styles.metricLabel}>{label}</span>
      {hasValidInputs && value > 0 ? (
        <>
          <span className={styles.metricValue}>
            {value}
            <span className={styles.metricUnit}> {unit}</span>
          </span>
          {children}
        </>
      ) : (
        <span className={styles.metricEmpty}>未入力</span>
      )}
    </div>
  );
}

interface DemographicsZoneProps {
  readonly patient: Patient;
  readonly daysAdmitted: number;
}

function DemographicsZone({ patient, daysAdmitted }: DemographicsZoneProps) {
  return (
    <div className={styles.demographics}>
      <h2 className={styles.patientName}>{patient.name}</h2>

      <div className={styles.metaRow}>
        <span className={styles.metaItem}>
          <User size={14} />
          {patient.age}歳
        </span>
        <span className={styles.metaItem}>{patient.gender}</span>
        <span className={styles.metaItem}>
          <MapPin size={14} />
          {patient.ward}
        </span>
        <span className={styles.metaItem}>
          <Calendar size={14} />
          {formatAdmissionDate(patient.admissionDate)} (Day {daysAdmitted})
        </span>
        {patient.diagnosis && (
          <span className={styles.metaItem}>
            <Stethoscope size={14} />
            {patient.diagnosis}
          </span>
        )}
      </div>

      <div className={styles.patientTypeBadge}>
        <Badge variant="info">{patient.patientType}</Badge>
      </div>
    </div>
  );
}

interface BodyMetricsZoneProps {
  readonly patient: Patient;
  readonly metrics: BodyMetrics;
}

function BodyMetricsZone({ patient, metrics }: BodyMetricsZoneProps) {
  const { bmi, bmiCat, bsa, ibw, hasValidInputs } = metrics;

  return (
    <div className={styles.bodyMetrics}>
      <MetricCard
        label="身長"
        value={patient.height}
        unit="cm"
        hasValidInputs={patient.height > 0}
      />
      <MetricCard
        label="体重"
        value={patient.weight}
        unit="kg"
        hasValidInputs={patient.weight > 0}
      />
      <MetricCard label="BMI" value={bmi} unit="" hasValidInputs={hasValidInputs}>
        {bmiCat && (
          <span
            className={`${styles.bmiCategoryBadge} ${bmiCategoryClass(bmiCat)}`}
          >
            {bmiCat}
          </span>
        )}
      </MetricCard>
      <MetricCard
        label="BSA"
        value={bsa}
        unit="m²"
        hasValidInputs={hasValidInputs}
      />
      <MetricCard
        label="IBW"
        value={ibw}
        unit="kg"
        hasValidInputs={patient.height > 0}
      />
    </div>
  );
}

interface ClinicalContextZoneProps {
  readonly allergies: readonly string[];
  readonly medications: readonly string[];
  readonly notes: string;
}

const MAX_VISIBLE_MEDICATIONS = 5;
const MAX_NOTES_LENGTH = 80;

function ClinicalContextZone({
  allergies,
  medications,
  notes,
}: ClinicalContextZoneProps) {
  const visibleMedications = medications.slice(0, MAX_VISIBLE_MEDICATIONS);
  const remainingCount = medications.length - MAX_VISIBLE_MEDICATIONS;

  return (
    <div className={styles.clinicalContext}>
      {/* Allergies */}
      <div className={styles.contextSection}>
        <span className={styles.contextLabel}>アレルギー</span>
        {allergies.length > 0 ? (
          <div className={styles.pillList}>
            {allergies.map((allergy) => (
              <Badge key={allergy} variant="danger">
                {allergy}
              </Badge>
            ))}
          </div>
        ) : (
          <span className={styles.noneText}>なし</span>
        )}
      </div>

      {/* Medications */}
      <div className={styles.contextSection}>
        <span className={styles.contextLabel}>薬剤</span>
        {medications.length > 0 ? (
          <div className={styles.pillList}>
            {visibleMedications.map((med) => (
              <Badge key={med} variant="info">
                {med}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="neutral">+{remainingCount}</Badge>
            )}
          </div>
        ) : (
          <span className={styles.noneText}>なし</span>
        )}
      </div>

      {/* Notes */}
      {notes && (
        <div className={styles.contextSection}>
          <span className={styles.contextLabel}>備考</span>
          <p className={styles.notesText}>
            {truncateNotes(notes, MAX_NOTES_LENGTH)}
          </p>
        </div>
      )}
    </div>
  );
}

/* ---- Main component ---- */

export function PatientProfileCard({
  patient,
  daysAdmitted,
}: PatientProfileCardProps) {
  const metrics = useMemo(() => computeBodyMetrics(patient), [patient]);

  return (
    <Card>
      <div className={styles.profileGrid}>
        <DemographicsZone patient={patient} daysAdmitted={daysAdmitted} />
        <BodyMetricsZone patient={patient} metrics={metrics} />
        <ClinicalContextZone
          allergies={patient.allergies}
          medications={patient.medications}
          notes={patient.notes}
        />
      </div>
    </Card>
  );
}
