import type { LabData, LabInterpretation, LabStatus, LabReference } from '../types/labData';
import { LAB_REFERENCES } from '../types/labData';

function determineStatus(
  value: number,
  ref: LabReference
): LabStatus {
  if (ref.criticalLow !== undefined && value < ref.criticalLow) return 'critical-low';
  if (ref.criticalHigh !== undefined && value > ref.criticalHigh) return 'critical-high';
  if (value < ref.normalMin) return 'low';
  if (value > ref.normalMax) return 'high';
  return 'normal';
}

function buildMessage(
  label: string,
  value: number,
  unit: string,
  status: LabStatus
): string {
  switch (status) {
    case 'critical-low':
      return `${label} ${value} ${unit}: 重症低値。早急な対応が必要です`;
    case 'critical-high':
      return `${label} ${value} ${unit}: 重症高値。早急な対応が必要です`;
    case 'low':
      return `${label} ${value} ${unit}: 低値。補正を検討してください`;
    case 'high':
      return `${label} ${value} ${unit}: 高値。制限・調整を検討してください`;
    case 'normal':
      return `${label} ${value} ${unit}: 正常範囲`;
  }
}

export function analyzeLabData(labData: LabData): readonly LabInterpretation[] {
  const interpretations: LabInterpretation[] = [];

  for (const ref of LAB_REFERENCES) {
    const value = labData[ref.key];
    if (value === undefined || value === null) continue;

    const status = determineStatus(value, ref);
    interpretations.push({
      parameter: ref.key,
      label: ref.label,
      value,
      unit: ref.unit,
      status,
      message: buildMessage(ref.label, value, ref.unit, status),
      normalRange: `${ref.normalMin}–${ref.normalMax}`,
    });
  }

  return interpretations;
}

export function getAbnormalFindings(
  interpretations: readonly LabInterpretation[]
): readonly LabInterpretation[] {
  return interpretations.filter((i) => i.status !== 'normal');
}

export function hasCriticalValues(
  interpretations: readonly LabInterpretation[]
): boolean {
  return interpretations.some(
    (i) => i.status === 'critical-high' || i.status === 'critical-low'
  );
}
