import React, { useState } from 'react';
import { Search, Filter, Save, Users, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Student, AttendanceRecord } from '../types';

interface AttendanceMarkingProps {
  students: Student[];
  onMarkAttendance: (records: AttendanceRecord[]) => void;
}

const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({ students, onMarkAttendance }) => {
  const [selectedYear, setSelectedYear] = useState('Year 7');
  const [selectedSubject, setSelectedSubject] = useState('ICT');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  const years = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12'];
  const subjects = ['ICT', 'Mathematics', 'English', 'Science', 'History', 'Geography'];

  const filteredStudents = students.filter(student => 
    student.year === selectedYear &&
    student.subjects.includes(selectedSubject) &&
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleBulkAction = (status: 'present' | 'absent' | 'late') => {
    const newAttendance: Record<string, 'present' | 'absent' | 'late'> = {};
    filteredStudents.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSave = () => {
    const records: AttendanceRecord[] = Object.entries(attendance).map(([studentId, status]) => ({
      id: `${studentId}_${selectedDate}_${selectedSubject}`,
      studentId,
      subjectId: selectedSubject,
      date: selectedDate,
      status,
      markedBy: 'current_teacher',
      markedAt: new Date(),
    }));
    onMarkAttendance(records);
  };

  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0, late: 0, unmarked: 0 };
    filteredStudents.forEach(student => {
      const status = attendance[student.id];
      if (status) {
        counts[status]++;
      } else {
        counts.unmarked++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-600">Select class and mark student attendance</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleBulkAction('present')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Present
          </button>
          <button
            onClick={() => handleBulkAction('absent')}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Mark All Absent
          </button>
          <button
            onClick={() => handleBulkAction('late')}
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Clock className="h-4 w-4 mr-2" />
            Mark All Late
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{statusCounts.present}</div>
          <div className="text-sm text-gray-600">Present</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{statusCounts.absent}</div>
          <div className="text-sm text-gray-600">Absent</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-amber-600">{statusCounts.late}</div>
          <div className="text-sm text-gray-600">Late</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-600">{statusCounts.unmarked}</div>
          <div className="text-sm text-gray-600">Unmarked</div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Students - {selectedYear} {selectedSubject}
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {filteredStudents.length} students
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredStudents.map((student) => (
            <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-500">{student.year}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAttendanceChange(student.id, 'present')}
                    className={`p-2 rounded-lg transition-colors ${
                      attendance[student.id] === 'present'
                        ? 'bg-green-100 text-green-600 ring-2 ring-green-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleAttendanceChange(student.id, 'late')}
                    className={`p-2 rounded-lg transition-colors ${
                      attendance[student.id] === 'late'
                        ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleAttendanceChange(student.id, 'absent')}
                    className={`p-2 rounded-lg transition-colors ${
                      attendance[student.id] === 'absent'
                        ? 'bg-red-100 text-red-600 ring-2 ring-red-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {Object.keys(attendance).length} of {filteredStudents.length} students marked
            </div>
            <button
              onClick={handleSave}
              disabled={Object.keys(attendance).length === 0}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMarking;