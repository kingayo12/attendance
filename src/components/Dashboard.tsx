import React from 'react';
import { Users, UserCheck, UserX, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { AttendanceStats } from '../types';

interface DashboardProps {
  stats: AttendanceStats;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toString(),
      icon: Users,
      color: 'blue',
      change: '+12 from last month',
    },
    {
      title: 'Present Today',
      value: stats.presentToday.toString(),
      icon: UserCheck,
      color: 'green',
      change: `${((stats.presentToday / stats.totalStudents) * 100).toFixed(1)}% attendance`,
    },
    {
      title: 'Absent Today',
      value: stats.absentToday.toString(),
      icon: UserX,
      color: 'red',
      change: stats.absentToday > 50 ? 'Higher than usual' : 'Normal levels',
    },
    {
      title: 'Late Today',
      value: stats.lateToday.toString(),
      icon: Clock,
      color: 'amber',
      change: 'Track patterns',
    },
  ];

  const recentActivities = [
    { action: 'Attendance marked for Year 12 Mathematics', time: '2 minutes ago', type: 'success' },
    { action: 'New student added to Year 9 ICT', time: '15 minutes ago', type: 'info' },
    { action: 'High absenteeism alert for Year 8 English', time: '1 hour ago', type: 'warning' },
    { action: 'Monthly report generated', time: '2 hours ago', type: 'info' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of today's attendance and school metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            red: 'bg-red-50 text-red-600',
            amber: 'bg-amber-50 text-amber-600',
          };

          return (
            <div key={card.title} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-2">{card.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance Trend</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => {
              const percentage = 85 + Math.random() * 12;
              return (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-20">{day}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">{percentage.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const iconClasses = {
                success: 'bg-green-100 text-green-600',
                warning: 'bg-amber-100 text-amber-600',
                info: 'bg-blue-100 text-blue-600',
              };

              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${iconClasses[activity.type as keyof typeof iconClasses]}`}>
                    {activity.type === 'warning' ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <UserCheck className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <UserCheck className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Mark Attendance</h4>
            <p className="text-sm text-gray-600">Quickly mark attendance for any class</p>
          </button>
          <button className="p-4 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Users className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Add Student</h4>
            <p className="text-sm text-gray-600">Register a new student</p>
          </button>
          <button className="p-4 text-left bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Generate Report</h4>
            <p className="text-sm text-gray-600">Create attendance reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;