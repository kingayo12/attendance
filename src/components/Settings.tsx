import React, { useState, useEffect } from "react";
import { Save, Bell, Palette, Clock, Globe, School, User, Shield, Database } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { UserSettings } from "../types";

const Settings: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profileData, setProfileData] = useState({
    fullName: profile?.full_name || "",
    email: profile?.email || "",
    schoolName: profile?.school_name || "",
    role: profile?.role || "teacher",
  });

  const [settings, setSettings] = useState<Partial<UserSettings>>({
    schoolYear: "2024-2025",
    defaultYearLevel: "Year 7",
    attendanceReminderTime: "09:00",
    emailNotifications: true,
    theme: "light",
    timezone: "UTC",
  });

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "preferences", name: "Preferences", icon: Palette },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "academic", name: "Academic Year", icon: School },
    { id: "security", name: "Security", icon: Shield },
    { id: "data", name: "Data Management", icon: Database },
  ];

  const yearLevels = ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"];
  const themes = ["light", "dark"];
  const timezones = [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];

  useEffect(() => {
    if (profile) {
      setProfileData({
        fullName: profile.full_name || "",
        email: profile.email || "",
        schoolName: profile.school_name || "",
        role: profile.role || "teacher",
      });
    }
    fetchSettings();
  }, [profile]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching settings:", error);
        return;
      }

      if (data) {
        setSettings({
          schoolYear: data.school_year,
          defaultYearLevel: data.default_year_level,
          attendanceReminderTime: data.attendance_reminder_time,
          emailNotifications: data.email_notifications,
          theme: data.theme,
          timezone: data.timezone,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    const { error } = await updateProfile({
      full_name: profileData.fullName,
      school_name: profileData.schoolName,
      role: profileData.role as "teacher" | "admin",
    });

    if (error) {
      alert("Error updating profile: " + error);
    } else {
      alert("Profile updated successfully!");
    }
    setLoading(false);
  };

  const handleSettingsUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("user_settings").upsert({
        user_id: user.id,
        school_year: settings.schoolYear,
        default_year_level: settings.defaultYearLevel,
        attendance_reminder_time: settings.attendanceReminderTime,
        email_notifications: settings.emailNotifications,
        theme: settings.theme,
        timezone: settings.timezone,
      });

      if (error) {
        alert("Error updating settings: " + error.message);
      } else {
        alert("Settings updated successfully!");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Error updating settings");
    }
    setLoading(false);
  };

  const exportData = async () => {
    if (!user) return;

    try {
      // Fetch all user data
      const [studentsRes, subjectsRes, attendanceRes] = await Promise.all([
        supabase.from("students").select("*").eq("user_id", user.id),
        supabase.from("subjects").select("*").eq("user_id", user.id),
        supabase.from("attendance_records").select("*").eq("user_id", user.id),
      ]);

      const exportData = {
        profile: profile,
        students: studentsRes.data,
        subjects: subjectsRes.data,
        attendance: attendanceRes.data,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error exporting data");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name</label>
              <input
                type='text'
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
              <input
                type='email'
                value={profileData.email}
                disabled
                className='w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500'
              />
              <p className='text-xs text-gray-500 mt-1'>Email cannot be changed</p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>School Name</label>
              <input
                type='text'
                value={profileData.schoolName}
                onChange={(e) => setProfileData({ ...profileData, schoolName: e.target.value })}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Role</label>
              <select
                value={profileData.role}
                onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='teacher'>Teacher</option>
                <option value='admin'>Administrator</option>
              </select>
            </div>
            <button
              onClick={handleProfileUpdate}
              disabled={loading}
              className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              <Save className='h-4 w-4 mr-2' />
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        );

      case "academic":
        return (
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Academic Year</label>
              <input
                type='text'
                value={settings.schoolYear}
                onChange={(e) => setSettings({ ...settings, schoolYear: e.target.value })}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='e.g., 2024-2025'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Default Year Level
              </label>
              <select
                value={settings.defaultYearLevel}
                onChange={(e) => setSettings({ ...settings, defaultYearLevel: e.target.value })}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                {yearLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSettingsUpdate}
              disabled={loading}
              className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              <Save className='h-4 w-4 mr-2' />
              {loading ? "Updating..." : "Update Settings"}
            </button>
          </div>
        );

      case "preferences":
        return (
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                {themes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSettingsUpdate}
              disabled={loading}
              className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              <Save className='h-4 w-4 mr-2' />
              {loading ? "Updating..." : "Update Settings"}
            </button>
          </div>
        );

      case "notifications":
        return (
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Attendance Reminder Time
              </label>
              <input
                type='time'
                value={settings.attendanceReminderTime}
                onChange={(e) =>
                  setSettings({ ...settings, attendanceReminderTime: e.target.value })
                }
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='text-sm font-medium text-gray-700'>Email Notifications</h4>
                <p className='text-xs text-gray-500'>Receive email reminders and updates</p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, emailNotifications: e.target.checked })
                  }
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button
              onClick={handleSettingsUpdate}
              disabled={loading}
              className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              <Save className='h-4 w-4 mr-2' />
              {loading ? "Updating..." : "Update Settings"}
            </button>
          </div>
        );

      case "security":
        return (
          <div className='space-y-6'>
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
              <h4 className='text-sm font-medium text-yellow-800 mb-2'>Password Management</h4>
              <p className='text-sm text-yellow-700 mb-3'>
                To change your password, you'll need to use the password reset feature.
              </p>
              <button
                onClick={() => {
                  if (user?.email) {
                    supabase.auth.resetPasswordForEmail(user.email);
                    alert("Password reset email sent!");
                  }
                }}
                className='text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors'
              >
                Send Password Reset Email
              </button>
            </div>
            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
              <h4 className='text-sm font-medium text-red-800 mb-2'>Account Deletion</h4>
              <p className='text-sm text-red-700 mb-3'>
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <button
                onClick={() => {
                  if (
                    confirm("Are you sure you want to delete your account? This cannot be undone.")
                  ) {
                    alert("Account deletion feature coming soon. Please contact support.");
                  }
                }}
                className='text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors'
              >
                Delete Account
              </button>
            </div>
          </div>
        );

      case "data":
        return (
          <div className='space-y-6'>
            <div>
              <h4 className='text-sm font-medium text-gray-700 mb-2'>Export Data</h4>
              <p className='text-sm text-gray-500 mb-4'>
                Download all your attendance data in JSON format for backup or migration purposes.
              </p>
              <button
                onClick={exportData}
                className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                <Database className='h-4 w-4 mr-2' />
                Export All Data
              </button>
            </div>
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <h4 className='text-sm font-medium text-blue-800 mb-2'>Data Backup</h4>
              <p className='text-sm text-blue-700'>
                Your data is automatically backed up daily. All data is encrypted and stored
                securely.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>Settings</h1>
        <p className='text-gray-600'>Manage your account preferences and application settings</p>
      </div>

      <div className='bg-white rounded-xl shadow-sm border'>
        <div className='border-b'>
          <nav className='flex space-x-8 px-6'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className='h-4 w-4 mr-2' />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className='p-6'>{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default Settings;
