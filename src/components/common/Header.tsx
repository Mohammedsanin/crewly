import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Sparkles, Database } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { NavigationTab } from '../../types';

interface HeaderProps {
  onOpenAddTaskModal: () => void;
  onOpenAddEmployeeModal: () => void;
  onOpenAddClientModal: () => void;
  onOpenNaturalTaskModal: () => void;
  onOpenSupabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddTaskModal,
  onOpenAddEmployeeModal,
  onOpenAddClientModal,
  onOpenNaturalTaskModal,
  onOpenSupabaseModal,
}) => {
  const { activeTab, recentActivities, activeRolePerspective } = useERP();
  const [showNotifications, setShowNotifications] = useState(false);

  const tabDetails: Record<NavigationTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: activeRolePerspective === 'admin' ? 'Executive Overview' : 'My Workspace',
      subtitle:
        activeRolePerspective === 'admin'
          ? 'Real-time throughput, SLA uptime & active deliverables'
          : 'Personal sprint items, backlog & deadlines',
    },
    tasks: {
      title: 'Tasks & Kanban',
      subtitle: 'Manage sprint cards, priorities, and workflow status',
    },
    employees: {
      title: 'Team Directory',
      subtitle: 'Organization roster, active roles & credential provisioning',
    },
    clients: {
      title: 'Client Accounts',
      subtitle: 'Enterprise partners, contact directory & CRM accounts',
    },
    financials: {
      title: 'Financial Analytics',
      subtitle: 'Revenue metrics, quarterly breakdown & cash flow',
    },
    company: {
      title: 'Company Settings',
      subtitle: 'Corporate profile, tax configuration & parameters',
    },
  };

  const currentTab = tabDetails[activeTab];

  return (
    <header className="px-8 pt-6 pb-2 flex items-center justify-between select-none bg-transparent relative z-40">
      {/* Frameless Title & Role Tag */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
            {currentTab.title}
          </h1>
          <span
            className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
              activeRolePerspective === 'admin'
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200/50'
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200/50'
            }`}
          >
            {activeRolePerspective === 'admin' ? 'Admin Mode' : 'Employee Mode'}
          </span>
        </div>
        <p className="text-xs text-slate-400 font-medium mt-1">
          {currentTab.subtitle}
        </p>
      </div>

      {/* Clean Top Command Pill (AI Copilot, Action Button & Notifications) */}
      <div className="relative flex items-center gap-2 p-1.5 rounded-3xl bg-white/95 backdrop-blur-2xl border border-indigo-100/90 shadow-md shadow-indigo-500/5">

        {/* AI Natural Task Pill Button */}
        <button
          onClick={onOpenNaturalTaskModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Natural Task AI</span>
        </button>

        {/* Dynamic Action Button */}
        {activeTab === 'tasks' && (
          <button
            onClick={onOpenAddTaskModal}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        )}

        {activeTab === 'employees' && activeRolePerspective === 'admin' && (
          <button
            onClick={onOpenAddEmployeeModal}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        )}

        {activeTab === 'clients' && (
          <button
            onClick={onOpenAddClientModal}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>
        )}



        {/* Notification Bell Pill */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-xl bg-slate-100/80 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-all flex items-center justify-center relative cursor-pointer"
            aria-label="System notifications"
          >
            <Bell className="w-4 h-4" />
            {recentActivities.length > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
              </>
            )}
          </button>

          {/* Opaque Audit Feed Notifications Panel Floating Above Page Content */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className="absolute right-0 top-full mt-3 w-80 rounded-3xl bg-white border border-indigo-100 shadow-2xl p-4 z-50 pointer-events-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Audit Feed
                  </span>
                  <span className="text-[10px] text-indigo-700 font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">
                    Realtime
                  </span>
                </div>

                {recentActivities.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-medium">
                    No recent activity logged yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recentActivities.slice(0, 5).map((act) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-bold text-slate-700">{act.user}</span>
                          <span>{act.time}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-snug">{act.action}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
