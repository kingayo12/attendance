import React, { useState } from "react";
import { Users, Calendar, BarChart3, Settings, BookOpen, UserCheck, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "attendance", label: "Mark Attendance", icon: UserCheck },
    { id: "students", label: "Students", icon: Users },
    { id: "subjects", label: "Subjects", icon: BookOpen },
    { id: "reports", label: "Reports", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <UserCheck className='h-8 w-8 text-blue-600 flex-shrink-0' />
              <div className='ml-3'>
                <h1 className='text-lg sm:text-xl font-semibold text-gray-900'>AttendanceAI</h1>
                <p className='hidden sm:block text-sm text-gray-500'>Smart School Management</p>
              </div>
            </div>

            {/* Desktop user info */}
            <div className='hidden sm:flex items-center space-x-4'>
              <span className='text-sm text-gray-500'>Welcome, {profile?.full_name || "User"}</span>
              <button
                onClick={signOut}
                className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
              >
                Sign Out
              </button>
              <div className='h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-medium'>
                  {profile?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </span>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              className='sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-700'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className='bg-white border-b'>
        <div className='max-w-7xl mx-auto px-2 sm:px-6 lg:px-8'>
          {/* Desktop nav */}
          <div className='hidden sm:flex space-x-8'>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === item.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className='h-4 w-4 mr-2' />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <div className='sm:hidden flex flex-col space-y-1 py-2'>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className='h-4 w-4 mr-2' />
                    {item.label}
                  </button>
                );
              })}

              {/* Mobile user info */}
              <div className='mt-4 border-t pt-4 flex items-center space-x-3 px-4'>
                <div className='h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center'>
                  <span className='text-white text-sm font-medium'>
                    {profile?.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </span>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-900'>
                    {profile?.full_name || "User"}
                  </p>
                  <button onClick={signOut} className='text-xs text-gray-500 hover:text-gray-700'>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className='flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6'>{children}</main>
    </div>
  );
};

export default Layout;
