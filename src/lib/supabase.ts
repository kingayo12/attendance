import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "teacher" | "admin";
          school_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: "teacher" | "admin";
          school_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: "teacher" | "admin";
          school_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          name: string;
          year: string;
          subjects: string[];
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          year: string;
          subjects: string[];
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          year?: string;
          subjects?: string[];
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          code: string;
          year: string; // ✅ keep only this
          description: string;
          academic_year: string;
          term: string;
          room_number: string;
          schedule_days: string[];
          schedule_time: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          year: string; // ✅ keep only this
          description?: string;
          academic_year?: string;
          term: string;
          room_number?: string;
          schedule_days?: string[];
          schedule_time?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          year?: string; // ✅ keep only this
          description?: string;
          academic_year?: string;
          term?: string;
          room_number?: string;
          schedule_days?: string[];
          schedule_time?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      student_subjects: {
        Row: {
          id: string;
          student_id: string;
          subject_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          subject_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          subject_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          school_year: string;
          default_year_level: string;
          attendance_reminder_time: string;
          email_notifications: boolean;
          theme: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          school_year?: string;
          default_year_level?: string;
          attendance_reminder_time?: string;
          email_notifications?: boolean;
          theme?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          school_year?: string;
          default_year_level?: string;
          attendance_reminder_time?: string;
          email_notifications?: boolean;
          theme?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          student_id: string;
          subject_id: string;
          date: string;
          status: "present" | "absent" | "late";
          marked_by: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          subject_id: string;
          date: string;
          status: "present" | "absent" | "late";
          marked_by: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          subject_id?: string;
          date?: string;
          status?: "present" | "absent" | "late";
          marked_by?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
