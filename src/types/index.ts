export interface Student {
  id: string;
  name: string;
  year: string;
  subjects: string[];
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  year: string;
  teacherId?: string;
  students: string[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  markedAt: Date;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  role: 'teacher' | 'admin';
}

export interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceRate: number;
}