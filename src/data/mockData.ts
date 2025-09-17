import { Student, AttendanceRecord, AttendanceStats } from '../types';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Adewale James',
    year: 'Year 7',
    subjects: ['ICT', 'Mathematics', 'English'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Mary Johnson',
    year: 'Year 7',
    subjects: ['ICT', 'Science', 'English'],
    createdAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    name: 'David Thompson',
    year: 'Year 8',
    subjects: ['Mathematics', 'Science', 'Geography'],
    createdAt: new Date('2024-01-17'),
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    year: 'Year 9',
    subjects: ['ICT', 'Art', 'History'],
    createdAt: new Date('2024-01-18'),
  },
  {
    id: '5',
    name: 'Michael Brown',
    year: 'Year 10',
    subjects: ['Mathematics', 'Science', 'PE'],
    createdAt: new Date('2024-01-19'),
  },
  {
    id: '6',
    name: 'Emma Davis',
    year: 'Year 11',
    subjects: ['English', 'History', 'Art'],
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '7',
    name: 'James Miller',
    year: 'Year 12',
    subjects: ['Mathematics', 'Science', 'Geography'],
    createdAt: new Date('2024-01-21'),
  },
  {
    id: '8',
    name: 'Lisa Garcia',
    year: 'Year 7',
    subjects: ['ICT', 'Mathematics', 'PE'],
    createdAt: new Date('2024-01-22'),
  },
];

// Generate mock attendance records for the past month
export const generateMockAttendanceRecords = (students: Student[]): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const subjects = ['ICT', 'Mathematics', 'English', 'Science', 'History', 'Geography', 'Art', 'PE'];
  
  // Generate records for the past 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    students.forEach(student => {
      student.subjects.forEach(subject => {
        // 85% chance of being present, 10% absent, 5% late
        const rand = Math.random();
        let status: 'present' | 'absent' | 'late';
        if (rand < 0.85) {
          status = 'present';
        } else if (rand < 0.95) {
          status = 'absent';
        } else {
          status = 'late';
        }
        
        records.push({
          id: `${student.id}_${dateString}_${subject}`,
          studentId: student.id,
          subjectId: subject,
          date: dateString,
          status,
          markedBy: 'teacher_1',
          markedAt: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000), // Random time during school day
        });
      });
    });
  }
  
  return records;
};

export const mockAttendanceRecords = generateMockAttendanceRecords(mockStudents);

export const calculateAttendanceStats = (
  students: Student[],
  attendanceRecords: AttendanceRecord[]
): AttendanceStats => {
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