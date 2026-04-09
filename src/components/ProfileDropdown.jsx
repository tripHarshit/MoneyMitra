import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Edit3, LogOut, ShieldCheck, Check, X } from 'lucide-react';

const ProfileDropdown = ({ userPreferences, onUpdatePreferences, trigger }) => {
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
  const containerRef = useRef(null);

  const occupations = [
    'Student', 'Working Professional', 'Freelancer',
    'Small Business Owner', 'Homemaker', 'Retired', 'Self-Employed', 'Other',
  ];
  const ageGroups = ['18-25', '26-35', '36-45', '46-55', '55+'];
  const goals = ['Learn Basics', 'Save Money', 'Manage Debt', 'Invest & Grow', 'Plan Retirement', 'Budget Management'];

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (!isEditing) setIsOpen(false);
      }
    };
    const handleEsc = (e) => { if (e.key === 'Escape' && !isEditing) setIsOpen(false); };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, isEditing]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch {
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
    } catch {
      // ignore
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

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'MoneyMitra User';
  const initials = getInitials();

  const dropdownClass = trigger
    ? 'absolute left-0 bottom-full z-60 mb-2 w-80 overflow-hidden rounded-2xl border border-[#d4e8dc] bg-white shadow-modal scale-in'
    : 'absolute right-0 top-full z-60 mt-2 w-80 overflow-hidden rounded-2xl border border-[#d4e8dc] bg-white shadow-modal scale-in';

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      {trigger ? (
        <div onClick={() => setIsOpen((prev) => !prev)} role="button" aria-label="Open profile menu" aria-expanded={isOpen}>
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open profile menu"
          aria-expanded={isOpen}
          className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition ${
            isOpen
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-[#d4e8dc] bg-white hover:bg-[#e8f5ed]'
          }`}
        >
          <div className="gradient-emerald flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white">
            {initials}
          </div>
          <ChevronDown
            className={`h-3.5 w-3.5 text-[#3d5246] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className={dropdownClass}
          style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}
        >
          {/* Header */}
          <div className="relative bg-linear-to-b from-[#e8f5ed] to-white px-5 pb-4 pt-5 text-center">
            {/* Close button */}
            <button
              onClick={() => { if (!isEditing) setIsOpen(false); }}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-[#6b7e73] transition hover:bg-[#e8f5ed] hover:text-[#0e1c16]"
              aria-label="Close profile menu"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Avatar */}
            <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full gradient-emerald text-lg font-bold text-white shadow-md shadow-emerald-900/20">
              {initials}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-600">
                <Check className="h-2.5 w-2.5 text-white" />
              </span>
            </div>

            <p className="font-headline text-base font-bold text-[#0e1c16]">{displayName}</p>
            <p className="text-xs text-[#6b7e73]">{user?.email}</p>
          </div>

          {/* Profile info */}
          <div className="px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b7e73]">Financial Profile</h3>
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2.5">
                {[
                  { key: 'occupation', label: 'Occupation', options: occupations },
                  { key: 'ageGroup', label: 'Age Group', options: ageGroups },
                  { key: 'financialGoal', label: 'Goal', options: goals },
                ].map(({ key, label, options }) => (
                  <select
                    key={key}
                    value={editedPreferences[key]}
                    onChange={(e) => setEditedPreferences((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-[#d4e8dc] bg-[#f0faf4] px-3 py-2.5 text-sm text-[#0e1c16] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 transition"
                  >
                    <option value="">Select {label}</option>
                    {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ))}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCancelEdit}
                    disabled={saveLoading}
                    className="flex-1 rounded-xl border border-[#d4e8dc] py-2 text-sm font-semibold text-[#3d5246] transition hover:bg-[#e8f5ed]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    disabled={saveLoading || !editedPreferences.occupation || !editedPreferences.ageGroup || !editedPreferences.financialGoal}
                    className="gradient-emerald flex-1 rounded-xl py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saveLoading ? 'Saving…' : 'Save'}
                  </button>
                </div>
                <p className="text-[11px] text-[#9aada3]">Changes apply to new conversations.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {[
                  { label: 'Occupation', value: userPreferences?.occupation },
                  { label: 'Age Group',  value: userPreferences?.ageGroup },
                  { label: 'Goal',       value: userPreferences?.financialGoal },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between rounded-xl bg-[#f0faf4] px-3 py-2.5">
                    <span className="text-xs text-[#6b7e73]">{label}</span>
                    <span className="text-xs font-semibold text-[#0e1c16]">{value || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="border-t border-[#e8f5ed] px-5 pb-4 pt-3">
            <button className="mb-2.5 flex w-full items-center gap-3 rounded-xl border border-[#d4e8dc] bg-[#f8fcfa] px-4 py-3 text-left transition hover:bg-[#e8f5ed]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span>
                <p className="text-sm font-semibold text-[#0e1c16]">Account Security</p>
                <p className="text-[11px] text-[#6b7e73]">2FA and privacy settings</p>
              </span>
            </button>

            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-bold transition ${
                logoutLoading
                  ? 'cursor-not-allowed border-red-100 bg-red-50 text-red-400'
                  : 'border-red-200 bg-white text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="h-4 w-4" />
              {logoutLoading ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
