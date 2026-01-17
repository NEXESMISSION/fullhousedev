export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      forms: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'draft' | 'active' | 'disabled'
          public_url: string
          media_url: string | null
          media_type: 'none' | 'image' | 'video' | 'logo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'draft' | 'active' | 'disabled'
          public_url: string
          media_url?: string | null
          media_type?: 'none' | 'image' | 'video' | 'logo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'draft' | 'active' | 'disabled'
          public_url?: string
          media_url?: string | null
          media_type?: 'none' | 'image' | 'video' | 'logo'
          created_at?: string
          updated_at?: string
        }
      }
      fields: {
        Row: {
          id: string
          form_id: string
          label: string
          type: 'text' | 'number' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'date' | 'location'
          required: boolean
          placeholder: string | null
          options: Json | null
          order: number
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          form_id: string
          label: string
          type: 'text' | 'number' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'date' | 'location'
          required?: boolean
          placeholder?: string | null
          options?: Json | null
          order?: number
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          label?: string
          type?: 'text' | 'number' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'date'
          required?: boolean
          placeholder?: string | null
          options?: Json | null
          order?: number
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          form_id: string
          created_at: string
        }
        Insert: {
          id?: string
          form_id: string
          created_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          created_at?: string
        }
      }
      submission_values: {
        Row: {
          id: string
          submission_id: string
          field_id: string
          value: string
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          field_id: string
          value: string
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          field_id?: string
          value?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      form_status: 'draft' | 'active' | 'disabled'
      field_type: 'text' | 'number' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'date'
    }
  }
}

