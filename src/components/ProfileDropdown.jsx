import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Edit3, LogOut, ShieldCheck, Check } from 'lucide-react';

const ProfileDropdown = ({ userPreferences, onUpdatePreferences }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editedPreferences, setEditedPreferences] = useState({
    occupation: '',
    ageGroup: '',
    financialGoal: '',
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
    'Other',
  ];

  const ageGroups = ['18-25', '26-35', '36-45', '46-55', '55+'];

  const goals = ['Learn Basics', 'Save Money', 'Manage Debt', 'Invest & Grow', 'Plan Retirement', 'Budget Management'];

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
      financialGoal: userPreferences?.financialGoal || '',
    });
    setIsEditing(true);
  };

  const handleSavePreferences = async () => {
    if (!editedPreferences.occupation || !editedPreferences.ageGroup || !editedPreferences.financialGoal) return;

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
      financialGoal: userPreferences?.financialGoal || '',
    });
  };

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-2.5 py-1.5 transition hover:bg-[#ecf6f2]"
        title="Open profile menu"
      >
        <div className="gradient-emerald flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white">
          {getInitials()}
        </div>
        <ChevronDown className={`h-4 w-4 text-[#3d4a42] transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-emerald-100 bg-white panel-shadow">
          <div className="gradient-emerald-soft px-6 pb-5 pt-7 text-center">
            <div className="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full gradient-emerald text-xl font-bold text-white shadow">
              {getInitials()}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-700 text-white">
                <Check className="h-3 w-3" />
              </span>
            </div>
            <p className="font-headline text-lg font-bold text-[#141d1b]">{user?.displayName || 'MoneyMitra User'}</p>
            <p className="text-xs text-[#3d4a42]">{user?.email}</p>
          </div>

          <div className="px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#3d4a42]/70">Financial Profile</h3>
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 transition hover:text-emerald-800"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <select
                  value={editedPreferences.occupation}
                  onChange={(e) => setEditedPreferences((prev) => ({ ...prev, occupation: e.target.value }))}
                  className="w-full rounded-xl border border-transparent bg-[#dbe5e1] px-3 py-2.5 text-sm text-[#141d1b] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select occupation</option>
                  {occupations.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>

                <select
                  value={editedPreferences.ageGroup}
                  onChange={(e) => setEditedPreferences((prev) => ({ ...prev, ageGroup: e.target.value }))}
                  className="w-full rounded-xl border border-transparent bg-[#dbe5e1] px-3 py-2.5 text-sm text-[#141d1b] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select age group</option>
                  {ageGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>

                <select
                  value={editedPreferences.financialGoal}
                  onChange={(e) => setEditedPreferences((prev) => ({ ...prev, financialGoal: e.target.value }))}
                  className="w-full rounded-xl border border-transparent bg-[#dbe5e1] px-3 py-2.5 text-sm text-[#141d1b] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select goal</option>
                  {goals.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCancelEdit}
                    disabled={saveLoading}
                    className="flex-1 rounded-xl border border-emerald-100 py-2 text-sm font-semibold text-[#3d4a42] transition hover:bg-[#ecf6f2]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    disabled={
                      saveLoading ||
                      !editedPreferences.occupation ||
                      !editedPreferences.ageGroup ||
                      !editedPreferences.financialGoal
                    }
                    className="gradient-emerald flex-1 rounded-xl py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {saveLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <p className="text-[11px] text-[#6d7a72]">Changes will apply to new conversations.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-xl bg-[#ecf6f2] px-3 py-2">
                  <span className="text-xs text-[#3d4a42]">Occupation</span>
                  <span className="text-xs font-semibold text-[#141d1b]">{userPreferences?.occupation || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#ecf6f2] px-3 py-2">
                  <span className="text-xs text-[#3d4a42]">Age Group</span>
                  <span className="text-xs font-semibold text-[#141d1b]">{userPreferences?.ageGroup || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#ecf6f2] px-3 py-2">
                  <span className="text-xs text-[#3d4a42]">Goal</span>
                  <span className="text-xs font-semibold text-[#141d1b]">{userPreferences?.financialGoal || 'Not set'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-emerald-100 px-6 py-4">
            <button className="mb-3 flex w-full items-center gap-3 rounded-xl bg-[#ecf6f2] px-4 py-3 text-left">
              <span className="rounded-lg bg-white p-2 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span>
                <p className="text-sm font-semibold text-[#141d1b]">Account Security</p>
                <p className="text-[11px] text-[#3d4a42]">2FA and privacy settings</p>
              </span>
            </button>

            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-bold transition ${
                logoutLoading
                  ? 'cursor-not-allowed border-red-200 bg-red-100 text-red-500'
                  : 'border-red-300 bg-white text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="h-4 w-4" />
              {logoutLoading ? 'Logging out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}

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
