import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Building2,
  DollarSign,
  Settings,
  LogOut,
  Bot,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { NavigationTab } from '../../types';
import { UserAvatar } from './UserAvatar';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  adminOnly?: boolean;
}

interface SidebarProps {
  onOpenAIAssistant: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAIAssistant }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setCurrentUser,
    activeRolePerspective,
    setActiveRolePerspective,
    tasks,
    employees,
    clients,
    companyInfo,
  } = useERP();

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const allNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: activeRolePerspective === 'admin' ? 'Dashboard' : 'My Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'tasks',
      label: activeRolePerspective === 'admin' ? 'Tasks & Kanban' : 'My Tasks',
      icon: KanbanSquare,
      badge: tasks.filter((t) => t.status !== 'done').length,
    },
    {
      id: 'employees',
      label: 'Team Directory',
      icon: Users,
      badge: employees.length,
      adminOnly: true,
    },
    {
      id: 'clients',
      label: 'Clients & CRM',
      icon: Building2,
      badge: clients.length,
    },
    {
      id: 'financials',
      label: 'Financials',
      icon: DollarSign,
      adminOnly: true,
    },
    {
      id: 'company',
      label: 'Settings',
      icon: Settings,
      adminOnly: false,
    },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || activeRolePerspective === 'admin');
  const isAdminUser = currentUser?.role === 'Admin';

  return (
    <aside className="w-20 flex flex-col h-screen sticky top-0 shrink-0 z-30 select-none py-5 items-center justify-between">
      {/* Creative Floating Glass Dock Container */}
      <div className="w-14 bg-white/80 backdrop-blur-2xl border border-indigo-100/90 rounded-3xl shadow-xl shadow-indigo-500/5 py-4 px-2 flex flex-col items-center justify-between h-full relative">
        
        {/* Top Section: Logo & Admin-Only Role Toggle */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Brand Logo Mark */}
          <motion.div
            whileHover={{ scale: 1.15, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="relative group cursor-pointer p-1"
          >
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200/60 p-1.5 shadow-xs flex items-center justify-center overflow-hidden">
              <img src={companyInfo.logo || "/logo_mark.png"} alt="Company Logo" className="w-full h-full object-contain" />
            </div>
          </motion.div>

          <div className="w-6 h-[1px] bg-slate-200/60 my-0.5" />

          {/* Role Switcher Animated Icon Button (Visible to Admin Users ONLY) */}
          {isAdminUser && (
            <div
              className="relative flex justify-center w-full"
              onMouseEnter={() => setHoveredId('role')}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setActiveRolePerspective(activeRolePerspective === 'admin' ? 'employee' : 'admin')
                }
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                  activeRolePerspective === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100/80'
                }`}
              >
                <Shield className="w-4 h-4" />
              </motion.button>

              {/* Floating Label Badge */}
              <AnimatePresence>
                {hoveredId === 'role' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white rounded-2xl shadow-2xl px-3.5 py-2 z-50 whitespace-nowrap pointer-events-none"
                  >
                    <p className="text-xs font-extrabold text-white">
                      {activeRolePerspective === 'admin' ? 'Admin Perspective' : 'Employee Perspective'}
                    </p>
                    <p className="text-[10px] text-indigo-300 font-semibold">Click to preview employee layout</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Seamless Dock Navigation Items with Sliding Active Capsule */}
          <nav className="space-y-2 w-full flex flex-col items-center mt-2 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isHovered = hoveredId === item.id;

              return (
                <div
                  key={item.id}
                  className="relative flex justify-center w-full"
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Fluid Sliding Active Capsule */}
                  {isActive && (
                    <motion.div
                      layoutId="dockActivePill"
                      className="absolute inset-0 bg-indigo-600 rounded-2xl shadow-md shadow-indigo-600/30"
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 28,
                      }}
                    />
                  )}

                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-150 cursor-pointer outline-none ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 hover:text-indigo-600'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />

                    {/* Notification Badge Dot */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                          isActive ? 'bg-white ring-2 ring-indigo-600' : 'bg-indigo-500 ring-2 ring-white animate-pulse'
                        }`}
                      />
                    )}
                  </motion.button>

                  {/* Floating Popover Label Badge */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                        onClick={() => setActiveTab(item.id)}
                        className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white rounded-2xl shadow-2xl px-3.5 py-2 z-50 flex items-center gap-2.5 whitespace-nowrap cursor-pointer hover:bg-slate-800 transition-colors"
                      >
                        <span className="text-xs font-extrabold">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: AI Copilot & User Profile Avatar */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* AI Copilot Icon Button */}
          <div
            className="relative flex justify-center w-full"
            onMouseEnter={() => setHoveredId('ai')}
            onMouseLeave={() => setHoveredId(null)}
          >
            <motion.button
              whileHover={{ scale: 1.15, rotate: 6 }}
              whileTap={{ scale: 0.9 }}
              onClick={onOpenAIAssistant}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 cursor-pointer"
            >
              <Bot className="w-4.5 h-4.5 text-white" />
            </motion.button>

            {/* Floating AI Tooltip */}
            <AnimatePresence>
              {hoveredId === 'ai' && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  onClick={onOpenAIAssistant}
                  className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white rounded-2xl shadow-2xl px-3.5 py-2 z-50 whitespace-nowrap cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <p className="text-xs font-extrabold text-white">SYNCWAVE AI Copilot</p>
                  </div>
                  <p className="text-[10px] text-indigo-300 font-semibold">Click to ask assistant</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Avatar Icon */}
          {currentUser && (
            <div
              className="relative flex justify-center w-full"
              onMouseEnter={() => setHoveredId('user')}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                className="w-10 h-10 rounded-2xl p-0.5 overflow-hidden ring-2 ring-indigo-200 hover:ring-indigo-400 transition-all cursor-pointer shadow-xs"
              >
                <UserAvatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  className="w-full h-full rounded-xl"
                />
              </motion.button>

              {/* Floating User Tooltip */}
              <AnimatePresence>
                {hoveredId === 'user' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className="absolute left-full ml-4 bottom-0 bg-slate-900 text-white rounded-2xl shadow-2xl p-3 z-50 whitespace-nowrap min-w-[160px]"
                  >
                    <div className="pb-1.5 mb-1.5 border-b border-slate-800">
                      <p className="text-xs font-bold text-white">{currentUser.name}</p>
                      <p className="text-[10px] text-indigo-300 font-semibold">{currentUser.role}</p>
                    </div>

                    <button
                      onClick={() => setCurrentUser(null)}
                      className="w-full flex items-center justify-between text-xs text-rose-400 font-bold hover:bg-slate-800 p-1.5 rounded-xl transition-colors"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
