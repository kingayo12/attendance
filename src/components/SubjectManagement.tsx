import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, BookOpen, User } from "lucide-react";
import { Subject } from "../types";

export interface SubjectManagementProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, "id">) => Promise<{ error: string | null }>;
  onUpdateSubject: (id: string, subject: Partial<Subject>) => Promise<{ error: string | null }>;
  onDeleteSubject: (id: string) => Promise<{ error: string | null }>;
}

const SubjectManagement: React.FC<SubjectManagementProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);

  const [newSubject, setNewSubject] = useState({
    name: "",
    year: "Year 7",
    teacherId: "",
    students: [] as string[],
  });

  const years = ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"];

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddSubject = async () => {
    if (newSubject.name) {
      setLoading(true);
      const { error } = await onAddSubject(newSubject);
      setLoading(false);

      if (error) {
        alert("Error adding subject: " + error);
      } else {
        setNewSubject({ name: "", year: "Year 7", teacherId: "", students: [] });
        setShowAddModal(false);
      }
    }
  };

  const handleUpdateSubject = async () => {
    if (editingSubject) {
      setLoading(true);
      const { error } = await onUpdateSubject(editingSubject.id, {
        name: editingSubject.name,
        year: editingSubject.year,
        teacherId: editingSubject.teacherId,
        students: editingSubject.students,
      });
      setLoading(false);

      if (error) {
        alert("Error updating subject: " + error);
      } else {
        setEditingSubject(null);
      }
    }
  };

  return (
    <div>
           {" "}
      <div className='mb-8 flex justify-between items-center'>
               {" "}
        <div>
                    <h1 className='text-2xl font-bold text-gray-900'>Subject Management</h1>       
            <p className='text-gray-600'>Manage subjects, assign teachers, and enroll students</p> 
               {" "}
        </div>
               {" "}
        <button
          onClick={() => setShowAddModal(true)}
          className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
                    <Plus className='h-4 w-4 mr-2' />          Add Subject        {" "}
        </button>
             {" "}
      </div>
            {/* Search */}     {" "}
      <div className='bg-white p-6 rounded-xl shadow-sm border mb-6'>
               {" "}
        <label className='block text-sm font-medium text-gray-700 mb-2'>Search Subjects</label>     
         {" "}
        <div className='relative'>
                    <Search className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
                   {" "}
          <input
            type='text'
            placeholder='Search by subject name...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
                 {" "}
        </div>
             {" "}
      </div>
            {/* Subjects List */}     {" "}
      <div className='bg-white rounded-xl shadow-sm border'>
               {" "}
        <div className='p-6 border-b'>
                   {" "}
          <h3 className='text-lg font-semibold text-gray-900'>
                        Subjects ({filteredSubjects.length})          {" "}
          </h3>
                 {" "}
        </div>
               {" "}
        <div className='divide-y divide-gray-200'>
                   {" "}
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className='p-6 hover:bg-gray-50 transition-colors'>
                           {" "}
              <div className='flex items-center justify-between'>
                               {" "}
                <div className='flex items-center space-x-4'>
                                   {" "}
                  <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center'>
                                        <BookOpen className='h-6 w-6 text-purple-600' />           
                         {" "}
                  </div>
                                   {" "}
                  <div>
                                       {" "}
                    <h4 className='text-lg font-medium text-gray-900'>{subject.name}</h4>           
                            <p className='text-sm text-gray-500'>{subject.year}</p>                 
                     {" "}
                    {subject.teacherId && (
                      <p className='text-sm text-gray-500 flex items-center'>
                                                <User className='h-4 w-4 mr-1 text-gray-400' />{" "}
                        Teacher ID:                         {subject.teacherId}                     {" "}
                      </p>
                    )}
                                       {" "}
                    {subject.students?.length > 0 && (
                      <p className='text-sm text-gray-500'>
                                                Enrolled Students: {subject.students.length}       
                                     {" "}
                      </p>
                    )}
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <div className='flex items-center space-x-2'>
                                   {" "}
                  <button
                    onClick={() => setEditingSubject(subject)}
                    className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                  >
                                        <Edit2 className='h-4 w-4' />                 {" "}
                  </button>
                                   {" "}
                  <button
                    onClick={() => onDeleteSubject(subject.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                  >
                                        <Trash2 className='h-4 w-4' />                 {" "}
                  </button>
                                 {" "}
                </div>
                             {" "}
              </div>
                         {" "}
            </div>
          ))}
                 {" "}
        </div>
             {" "}
      </div>
            {/* Add Subject Modal */}     {" "}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                   {" "}
          <div className='bg-white p-6 rounded-xl shadow-xl w-full max-w-md'>
                       {" "}
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Add New Subject</h3>           {" "}
            <div className='space-y-4'>
                           {" "}
              <input
                type='text'
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                placeholder='Subject name'
              />
                           {" "}
              <select
                value={newSubject.year}
                onChange={(e) => setNewSubject({ ...newSubject, year: e.target.value })}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              >
                               {" "}
                {years.map((year) => (
                  <option key={year} value={year}>
                                        {year}                 {" "}
                  </option>
                ))}
                             {" "}
              </select>
                           {" "}
              <input
                type='text'
                value={newSubject.teacherId}
                onChange={(e) => setNewSubject({ ...newSubject, teacherId: e.target.value })}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                placeholder='Teacher ID'
              />
                         {" "}
            </div>
                       {" "}
            <div className='flex justify-end space-x-3 mt-6'>
                           {" "}
              <button
                onClick={() => setShowAddModal(false)}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200'
              >
                                Cancel              {" "}
              </button>
                           {" "}
              <button
                onClick={handleAddSubject}
                disabled={loading}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
              >
                                {loading ? "Adding..." : "Add Subject"}             {" "}
              </button>
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
      )}
            {/* Edit Subject Modal */}     {" "}
      {editingSubject && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                   {" "}
          <div className='bg-white p-6 rounded-xl shadow-xl w-full max-w-md'>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Edit Subject</h3> 
                     {" "}
            <div className='space-y-4'>
                           {" "}
              <input
                type='text'
                value={editingSubject.name}
                onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              />
                           {" "}
              <select
                value={editingSubject.year}
                onChange={(e) => setEditingSubject({ ...editingSubject, year: e.target.value })}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              >
                               {" "}
                {years.map((year) => (
                  <option key={year} value={year}>
                                        {year}                 {" "}
                  </option>
                ))}
                             {" "}
              </select>
                           {" "}
              <input
                type='text'
                value={editingSubject.teacherId}
                onChange={(e) =>
                  setEditingSubject({ ...editingSubject, teacherId: e.target.value })
                }
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                placeholder='Teacher ID'
              />
                         {" "}
            </div>
                       {" "}
            <div className='flex justify-end space-x-3 mt-6'>
                           {" "}
              <button
                onClick={() => setEditingSubject(null)}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200'
              >
                                Cancel              {" "}
              </button>
                           {" "}
              <button
                onClick={handleUpdateSubject}
                disabled={loading}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
              >
                                {loading ? "Updating..." : "Update Subject"}             {" "}
              </button>
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
      )}
         {" "}
    </div>
  );
};

export default SubjectManagement;
