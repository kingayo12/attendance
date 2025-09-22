import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, User, BookOpen } from "lucide-react";
import { Student, Subject } from "../types";

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, "id" | "createdAt">) => Promise<{ error: string | null }>;
  onUpdateStudent: (id: string, student: Partial<Student>) => Promise<{ error: string | null }>;
  onDeleteStudent: (id: string) => Promise<{ error: string | null }>;
}

const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    year: "Year 7",
    subjects: [] as string[],
  });

  const years = ["All", "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"];
  const subjects = [
    "ICT",
    "Mathematics",
    "English",
    "Science",
    "History",
    "Geography",
    "Art",
    "PE",
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === "All" || student.year === selectedYear;
    return matchesSearch && matchesYear;
  });

  const handleAddStudent = async () => {
    if (newStudent.name && newStudent.subjects.length > 0) {
      setLoading(true);
      const { error } = await onAddStudent(newStudent);
      setLoading(false);

      if (error) {
        alert("Error adding student: " + error);
      } else {
        setNewStudent({ name: "", year: "Year 7", subjects: [] });
        setShowAddModal(false);
      }
    }
  };

  const handleSubjectToggle = (subject: string, isEditing = false) => {
    if (isEditing && editingStudent) {
      const updatedSubjects = editingStudent.subjects.includes(subject)
        ? editingStudent.subjects.filter((s) => s !== subject)
        : [...editingStudent.subjects, subject];
      setEditingStudent({ ...editingStudent, subjects: updatedSubjects });
    } else {
      const updatedSubjects = newStudent.subjects.includes(subject)
        ? newStudent.subjects.filter((s) => s !== subject)
        : [...newStudent.subjects, subject];
      setNewStudent({ ...newStudent, subjects: updatedSubjects });
    }
  };

  const handleUpdateStudent = async () => {
    if (editingStudent) {
      setLoading(true);
      const { error } = await onUpdateStudent(editingStudent.id, {
        name: editingStudent.name,
        year: editingStudent.year,
        subjects: editingStudent.subjects,
      });
      setLoading(false);

      if (error) {
        alert("Error updating student: " + error);
      } else {
        setEditingStudent(null);
      }
    }
  };

  return (
    <div>
      <div className='mb-8'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Student Management</h1>
            <p className='text-gray-600'>Manage student records and subject enrollments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Plus className='h-4 w-4 mr-2' />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white p-6 rounded-xl shadow-sm border mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Search Students</label>
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search by name...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Filter by Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className='bg-white rounded-xl shadow-sm border'>
        <div className='p-6 border-b'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Students ({filteredStudents.length})
          </h3>
        </div>

        <div className='divide-y divide-gray-200'>
          {filteredStudents.map((student) => (
            <div key={student.id} className='p-6 hover:bg-gray-50 transition-colors'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                    <User className='h-6 w-6 text-blue-600' />
                  </div>
                  <div>
                    <h4 className='text-lg font-medium text-gray-900'>{student.name}</h4>
                    <p className='text-sm text-gray-500'>{student.year}</p>
                    <div className='flex flex-wrap gap-1 mt-2'>
                      {student.subjects.map((subject) => (
                        <span
                          key={subject}
                          className='px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full'
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => setEditingStudent(student)}
                    className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                  >
                    <Edit2 className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() => onDeleteStudent(student.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-xl shadow-xl w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Add New Student</h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Student Name</label>
                <input
                  type='text'
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Enter student name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Year</label>
                <select
                  value={newStudent.year}
                  onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  {years.slice(1).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Subjects</label>
                <div className='grid grid-cols-2 gap-2'>
                  {subjects.map((subject) => (
                    <label key={subject} className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={newStudent.subjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2'
                      />
                      <span className='text-sm text-gray-700'>{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className='flex justify-end space-x-3 mt-6'>
              <button
                onClick={() => setShowAddModal(false)}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                disabled={loading}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                {loading ? "Adding..." : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-xl shadow-xl w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Edit Student</h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Student Name</label>
                <input
                  type='text'
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Year</label>
                <select
                  value={editingStudent.year}
                  onChange={(e) => setEditingStudent({ ...editingStudent, year: e.target.value })}
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  {years.slice(1).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Subjects</label>
                <div className='grid grid-cols-2 gap-2'>
                  {subjects.map((subject) => (
                    <label key={subject} className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={editingStudent.subjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject, true)}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2'
                      />
                      <span className='text-sm text-gray-700'>{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className='flex justify-end space-x-3 mt-6'>
              <button
                onClick={() => setEditingStudent(null)}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStudent}
                disabled={loading}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                {loading ? "Updating..." : "Update Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
