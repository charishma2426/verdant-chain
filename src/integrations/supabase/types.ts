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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_block_hash: {
        Args: { data: Json; previous_hash?: string }
        Returns: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
