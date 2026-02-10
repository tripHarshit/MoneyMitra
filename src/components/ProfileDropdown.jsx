import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Edit3, LogOut, User } from 'lucide-react';

const ProfileDropdown = ({ userPreferences, onUpdatePreferences }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editedPreferences, setEditedPreferences] = useState({
    occupation: '',
    ageGroup: '',
    financialGoal: ''
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const occupations = [
    'Student',
    'Working Professional',
    'Freelancer',
    'Small Business Owner',
    'Homemaker',
    'Retired',
    'Self-Employed',
    'Other'
  ];

  const ageGroups = [
    '18-25',
    '26-35',
    '36-45',
    '46-55',
    '55+'
  ];

  const goals = [
    'Learn Basics',
    'Save Money',
    'Manage Debt',
    'Invest & Grow',
    'Plan Retirement',
    'Budget Management'
  ];

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setLogoutLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditedPreferences({
      occupation: userPreferences?.occupation || '',
      ageGroup: userPreferences?.ageGroup || '',
      financialGoal: userPreferences?.financialGoal || ''
    });
    setIsEditing(true);
  };

  const handleSavePreferences = async () => {
    if (!editedPreferences.occupation || !editedPreferences.ageGroup || !editedPreferences.financialGoal) {
      return;
    }
    
    setSaveLoading(true);
    try {
      await onUpdatePreferences?.(editedPreferences);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPreferences({
      occupation: userPreferences?.occupation || '',
      ageGroup: userPreferences?.ageGroup || '',
      financialGoal: userPreferences?.financialGoal || ''
    });
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#1A1D23] hover:bg-[#22262E] transition-all duration-300 border border-white/5 hover:border-white/10"
        title="Open profile menu"
      >
        {/* Avatar Circle */}
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="text-white text-sm font-medium">{getInitials()}</span>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1A1D23] rounded-2xl shadow-2xl border border-white/5 z-50 overflow-hidden float-shadow">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-lg font-semibold">{getInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-white/70 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Financial Preferences Section */}
          <div className="px-5 py-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">Financial Profile</h3>
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors duration-300"
                >
                  <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Occupation</label>
                  <select
                    value={editedPreferences.occupation}
                    onChange={(e) => setEditedPreferences(prev => ({ ...prev, occupation: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#22262E] border border-white/5 rounded-xl text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all duration-300"
                  >
                    <option value="">Select occupation</option>
                    {occupations.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Age Group</label>
                  <select
                    value={editedPreferences.ageGroup}
                    onChange={(e) => setEditedPreferences(prev => ({ ...prev, ageGroup: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#22262E] border border-white/5 rounded-xl text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all duration-300"
                  >
                    <option value="">Select age group</option>
                    {ageGroups.map(group => (
                      <option key={group} value={group}>{group} years</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Financial Goal</label>
                  <select
                    value={editedPreferences.financialGoal}
                    onChange={(e) => setEditedPreferences(prev => ({ ...prev, financialGoal: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#22262E] border border-white/5 rounded-xl text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all duration-300"
                  >
                    <option value="">Select goal</option>
                    {goals.map(goal => (
                      <option key={goal} value={goal}>{goal}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={saveLoading}
                    className="flex-1 py-2 px-3 border border-white/10 rounded-xl text-gray-300 text-sm font-medium hover:bg-white/5 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    disabled={saveLoading || !editedPreferences.occupation || !editedPreferences.ageGroup || !editedPreferences.financialGoal}
                    className="flex-1 py-2 px-3 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saveLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  * Changes will apply to new conversations
                </p>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 bg-[#22262E] rounded-xl">
                  <span className="text-xs text-gray-500">Occupation</span>
                  <span className="text-sm font-medium text-gray-200">{userPreferences?.occupation || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-[#22262E] rounded-xl">
                  <span className="text-xs text-gray-500">Age Group</span>
                  <span className="text-sm font-medium text-gray-200">{userPreferences?.ageGroup || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-[#22262E] rounded-xl">
                  <span className="text-xs text-gray-500">Goal</span>
                  <span className="text-sm font-medium text-gray-200">{userPreferences?.financialGoal || 'Not set'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Account Info Section */}
          <div className="px-5 py-3 border-b border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Signed in via</span>
              <span className="font-medium text-gray-300">
                {user?.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email'}
              </span>
            </div>
          </div>

          {/* Footer - Logout Button */}
          <div className="px-5 py-3 bg-[#22262E]">
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                logoutLoading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
              }`}
            >
              {logoutLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></span>
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Backdrop - close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            if (!isEditing) {
              setIsOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default ProfileDropdown;
