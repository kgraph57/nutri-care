import { Patient, Food } from '../types';

// サンプル患者データ
export const samplePatients: Patient[] = [
  {
    id: 'P001',
    name: '田中 太郎',
    age: 65,
    gender: '男性',
    ward: 'ICU-1',
    admissionDate: '2024-01-15',
    dischargeDate: '',
    patientType: 'ICU',
    weight: 70,
    height: 170,
    diagnosis: '急性心筋梗塞',
    allergies: ['ペニシリン'],
    medications: ['アスピリン', 'スタチン'],
    notes: '循環器系の管理が必要'
  },
  {
    id: 'P002',
    name: '佐藤 花子',
    age: 45,
    gender: '女性',
    ward: 'PICU-1',
    admissionDate: '2024-01-16',
    dischargeDate: '',
    patientType: 'PICU',
    weight: 25,
    height: 120,
    diagnosis: '重症肺炎',
    allergies: [],
    medications: ['抗生物質'],
    notes: '呼吸器系の管理が必要'
  }
];

// サンプル食品データ
export const sampleFoods: Food[] = [
  {
    id: 'F001',
    name: '白米',
    category: '穀類',
    energy: 168,
    protein: 2.5,
    fat: 0.3,
    carbs: 37.1
  },
  {
    id: 'F002',
    name: '鶏胸肉',
    category: '肉類',
    energy: 165,
    protein: 22.3,
    fat: 7.2,
    carbs: 0
  },
  {
    id: 'F003',
    name: 'ブロッコリー',
    category: '野菜',
    energy: 33,
    protein: 4.3,
    fat: 0.3,
    carbs: 5.2
  }
];




