import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Student, Subject, AttendanceRecord, AttendanceStats } from "../types";

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch students
  const fetchStudents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;

      const formattedStudents: Student[] = data.map((student) => ({
        id: student.id,
        name: student.name,
        year: student.year,
        subjects: student.subjects || [],
        createdAt: new Date(student.created_at),
      }));

      setStudents(formattedStudents);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students");
    }
  };

  // Fetch subjects
  const fetchSubjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;

      const formattedSubjects: Subject[] = data.map((subject) => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        year: subject.year,
        description: subject.description,
        academicYear: subject.academic_year,
        term: subject.term,
        roomNumber: subject.room_number,
        scheduleDays: subject.schedule_days || [],
        scheduleTime: subject.schedule_time,
        userId: subject.user_id,
        createdAt: new Date(subject.created_at),
        updatedAt: new Date(subject.updated_at),
      }));

      setSubjects(formattedSubjects);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError("Failed to fetch subjects");
    }
  };

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      const formattedRecords: AttendanceRecord[] = data.map((record) => ({
        id: record.id,
        studentId: record.student_id,
        subjectId: record.subject_id,
        date: record.date,
        status: record.status,
        markedBy: record.marked_by,
        markedAt: new Date(record.created_at),
      }));

      setAttendanceRecords(formattedRecords);
    } catch (err) {
      console.error("Error fetching attendance records:", err);
      setError("Failed to fetch attendance records");
    }
  };

  // Add student
  const addStudent = async (studentData: Omit<Student, "id" | "createdAt">) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { data, error } = await supabase
        .from("students")
        .insert({
          name: studentData.name,
          year: studentData.year,
          subjects: studentData.subjects,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newStudent: Student = {
        id: data.id,
        name: data.name,
        year: data.year,
        subjects: data.subjects || [],
        createdAt: new Date(data.created_at),
      };

      setStudents((prev) => [...prev, newStudent]);
      return { error: null };
    } catch (err) {
      console.error("Error adding student:", err);
      return { error: "Failed to add student" };
    }
  };

  // Add subject
  const addSubject = async (subjectData: Omit<Subject, "id" | "createdAt" | "updatedAt">) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { data, error } = await supabase
        .from("subjects")
        .insert({
          name: subjectData.name,
          code: subjectData.code,
          year: subjectData.year,
          description: subjectData.description,
          academic_year: subjectData.academicYear,
          term: subjectData.term,
          room_number: subjectData.roomNumber,
          schedule_days: subjectData.scheduleDays,
          schedule_time: subjectData.scheduleTime,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newSubject: Subject = {
        id: data.id,
        name: data.name,
        code: data.code,
        year: data.year,
        description: data.description,
        academicYear: data.academic_year,
        term: data.term,
        roomNumber: data.room_number,
        scheduleDays: data.schedule_days || [],
        scheduleTime: data.schedule_time,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setSubjects((prev) => [...prev, newSubject]);
      return { error: null };
    } catch (err) {
      console.error("Error adding subject:", err);
      return { error: "Failed to add subject" };
    }
  };

  // Update subject
  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { data, error } = await supabase
        .from("subjects")
        .update({
          name: updates.name,
          code: updates.code,
          year: updates.year,
          description: updates.description,
          academic_year: updates.academicYear,
          term: updates.term,
          room_number: updates.roomNumber,
          schedule_days: updates.scheduleDays,
          schedule_time: updates.scheduleTime,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setSubjects((prev) =>
        prev.map((subject) => (subject.id === id ? { ...subject, ...updates } : subject)),
      );

      return { error: null };
    } catch (err) {
      console.error("Error updating subject:", err);
      return { error: "Failed to update subject" };
    }
  };

  // Delete subject
  const deleteSubject = async (id: string) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setSubjects((prev) => prev.filter((subject) => subject.id !== id));
      setAttendanceRecords((prev) => prev.filter((record) => record.subjectId !== id));

      return { error: null };
    } catch (err) {
      console.error("Error deleting subject:", err);
      return { error: "Failed to delete subject" };
    }
  };

  // Assign students to subject
  const assignStudentsToSubject = async (subjectId: string, studentIds: string[]) => {
    if (!user) return { error: "No user logged in" };

    try {
      // First, remove existing assignments for this subject
      await supabase
        .from("student_subjects")
        .delete()
        .eq("subject_id", subjectId)
        .eq("user_id", user.id);

      // Then add new assignments
      if (studentIds.length > 0) {
        const assignments = studentIds.map((studentId) => ({
          student_id: studentId,
          subject_id: subjectId,
          user_id: user.id,
        }));

        const { error } = await supabase.from("student_subjects").insert(assignments);

        if (error) throw error;
      }

      return { error: null };
    } catch (err) {
      console.error("Error assigning students to subject:", err);
      return { error: "Failed to assign students to subject" };
    }
  };

  // Update student
  const updateStudent = async (id: string, updates: Partial<Student>) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { data, error } = await supabase
        .from("students")
        .update({
          name: updates.name,
          year: updates.year,
          subjects: updates.subjects,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setStudents((prev) =>
        prev.map((student) => (student.id === id ? { ...student, ...updates } : student)),
      );

      return { error: null };
    } catch (err) {
      console.error("Error updating student:", err);
      return { error: "Failed to update student" };
    }
  };

  // Delete student
  const deleteStudent = async (id: string) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setStudents((prev) => prev.filter((student) => student.id !== id));
      setAttendanceRecords((prev) => prev.filter((record) => record.studentId !== id));

      return { error: null };
    } catch (err) {
      console.error("Error deleting student:", err);
      return { error: "Failed to delete student" };
    }
  };

  // Mark attendance
  const markAttendance = async (records: AttendanceRecord[]) => {
    if (!user) return { error: "No user logged in" };

    try {
      // First, delete existing records for the same date/student/subject combination
      for (const record of records) {
        await supabase
          .from("attendance_records")
          .delete()
          .eq("student_id", record.studentId)
          .eq("subject_id", record.subjectId)
          .eq("date", record.date)
          .eq("user_id", user.id);
      }

      // Then insert new records
      const insertData = records.map((record) => ({
        student_id: record.studentId,
        subject_id: record.subjectId,
        date: record.date,
        status: record.status,
        marked_by: user.id,
        user_id: user.id,
      }));

      const { data, error } = await supabase.from("attendance_records").insert(insertData).select();

      if (error) throw error;

      // Update local state
      const newRecords: AttendanceRecord[] = data.map((record) => ({
        id: record.id,
        studentId: record.student_id,
        subjectId: record.subject_id,
        date: record.date,
        status: record.status,
        markedBy: record.marked_by,
        markedAt: new Date(record.created_at),
      }));

      // Remove old records and add new ones
      setAttendanceRecords((prev) => {
        const filtered = prev.filter(
          (record) =>
            !records.some(
              (newRecord) =>
                newRecord.studentId === record.studentId &&
                newRecord.date === record.date &&
                newRecord.subjectId === record.subjectId,
            ),
        );
        return [...filtered, ...newRecords];
      });

      return { error: null };
    } catch (err) {
      console.error("Error marking attendance:", err);
      return { error: "Failed to mark attendance" };
    }
  };

  // Calculate attendance stats
  const calculateAttendanceStats = (): AttendanceStats => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = attendanceRecords.filter((record) => record.date === today);

    const presentToday = todayRecords.filter((record) => record.status === "present").length;
    const absentToday = todayRecords.filter((record) => record.status === "absent").length;
    const lateToday = todayRecords.filter((record) => record.status === "late").length;

    const totalRecords = attendanceRecords.length;
    const presentTotal = attendanceRecords.filter((record) => record.status === "present").length;

    return {
      totalStudents: students.length,
      presentToday,
      absentToday,
      lateToday,
      attendanceRate: totalRecords > 0 ? (presentTotal / totalRecords) * 100 : 0,
    };
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchStudents(), fetchSubjects(), fetchAttendanceRecords()]).finally(() =>
        setLoading(false),
      );
    }
  }, [user]);

  return {
    students,
    subjects,
    attendanceRecords,
    loading,
    error,
    addStudent,
    addSubject,
    updateStudent,
    updateSubject,
    deleteStudent,
    deleteSubject,
    assignStudentsToSubject,
    markAttendance,
    stats: calculateAttendanceStats(),
    refetch: () => {
      fetchStudents();
      fetchSubjects();
      fetchAttendanceRecords();
    },
  };
};
