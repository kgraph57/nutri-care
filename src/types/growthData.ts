// 小児成長モニタリングの型定義

export type GrowthStandard = 'who' | 'japanese';

export type GrowthMeasurementType =
  | 'weight'
  | 'height'
  | 'headCircumference'
  | 'bmi';

export type Gender = 'male' | 'female';

export interface GrowthMeasurement {
  readonly id: string;
  readonly patientId: string;
  readonly date: string;                    // ISO date string
  readonly weight: number;                  // kg
  readonly height?: number;                 // cm（毎日計測されない場合あり）
  readonly headCircumference?: number;      // cm（3歳未満の乳幼児）
  readonly notes?: string;
}

export interface GrowthPercentile {
  readonly measurement: GrowthMeasurementType;
  readonly value: number;                   // 実測値
  readonly percentile: number;              // 0-100
  readonly zScore: number;
  readonly ageInMonths: number;
  readonly gender: Gender;
  readonly standard: GrowthStandard;
}

export interface GrowthTrend {
  readonly measurements: readonly GrowthMeasurement[];
  readonly weightPercentiles: readonly GrowthPercentile[];
  readonly heightPercentiles: readonly GrowthPercentile[];
  readonly headPercentiles: readonly GrowthPercentile[];
  readonly weightVelocity: number;          // g/day
  readonly catchUpGrowth: boolean;
  readonly falteringGrowth: boolean;
}

export interface GrowthChartPoint {
  readonly ageInMonths: number;
  readonly value: number;
  readonly percentile?: number;
}

/** LMS法パラメータ（成長曲線のパーセンタイル算出用） */
export interface LMSParams {
  readonly age: number;                     // months
  readonly L: number;                       // Box-Cox power
  readonly M: number;                       // median
  readonly S: number;                       // coefficient of variation
}
