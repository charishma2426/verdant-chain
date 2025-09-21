export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      approved_zones: {
        Row: {
          created_at: string
          id: string
          name: string
          polygon: Json
          region: string
          seasonal_restrictions: Json | null
          species_allowed: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          polygon: Json
          region: string
          seasonal_restrictions?: Json | null
          species_allowed: string[]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          polygon?: Json
          region?: string
          seasonal_restrictions?: Json | null
          species_allowed?: string[]
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_events: {
        Row: {
          block_hash: string
          botanical_name: string
          collector_id: string
          coordinates: Json
          created_at: string
          harvest_timestamp: string
          id: string
          is_validated: boolean | null
          merkle_root: string | null
          previous_hash: string | null
          quality_metrics: Json | null
          quantity: number
          species: string
          validator_signature: string | null
          zone_id: string | null
        }
        Insert: {
          block_hash?: string
          botanical_name: string
          collector_id: string
          coordinates: Json
          created_at?: string
          harvest_timestamp: string
          id?: string
          is_validated?: boolean | null
          merkle_root?: string | null
          previous_hash?: string | null
          quality_metrics?: Json | null
          quantity: number
          species: string
          validator_signature?: string | null
          zone_id?: string | null
        }
        Update: {
          block_hash?: string
          botanical_name?: string
          collector_id?: string
          coordinates?: Json
          created_at?: string
          harvest_timestamp?: string
          id?: string
          is_validated?: boolean | null
          merkle_root?: string | null
          previous_hash?: string | null
          quality_metrics?: Json | null
          quantity?: number
          species?: string
          validator_signature?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_events_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "collectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_events_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "approved_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      collectors: {
        Row: {
          approved_zones: string[] | null
          certification_type: string | null
          created_at: string
          email: string
          id: string
          license_number: string
          name: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          approved_zones?: string[] | null
          certification_type?: string | null
          created_at?: string
          email: string
          id?: string
          license_number: string
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          approved_zones?: string[] | null
          certification_type?: string | null
          created_at?: string
          email?: string
          id?: string
          license_number?: string
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: Json | null
          company_type: Database["public"]["Enums"]["user_role"]
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          license_number: string | null
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          company_type: Database["public"]["Enums"]["user_role"]
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          license_number?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          company_type?: Database["public"]["Enums"]["user_role"]
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          license_number?: string | null
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      facilities: {
        Row: {
          certifications: string[] | null
          created_at: string
          facility_type: string
          id: string
          license_number: string
          location: Json
          name: string
          status: string | null
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string
          facility_type: string
          id?: string
          license_number: string
          location: Json
          name: string
          status?: string | null
        }
        Update: {
          certifications?: string[] | null
          created_at?: string
          facility_type?: string
          id?: string
          license_number?: string
          location?: Json
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      herb_batches: {
        Row: {
          batch_code: string
          created_at: string | null
          created_by: string
          dht_data: Json | null
          farmer_company_id: string
          geo_location: Json
          harvest_date: string
          herb_name: string
          herb_type: string
          id: string
          quantity_kg: number
          sample_test_data: Json | null
          soil_moisture: number | null
          status: string | null
          updated_at: string | null
          variety: string | null
        }
        Insert: {
          batch_code: string
          created_at?: string | null
          created_by: string
          dht_data?: Json | null
          farmer_company_id: string
          geo_location: Json
          harvest_date: string
          herb_name: string
          herb_type: string
          id?: string
          quantity_kg: number
          sample_test_data?: Json | null
          soil_moisture?: number | null
          status?: string | null
          updated_at?: string | null
          variety?: string | null
        }
        Update: {
          batch_code?: string
          created_at?: string | null
          created_by?: string
          dht_data?: Json | null
          farmer_company_id?: string
          geo_location?: Json
          harvest_date?: string
          herb_name?: string
          herb_type?: string
          id?: string
          quantity_kg?: number
          sample_test_data?: Json | null
          soil_moisture?: number | null
          status?: string | null
          updated_at?: string | null
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "herb_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "herb_batches_farmer_company_id_fkey"
            columns: ["farmer_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      laboratories: {
        Row: {
          accreditation_number: string
          created_at: string
          id: string
          location: Json
          name: string
          status: string | null
          test_capabilities: string[] | null
        }
        Insert: {
          accreditation_number: string
          created_at?: string
          id?: string
          location: Json
          name: string
          status?: string | null
          test_capabilities?: string[] | null
        }
        Update: {
          accreditation_number?: string
          created_at?: string
          id?: string
          location?: Json
          name?: string
          status?: string | null
          test_capabilities?: string[] | null
        }
        Relationships: []
      }
      manufacturing_records: {
        Row: {
          batch_code: string
          composition_details: Json
          created_at: string | null
          created_by: string
          final_product_quantity: number
          id: string
          manufacturing_company_id: string
          manufacturing_date: string
          product_name: string
          product_type: string
          sensor_data: Json | null
          status: string | null
          test_result_ids: string[]
          total_herb_quantity_used_kg: number
          updated_at: string | null
        }
        Insert: {
          batch_code: string
          composition_details: Json
          created_at?: string | null
          created_by: string
          final_product_quantity: number
          id?: string
          manufacturing_company_id: string
          manufacturing_date: string
          product_name: string
          product_type: string
          sensor_data?: Json | null
          status?: string | null
          test_result_ids: string[]
          total_herb_quantity_used_kg: number
          updated_at?: string | null
        }
        Update: {
          batch_code?: string
          composition_details?: Json
          created_at?: string | null
          created_by?: string
          final_product_quantity?: number
          id?: string
          manufacturing_company_id?: string
          manufacturing_date?: string
          product_name?: string
          product_type?: string
          sensor_data?: Json | null
          status?: string | null
          test_result_ids?: string[]
          total_herb_quantity_used_kg?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturing_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturing_records_manufacturing_company_id_fkey"
            columns: ["manufacturing_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      packaged_products: {
        Row: {
          cost_breakdown: Json | null
          created_at: string | null
          expiry_date: string | null
          final_status: string | null
          id: string
          manufacturing_record_id: string
          package_details: Json
          packaged_by: string
          packaging_company_id: string
          packaging_date: string
          product_qr_code: string
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          cost_breakdown?: Json | null
          created_at?: string | null
          expiry_date?: string | null
          final_status?: string | null
          id?: string
          manufacturing_record_id: string
          package_details: Json
          packaged_by: string
          packaging_company_id: string
          packaging_date: string
          product_qr_code: string
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          cost_breakdown?: Json | null
          created_at?: string | null
          expiry_date?: string | null
          final_status?: string | null
          id?: string
          manufacturing_record_id?: string
          package_details?: Json
          packaged_by?: string
          packaging_company_id?: string
          packaging_date?: string
          product_qr_code?: string
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packaged_products_manufacturing_record_id_fkey"
            columns: ["manufacturing_record_id"]
            isOneToOne: false
            referencedRelation: "manufacturing_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packaged_products_packaged_by_fkey"
            columns: ["packaged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packaged_products_packaging_company_id_fkey"
            columns: ["packaging_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_steps: {
        Row: {
          block_hash: string
          collection_event_id: string
          created_at: string
          end_timestamp: string | null
          environmental_conditions: Json | null
          facility_id: string
          id: string
          is_validated: boolean | null
          operator_id: string
          parameters: Json | null
          previous_hash: string
          start_timestamp: string
          step_type: string
        }
        Insert: {
          block_hash?: string
          collection_event_id: string
          created_at?: string
          end_timestamp?: string | null
          environmental_conditions?: Json | null
          facility_id: string
          id?: string
          is_validated?: boolean | null
          operator_id: string
          parameters?: Json | null
          previous_hash?: string
          start_timestamp: string
          step_type: string
        }
        Update: {
          block_hash?: string
          collection_event_id?: string
          created_at?: string
          end_timestamp?: string | null
          environmental_conditions?: Json | null
          facility_id?: string
          id?: string
          is_validated?: boolean | null
          operator_id?: string
          parameters?: Json | null
          previous_hash?: string
          start_timestamp?: string
          step_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "processing_steps_collection_event_id_fkey"
            columns: ["collection_event_id"]
            isOneToOne: false
            referencedRelation: "collection_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_steps_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      provenance_bundles: {
        Row: {
          batch_number: string
          block_hash: string
          collection_events: string[]
          created_at: string
          expiry_date: string
          final_product_data: Json
          id: string
          is_finalized: boolean | null
          manufacturing_date: string
          merkle_root: string
          processing_steps: string[]
          product_name: string
          qr_code: string
          quality_tests: string[]
        }
        Insert: {
          batch_number: string
          block_hash?: string
          collection_events: string[]
          created_at?: string
          expiry_date: string
          final_product_data: Json
          id?: string
          is_finalized?: boolean | null
          manufacturing_date: string
          merkle_root?: string
          processing_steps: string[]
          product_name: string
          qr_code: string
          quality_tests: string[]
        }
        Update: {
          batch_number?: string
          block_hash?: string
          collection_events?: string[]
          created_at?: string
          expiry_date?: string
          final_product_data?: Json
          id?: string
          is_finalized?: boolean | null
          manufacturing_date?: string
          merkle_root?: string
          processing_steps?: string[]
          product_name?: string
          qr_code?: string
          quality_tests?: string[]
        }
        Relationships: []
      }
      quality_tests: {
        Row: {
          block_hash: string
          certificate_hash: string
          collection_event_id: string | null
          created_at: string
          id: string
          lab_id: string
          passed: boolean
          previous_hash: string
          processing_step_id: string | null
          test_result: Json
          test_timestamp: string
          test_type: string
          threshold_max: number | null
          threshold_min: number | null
        }
        Insert: {
          block_hash?: string
          certificate_hash: string
          collection_event_id?: string | null
          created_at?: string
          id?: string
          lab_id: string
          passed?: boolean
          previous_hash?: string
          processing_step_id?: string | null
          test_result: Json
          test_timestamp: string
          test_type: string
          threshold_max?: number | null
          threshold_min?: number | null
        }
        Update: {
          block_hash?: string
          certificate_hash?: string
          collection_event_id?: string | null
          created_at?: string
          id?: string
          lab_id?: string
          passed?: boolean
          previous_hash?: string
          processing_step_id?: string | null
          test_result?: Json
          test_timestamp?: string
          test_type?: string
          threshold_max?: number | null
          threshold_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_tests_collection_event_id_fkey"
            columns: ["collection_event_id"]
            isOneToOne: false
            referencedRelation: "collection_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_tests_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "laboratories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_tests_processing_step_id_fkey"
            columns: ["processing_step_id"]
            isOneToOne: false
            referencedRelation: "processing_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          batch_qr_code: string
          created_at: string | null
          herb_batch_id: string
          id: string
          manufacturing_company_id: string | null
          quality_grade: string
          quantity_approved_kg: number
          quantity_received_kg: number
          quantity_wasted_kg: number
          status: string | null
          test_date: string
          test_parameters: Json
          tested_by: string
          testing_company_id: string
          updated_at: string | null
        }
        Insert: {
          batch_qr_code: string
          created_at?: string | null
          herb_batch_id: string
          id?: string
          manufacturing_company_id?: string | null
          quality_grade: string
          quantity_approved_kg: number
          quantity_received_kg: number
          quantity_wasted_kg: number
          status?: string | null
          test_date: string
          test_parameters: Json
          tested_by: string
          testing_company_id: string
          updated_at?: string | null
        }
        Update: {
          batch_qr_code?: string
          created_at?: string | null
          herb_batch_id?: string
          id?: string
          manufacturing_company_id?: string | null
          quality_grade?: string
          quantity_approved_kg?: number
          quantity_received_kg?: number
          quantity_wasted_kg?: number
          status?: string | null
          test_date?: string
          test_parameters?: Json
          tested_by?: string
          testing_company_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_results_herb_batch_id_fkey"
            columns: ["herb_batch_id"]
            isOneToOne: false
            referencedRelation: "herb_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_manufacturing_company_id_fkey"
            columns: ["manufacturing_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_tested_by_fkey"
            columns: ["tested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_testing_company_id_fkey"
            columns: ["testing_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_block_hash: {
        Args: { data: Json; previous_hash?: string }
        Returns: string
      }
      get_user_company_id: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      validate_geofencing: {
        Args: { coordinates: Json; harvest_date: string; species: string }
        Returns: string
      }
      validate_quality_threshold: {
        Args: {
          test_result: Json
          test_type: string
          threshold_max?: number
          threshold_min?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "admin"
        | "farmer"
        | "testing_unit"
        | "manufacturing_unit"
        | "packaging_unit"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: [
        "admin",
        "farmer",
        "testing_unit",
        "manufacturing_unit",
        "packaging_unit",
      ],
    },
  },
} as const
