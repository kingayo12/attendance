import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Student, AttendanceRecord, AttendanceStats } from '../types';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch students
  const fetchStudents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      const formattedStudents: Student[] = data.map(student => ({
        id: student.id,
        name: student.name,
        year: student.year,
        subjects: student.subjects || [],
        createdAt: new Date(student.created_at),
      }));

      setStudents(formattedStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
    }
  };

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedRecords: AttendanceRecord[] = data.map(record => ({
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
      console.error('Error fetching attendance records:', err);
      setError('Failed to fetch attendance records');
    }
  };

  // Add student
  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('students')
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

      setStudents(prev => [...prev, newStudent]);
      return { error: null };
    } catch (err) {
      console.error('Error adding student:', err);
      return { error: 'Failed to add student' };
    }
  };

  // Update student
  const updateStudent = async (id: string, updates: Partial<Student>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          name: updates.name,
          year: updates.year,
          subjects: updates.subjects,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => prev.map(student => 
        student.id === id 
          ? { ...student, ...updates }
          : student
      ));

      return { error: null };
    } catch (err) {
      console.error('Error updating student:', err);
      return { error: 'Failed to update student' };
    }
  };

  // Delete student
  const deleteStudent = async (id: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setStudents(prev => prev.filter(student => student.id !== id));
      setAttendanceRecords(prev => prev.filter(record => record.studentId !== id));

      return { error: null };
    } catch (err) {
      console.error('Error deleting student:', err);
      return { error: 'Failed to delete student' };
    }
  };

  // Mark attendance
  const markAttendance = async (records: AttendanceRecord[]) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // First, delete existing records for the same date/student/subject combination
      for (const record of records) {
        await supabase
          .from('attendance_records')
          .delete()
          .eq('student_id', record.studentId)
          .eq('subject_id', record.subjectId)
          .eq('date', record.date)
          .eq('user_id', user.id);
      }

      // Then insert new records
      const insertData = records.map(record => ({
        student_id: record.studentId,
        subject_id: record.subjectId,
        date: record.date,
        status: record.status,
        marked_by: user.id,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('attendance_records')
        .insert(insertData)
        .select();

      if (error) throw error;

      // Update local state
      const newRecords: AttendanceRecord[] = data.map(record => ({
        id: record.id,
        studentId: record.student_id,
        subjectId: record.subject_id,
        date: record.date,
        status: record.status,
        markedBy: record.marked_by,
        markedAt: new Date(record.created_at),
      }));

      // Remove old records and add new ones
      setAttendanceRecords(prev => {
        const filtered = prev.filter(record => 
          !records.some(newRecord => 
            newRecord.studentId === record.studentId &&
            newRecord.date === record.date &&
            newRecord.subjectId === record.subjectId
          )
        );
        return [...filtered, ...newRecords];
      });

      return { error: null };
    } catch (err) {
      console.error('Error marking attendance:', err);
      return { error: 'Failed to mark attendance' };
    }
  };

  // Calculate attendance stats
  const calculateAttendanceStats = (): AttendanceStats => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter(record => record.date === today);
    
    const presentToday = todayRecords.filter(record => record.status === 'present').length;
    const absentToday = todayRecords.filter(record => record.status === 'absent').length;
    const lateToday = todayRecords.filter(record => record.status === 'late').length;
    
    const totalRecords = attendanceRecords.length;
    const presentTotal = attendanceRecords.filter(record => record.status === 'present').length;
    
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
      Promise.all([fetchStudents(), fetchAttendanceRecords()])
        .finally(() => setLoading(false));
    }
  }, [user]);

  return {
    students,
    attendanceRecords,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    markAttendance,
    stats: calculateAttendanceStats(),
    refetch: () => {
      fetchStudents();
      fetchAttendanceRecords();
    },
  };
};