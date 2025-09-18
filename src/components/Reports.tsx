import React, { useState } from "react";
import { Calendar, Download, FileText, BarChart3, Filter, TrendingUp, Users } from "lucide-react";
import { Student, AttendanceRecord } from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportsProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
}

const Reports: React.FC<ReportsProps> = ({ students, attendanceRecords }) => {
  const [selectedReport, setSelectedReport] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState(""); // ✅ FIXED
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");

  const years = ["All", "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"];
  const subjects = ["All", "ICT", "Mathematics", "English", "Science", "History", "Geography"];

  const reportTypes = [
    { id: "overview", name: "Attendance Overview", icon: BarChart3 },
    { id: "detailed", name: "Detailed Report", icon: FileText },
    { id: "trends", name: "Trend Analysis", icon: TrendingUp },
    { id: "individual", name: "Individual Student", icon: Users },
  ];

  // 🔹 Filtered Records
  const filteredRecords = attendanceRecords.filter((record) => {
    const recordDate = new Date(record.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const dateInRange = recordDate >= startDate && recordDate <= endDate;
    const yearMatch =
      selectedYear === "All" ||
      students.find((s) => s.id === record.studentId)?.year === selectedYear;
    const subjectMatch = selectedSubject === "All" || record.subjectId === selectedSubject;
    return dateInRange && yearMatch && subjectMatch;
  });

  // 🔹 Export Function
  const exportReport = (format: "csv" | "pdf") => {
    const reportData = filteredRecords.map((r) => {
      const student = students.find((s) => s.id === r.studentId);
      return {
        Date: r.date,
        Student: student?.name || "Unknown",
        Year: student?.year || "Unknown",
        Subject: r.subjectId,
        Status: r.status,
      };
    });

    if (format === "csv") {
      const csv = Papa.unparse(reportData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_${selectedReport}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    if (format === "pdf") {
      const doc = new jsPDF();
      doc.text(`Attendance Report - ${selectedReport}`, 14, 15);
      autoTable(doc, {
        startY: 25,
        head: [["Date", "Student", "Year", "Subject", "Status"]],
        body: reportData.map((d) => [d.Date, d.Student, d.Year, d.Subject, d.Status]),
      });
      doc.save(`attendance_${selectedReport}.pdf`);
    }
  };

  // Calculate statistics
  const getAttendanceStats = () => {
    const filteredRecords = attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      const dateInRange = recordDate >= startDate && recordDate <= endDate;
      const yearMatch =
        selectedYear === "All" ||
        students.find((s) => s.id === record.studentId)?.year === selectedYear;
      const subjectMatch = selectedSubject === "All" || record.subjectId === selectedSubject;

      return dateInRange && yearMatch && subjectMatch;
    });

    const totalRecords = filteredRecords.length;
    const presentCount = filteredRecords.filter((r) => r.status === "present").length;
    const absentCount = filteredRecords.filter((r) => r.status === "absent").length;
    const lateCount = filteredRecords.filter((r) => r.status === "late").length;

    return {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,
    };
  };

  const stats = getAttendanceStats();

  // Student summaries
  const getStudentAttendanceSummary = () => {
    return students
      .map((student) => {
        const studentRecords = attendanceRecords.filter(
          (record) => record.studentId === student.id,
        );
        const present = studentRecords.filter((r) => r.status === "present").length;
        const absent = studentRecords.filter((r) => r.status === "absent").length;
        const late = studentRecords.filter((r) => r.status === "late").length;
        const total = studentRecords.length;
        const rate = total > 0 ? (present / total) * 100 : 0;

        return {
          ...student,
          present,
          absent,
          late,
          total,
          rate,
        };
      })
      .sort((a, b) => b.rate - a.rate);
  };

  const studentSummary = getStudentAttendanceSummary(); // ✅ moved up

  // Trend Analysis Data
  const trendData = Object.values(
    filteredRecords.reduce((acc: any, record) => {
      const date = record.date;
      if (!acc[date]) acc[date] = { date, present: 0, absent: 0, late: 0, total: 0 };
      acc[date][record.status] += 1;
      acc[date].total += 1;
      return acc;
    }, {}),
  ).map((d: any) => ({
    date: d.date,
    rate: d.total > 0 ? (d.present / d.total) * 100 : 0,
  }));

  // Individual Report Data
  const individualStudent = selectedStudent
    ? studentSummary.find((s) => s.id === selectedStudent)
    : null;

  const individualRecords = selectedStudent
    ? attendanceRecords.filter((r) => r.studentId === selectedStudent)
    : [];

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>Reports & Analytics</h1>
        <p className='text-gray-600'>Generate comprehensive attendance reports and insights</p>
      </div>

      {/* Report Type Selection */}
      <div className='bg-white p-6 rounded-xl shadow-sm border mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedReport === type.id
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <Icon className='h-6 w-6 mx-auto mb-2' />
                <div className='text-sm font-medium'>{type.name}</div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Start Date</label>
            <input
              type='date'
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>End Date</label>
            <input
              type='date'
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Year</label>
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
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className='bg-white p-6 rounded-xl shadow-sm border mb-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>Export Report</h3>
          <div className='flex space-x-3'>
            <button
              onClick={() => exportReport("csv")}
              className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
            >
              <Download className='h-4 w-4 mr-2' />
              Export CSV
            </button>
            <button
              onClick={() => exportReport("pdf")}
              className='flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
            >
              <Download className='h-4 w-4 mr-2' />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white p-6 rounded-xl shadow-sm border'>
          <div className='text-2xl font-bold text-gray-900'>{stats.totalRecords}</div>
          <div className='text-sm text-gray-600'>Total Records</div>
        </div>
        <div className='bg-white p-6 rounded-xl shadow-sm border'>
          <div className='text-2xl font-bold text-green-600'>{stats.presentCount}</div>
          <div className='text-sm text-gray-600'>Present</div>
        </div>
        <div className='bg-white p-6 rounded-xl shadow-sm border'>
          <div className='text-2xl font-bold text-red-600'>{stats.absentCount}</div>
          <div className='text-sm text-gray-600'>Absent</div>
        </div>
        <div className='bg-white p-6 rounded-xl shadow-sm border'>
          <div className='text-2xl font-bold text-blue-600'>{stats.attendanceRate.toFixed(1)}%</div>
          <div className='text-sm text-gray-600'>Attendance Rate</div>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === "overview" && (
        <div className='bg-white rounded-xl shadow-sm border'>
          <div className='p-6 border-b'>
            <h3 className='text-lg font-semibold text-gray-900'>Attendance Overview</h3>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <div>
                <h4 className='text-md font-medium text-gray-900 mb-4'>Top Performing Students</h4>
                <div className='space-y-3'>
                  {studentSummary.slice(0, 5).map((student, index) => (
                    <div
                      key={student.id}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <div className='flex items-center'>
                        <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
                          <span className='text-xs font-medium text-blue-600'>{index + 1}</span>
                        </div>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>{student.name}</div>
                          <div className='text-xs text-gray-500'>{student.year}</div>
                        </div>
                      </div>
                      <div className='text-sm font-medium text-green-600'>
                        {student.rate.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className='text-md font-medium text-gray-900 mb-4'>Attendance by Year</h4>
                <div className='space-y-3'>
                  {years.slice(1).map((year) => {
                    const yearStudents = studentSummary.filter((s) => s.year === year);
                    const avgRate =
                      yearStudents.length > 0
                        ? yearStudents.reduce((sum, s) => sum + s.rate, 0) / yearStudents.length
                        : 0;

                    return (
                      <div
                        key={year}
                        className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                      >
                        <span className='text-sm font-medium text-gray-900'>{year}</span>
                        <div className='flex items-center space-x-3'>
                          <div className='w-24 bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-blue-600 h-2 rounded-full'
                              style={{ width: `${avgRate}%` }}
                            />
                          </div>
                          <span className='text-sm font-medium text-gray-900 w-12'>
                            {avgRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === "detailed" && (
        <div className='bg-white rounded-xl shadow-sm border'>
          <div className='p-6 border-b'>
            <h3 className='text-lg font-semibold text-gray-900'>Detailed Attendance Report</h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Student
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Year
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Present
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Absent
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Late
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {studentSummary.map((student) => (
                  <tr key={student.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>{student.name}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {student.year}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium'>
                      {student.present}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium'>
                      {student.absent}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-medium'>
                      {student.late}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='w-16 bg-gray-200 rounded-full h-2 mr-2'>
                          <div
                            className={`h-2 rounded-full ${
                              student.rate >= 90
                                ? "bg-green-600"
                                : student.rate >= 75
                                ? "bg-amber-600"
                                : "bg-red-600"
                            }`}
                            style={{ width: `${student.rate}%` }}
                          />
                        </div>
                        <span className='text-sm font-medium text-gray-900'>
                          {student.rate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      {selectedReport === "trends" && (
        <div className='bg-white rounded-xl shadow-sm border'>
          <div className='p-6 border-b'>
            <h3 className='text-lg font-semibold text-gray-900'>Trend Analysis</h3>
          </div>
          <div className='p-6 h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Line type='monotone' dataKey='rate' stroke='#2563eb' strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Individual Student */}
      {selectedReport === "individual" && (
        <div className='bg-white rounded-xl shadow-sm border'>
          <div className='p-6 border-b flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>Individual Student Report</h3>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className='p-2 border border-gray-300 rounded-lg'
            >
              <option value=''>Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          {individualStudent ? (
            <div className='p-6 grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {/* Pie Chart Summary */}
              <div className='flex flex-col items-center'>
                <PieChart width={300} height={300}>
                  <Pie
                    data={[
                      { name: "Present", value: individualStudent.present },
                      { name: "Absent", value: individualStudent.absent },
                      { name: "Late", value: individualStudent.late },
                    ]}
                    cx='50%'
                    cy='50%'
                    outerRadius={100}
                    label
                    dataKey='value'
                  >
                    <Cell fill='#16a34a' />
                    <Cell fill='#dc2626' />
                    <Cell fill='#f59e0b' />
                  </Pie>
                  <Legend />
                </PieChart>
                <p className='mt-4 text-gray-600'>
                  Attendance Rate:{" "}
                  <span className='font-semibold'>{individualStudent.rate.toFixed(1)}%</span>
                </p>
              </div>

              {/* Recent Records */}
              <div>
                <h4 className='text-md font-medium text-gray-900 mb-4'>Recent Attendance</h4>
                <div className='space-y-2 max-h-72 overflow-y-auto'>
                  {individualRecords
                    .slice(-10)
                    .reverse()
                    .map((r) => (
                      <div
                        key={r.date + r.subjectId}
                        className='flex justify-between p-2 bg-gray-50 rounded-lg'
                      >
                        <span className='text-sm'>
                          {r.date} - {r.subjectId}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            r.status === "present"
                              ? "text-green-600"
                              : r.status === "absent"
                              ? "text-red-600"
                              : "text-amber-600"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className='p-6 text-gray-500'>Select a student to view details.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
