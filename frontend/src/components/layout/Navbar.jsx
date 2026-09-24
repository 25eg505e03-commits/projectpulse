import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import { notificationService } from '../../services/api';
import MemberAvatar from '../common/MemberAvatar';
import {
  Bell,
  Search,
  Building2,
  ChevronDown,
  LogOut,
  User,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ onOpenCreateOrg }) => {
  const { user, logout } = useAuth();
  const { organizations, activeOrg, selectOrganization } = useOrganization();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationService.getNotifications();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      // Ignore background errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      {/* Search & Org Selector */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Organization Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-sm text-slate-200 transition-colors"
          >
            <Building2 className="w-4 h-4 text-sky-400" />
            <span className="font-medium max-w-[140px] truncate">
              {activeOrg ? activeOrg.name : 'Select Org'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showOrgDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                My Organizations
              </div>
              {organizations.map((org) => (
                <button
                  key={org._id}
                  onClick={() => {
                    selectOrganization(org);
                    setShowOrgDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    activeOrg?._id === org._id ? 'text-sky-400 font-semibold bg-slate-800/40' : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">{org.name}</span>
                  {activeOrg?._id === org._id && <CheckCircle className="w-4 h-4 text-sky-400 shrink-0" />}
                </button>
              ))}
              <div className="border-t border-slate-800 mt-1 pt-1 px-2">
                <button
                  onClick={() => {
                    setShowOrgDropdown(false);
                    if (onOpenCreateOrg) onOpenCreateOrg();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-sky-400 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create New Organization
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Global search tasks, issues, projects..."
            onClick={() => navigate('/projects')}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
          />
        </div>
      </div>

      {/* Actions & User Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-sky-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 max-h-96 overflow-y-auto">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-100">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-sky-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-800/50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 text-xs space-y-1 transition-colors ${
                        n.read ? 'opacity-60 hover:opacity-100' : 'bg-sky-950/20 font-medium'
                      }`}
                    >
                      <p className="text-slate-200">{n.message}</p>
                      <span className="text-[10px] text-slate-500 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <MemberAvatar user={user} size="md" />
            <span className="text-sm font-medium text-slate-200 hidden lg:inline-block">
              {user?.name}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                My Profile
              </Link>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
