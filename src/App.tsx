import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthPage from "./components/auth/AuthPage";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import AttendanceMarking from "./components/AttendanceMarking";
import StudentManagement from "./components/StudentManagement";
import Settings from "./components/Settings";
import Reports from "./components/Reports";
import SubjectManagement from "./components/SubjectManagement";
import { AttendanceRecord } from "./types";
import { useSupabaseData } from "./hooks/useSupabaseData";

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const {
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
    stats,
  } = useSupabaseData();

  if (authLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading your data...</p>
        </div>
      </div>
    );
  }

  const handleDeleteStudent = (id: string) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      deleteStudent(id);
    }
  };

  const handleMarkAttendance = (records: AttendanceRecord[]) => {
    markAttendance(records).then(({ error }) => {
      if (error) {
        alert("Error saving attendance: " + error);
      } else {
        alert("Attendance saved successfully!");
      }
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard stats={stats} />;
      case "attendance":
        return <AttendanceMarking students={students} onMarkAttendance={handleMarkAttendance} />;
      case "students":
        return (
          <StudentManagement
            students={students}
            onAddStudent={addStudent}
            onUpdateStudent={updateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      case "reports":
        return <Reports students={students} attendanceRecords={attendanceRecords} />;
      case "subjects":
        return (
          <SubjectManagement
            students={students}
            subjects={subjects}
            onAddSubject={addSubject}
            onUpdateSubject={updateSubject}
            onDeleteSubject={deleteSubject}
            onAssignStudents={assignStudentsToSubject}
          />
        );
      case "settings":
        return <Settings />;
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
