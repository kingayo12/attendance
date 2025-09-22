import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  Clock,
  MapPin,
  Users,
  Calendar,
} from "lucide-react";
import { Subject, Student } from "../types";

interface SubjectManagementProps {
  students: Student[];
  subjects: Subject[];
  onAddSubject: (
    subject: Omit<Subject, "id" | "createdAt" | "updatedAt">,
  ) => Promise<{ error: string | null }>;
  onUpdateSubject: (id: string, subject: Partial<Subject>) => Promise<{ error: string | null }>;
  onDeleteSubject: (id: string) => Promise<{ error: string | null }>;
  onAssignStudents: (subjectId: string, studentIds: string[]) => Promise<{ error: string | null }>;
}

const SubjectManagement: React.FC<SubjectManagementProps> = ({
  students,
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onAssignStudents,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [assigningSubject, setAssigningSubject] = useState<Subject | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    year: "Year 7",
    description: "",
    academicYear: "2024-2025",
    term: "1st Term",
    roomNumber: "",
    scheduleDays: [] as string[],
    scheduleTime: "",
    userId: "",
  });

  const years = ["All", "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"];
  const commonSubjects = [
    "Mathematics",
    "English",
    "Science",
    "History",
    "Geography",
    "ICT",
    "Art",
    "Music",
    "Physical Education",
    "Drama",
    "Languages",
    "Business Studies",
  ];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const terms = ["1st Term", "2nd Term", "3rd Term", "Full Session"];

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === "All" || subject.year === selectedYear;
    return matchesSearch && matchesYear;
  });

  const handleAddSubject = async () => {
    if (newSubject.name && newSubject.code) {
      setLoading(true);
      const { error } = await onAddSubject(newSubject);
      setLoading(false);

      if (error) {
        alert("Error adding subject: " + error);
      } else {
        setNewSubject({
          name: "",
          code: "",
          year: "Year 7",
          description: "",
          academicYear: "2024-2025",
          term: "1st Term",
          roomNumber: "",
          scheduleDays: [],
          scheduleTime: "",
          userId: "",
        });

        setShowAddModal(false);
      }
    }
  };

  const handleUpdateSubject = async () => {
    if (editingSubject) {
      setLoading(true);
      const { error } = await onUpdateSubject(editingSubject.id, {
        name: editingSubject.name,
        code: editingSubject.code,
        year: editingSubject.year,
        description: editingSubject.description,
        academicYear: editingSubject.academicYear,
        term: editingSubject.term,
        roomNumber: editingSubject.roomNumber,
        scheduleDays: editingSubject.scheduleDays,
        scheduleTime: editingSubject.scheduleTime,
      });

      setLoading(false);

      if (error) {
        alert("Error updating subject: " + error);
      } else {
        setEditingSubject(null);
      }
    }
  };

  const handleAssignStudents = async () => {
    if (assigningSubject) {
      setLoading(true);
      const { error } = await onAssignStudents(assigningSubject.id, selectedStudents);
      setLoading(false);

      if (error) {
        alert("Error assigning students: " + error);
      } else {
        setAssigningSubject(null);
        setSelectedStudents([]);
        setShowAssignModal(false);
      }
    }
  };

  const handleDayToggle = (day: string, isEditing = false) => {
    if (isEditing && editingSubject) {
      const updatedDays = editingSubject.scheduleDays.includes(day)
        ? editingSubject.scheduleDays.filter((d) => d !== day)
        : [...editingSubject.scheduleDays, day];
      setEditingSubject({ ...editingSubject, scheduleDays: updatedDays });
    } else {
      const updatedDays = newSubject.scheduleDays.includes(day)
        ? newSubject.scheduleDays.filter((d) => d !== day)
        : [...newSubject.scheduleDays, day];
      setNewSubject({ ...newSubject, scheduleDays: updatedDays });
    }
  };

  const openAssignModal = (subject: Subject) => {
    setAssigningSubject(subject);
    // Get currently assigned students for this subject
    const assignedStudents = students
      .filter((student) => student.subjects.includes(subject.id))
      .map((student) => student.id);
    setSelectedStudents(assignedStudents);
    setShowAssignModal(true);
  };

  const getStudentCount = (subjectId: string) => {
    return students.filter((student) => student.subjects.includes(subjectId)).length;
  };

  return (
    <div>
      <div className='mb-8'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Subject Management</h1>
            <p className='text-gray-600'>Manage subjects, schedules, and student assignments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Plus className='h-4 w-4 mr-2' />
            Add Subject
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white p-6 rounded-xl shadow-sm border mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Search Subjects</label>
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search by name or code...'
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

      {/* Subjects Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredSubjects.map((subject) => (
          <div
            key={subject.id}
            className='bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow'
          >
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center'>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3'>
                  <BookOpen className='h-6 w-6 text-blue-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>{subject.name}</h3>
                  <p className='text-sm text-gray-500'>{subject.code}</p>
                </div>
              </div>
              <div className='flex items-center space-x-1'>
                <button
                  onClick={() => setEditingSubject(subject)}
                  className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                >
                  <Edit2 className='h-4 w-4' />
                </button>
                <button
                  onClick={() => onDeleteSubject(subject.id)}
                  className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center text-sm text-gray-600'>
                <Calendar className='h-4 w-4 mr-2' />
                <span>
                  {subject.year} • {subject.term}
                </span>
              </div>

              {subject.roomNumber && (
                <div className='flex items-center text-sm text-gray-600'>
                  <MapPin className='h-4 w-4 mr-2' />
                  <span>Room {subject.roomNumber}</span>
                </div>
              )}

              {subject.scheduleTime && (
                <div className='flex items-center text-sm text-gray-600'>
                  <Clock className='h-4 w-4 mr-2' />
                  <span>{subject.scheduleTime}</span>
                </div>
              )}

              {subject.scheduleDays.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {subject.scheduleDays.map((day) => (
                    <span
                      key={day}
                      className='px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full'
                    >
                      {day.slice(0, 3)}
                    </span>
                  ))}
                </div>
              )}

              <div className='flex items-center justify-between pt-3 border-t'>
                <div className='flex items-center text-sm text-gray-600'>
                  <Users className='h-4 w-4 mr-1' />
                  <span>{getStudentCount(subject.id)} students</span>
                </div>
                <button
                  onClick={() => openAssignModal(subject)}
                  className='text-sm text-blue-600 hover:text-blue-700 font-medium'
                >
                  Assign Students
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Add New Subject</h3>
            <div className='p-6 overflow-y-auto flex-1'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Subject Name
                  </label>
                  <input
                    type='text'
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Enter subject name'
                  />
                  <div className='mt-2'>
                    <p className='text-xs text-gray-500 mb-1'>Quick select:</p>
                    <div className='flex flex-wrap gap-1'>
                      {commonSubjects.slice(0, 6).map((subject) => (
                        <button
                          key={subject}
                          onClick={() => setNewSubject({ ...newSubject, name: subject })}
                          className='px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors'
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Subject Code
                  </label>
                  <input
                    type='text'
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='e.g., MATH101'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Year Level</label>
                  <select
                    value={newSubject.year}
                    onChange={(e) => setNewSubject({ ...newSubject, year: e.target.value })}
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
                  <label className='block text-sm font-medium text-gray-700 mb-2'>term</label>
                  <select
                    value={newSubject.term}
                    onChange={(e) => setNewSubject({ ...newSubject, term: e.target.value })}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {terms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Room Number
                  </label>
                  <input
                    type='text'
                    value={newSubject.roomNumber}
                    onChange={(e) => setNewSubject({ ...newSubject, roomNumber: e.target.value })}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='e.g., A101'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Class Time</label>
                  <input
                    type='time'
                    value={newSubject.scheduleTime}
                    onChange={(e) => setNewSubject({ ...newSubject, scheduleTime: e.target.value })}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
              </div>

              <div className='mt-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Schedule Days
                </label>
                <div className='flex flex-wrap gap-2'>
                  {daysOfWeek.map((day) => (
                    <label key={day} className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={newSubject.scheduleDays.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2'
                      />
                      <span className='text-sm text-gray-700'>{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className='mt-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Description</label>
                <textarea
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  rows={3}
                  placeholder='Optional description...'
                />
              </div>
            </div>
            <div className='p-4 border-t flex justify-end space-x-3 bg-white'>
              <button
                onClick={() => setShowAddModal(false)}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubject}
                disabled={loading}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                {loading ? "Adding..." : "Add Subject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Edit Subject</h3>
            <div className='p-6 overflow-y-auto flex-1'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Subject Name
                  </label>
                  <input
                    type='text'
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Subject Code
                  </label>
                  <input
                    type='text'
                    value={editingSubject.code}
                    onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value })}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Year Level</label>
                  <select
                    value={editingSubject.year}
                    onChange={(e) => setEditingSubject({ ...editingSubject, year: e.target.value })}
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
                  <label className='block text-sm font-medium text-gray-700 mb-2'>term</label>
                  <select
                    value={editingSubject.term}
                    onChange={(e) => setEditingSubject({ ...editingSubject, term: e.target.value })}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {terms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Room Number
                  </label>
                  <input
                    type='text'
                    value={editingSubject.roomNumber}
                    onChange={(e) =>
                      setEditingSubject({ ...editingSubject, roomNumber: e.target.value })
                    }
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Class Time</label>
                  <input
                    type='time'
                    value={editingSubject.scheduleTime}
                    onChange={(e) =>
                      setEditingSubject({ ...editingSubject, scheduleTime: e.target.value })
                    }
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
              </div>

              <div className='mt-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Schedule Days
                </label>
                <div className='flex flex-wrap gap-2'>
                  {daysOfWeek.map((day) => (
                    <label key={day} className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={editingSubject.scheduleDays.includes(day)}
                        onChange={() => handleDayToggle(day, true)}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2'
                      />
                      <span className='text-sm text-gray-700'>{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className='mt-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Description</label>
                <textarea
                  value={editingSubject.description}
                  onChange={(e) =>
                    setEditingSubject({ ...editingSubject, description: e.target.value })
                  }
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  rows={3}
                />
              </div>
            </div>

            <div className='p-4 border-t flex justify-end space-x-3 bg-white'>
              <button
                onClick={() => setEditingSubject(null)}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubject}
                disabled={loading}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                {loading ? "Updating..." : "Update Subject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Students Modal */}
      {showAssignModal && assigningSubject && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Assign Students to {assigningSubject.name}
            </h3>

            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {students
                .filter((student) => student.year === assigningSubject.year)
                .map((student) => (
                  <label
                    key={student.id}
                    className='flex items-center p-3 hover:bg-gray-50 rounded-lg'
                  >
                    <input
                      type='checkbox'
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, student.id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter((id) => id !== student.id));
                        }
                      }}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3'
                    />
                    <div>
                      <div className='text-sm font-medium text-gray-900'>{student.name}</div>
                      <div className='text-xs text-gray-500'>{student.year}</div>
                    </div>
                  </label>
                ))}
            </div>

            <div className='flex justify-end space-x-3 mt-6'>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssigningSubject(null);
                  setSelectedStudents([]);
                }}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStudents}
                disabled={loading}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                {loading ? "Assigning..." : "Assign Students"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
