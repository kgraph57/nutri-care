export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          user_id: string
          name: string
          age: number
          gender: string
          ward: string
          admission_date: string
          discharge_date: string
          patient_type: string
          weight: number
          height: number
          diagnosis: string
          allergies: string[]
          medications: string[]
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['patients']['Row'],
          'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['patients']['Insert']>
      }
      nutrition_menus: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          patient_name: string
          nutrition_type: 'enteral' | 'parenteral'
          menu_name: string
          items: Array<{
            id: string
            product_name: string
            manufacturer: string
            volume: number
            frequency: number
          }>
          total_energy: number
          total_volume: number
          requirements: Record<string, number> | null
          current_intake: Record<string, number>
          notes: string
          activity_level: string
          stress_level: string
          medical_condition: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['nutrition_menus']['Row'],
          'created_at' | 'updated_at'
        >
        Update: Partial<
          Database['public']['Tables']['nutrition_menus']['Insert']
        >
      }
    }
  }
}
