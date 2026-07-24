import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Mail, Calendar, Building, LayoutGrid, List, Eye, Users, Sparkles, Trash2 } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { UserAvatar } from '../common/UserAvatar';
import { CustomSelect } from '../common/CustomSelect';

interface EmployeeListProps {
  onOpenAddEmployeeModal: () => void;
}

const statusStyle: Record<string, string> = {
  active:     'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  onboarding: 'bg-amber-500/10 text-amber-600 border-amber-200',
  leave:      'bg-rose-500/10 text-rose-600 border-rose-200',
  inactive:   'bg-slate-100 text-slate-500 border-slate-200',
};

export const EmployeeList: React.FC<EmployeeListProps> = ({ onOpenAddEmployeeModal }) => {
  const { employees, setSelectedEmployeeId, activeRolePerspective, deleteEmployee } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredEmployees = employees.filter((emp) => {
    // Hide system Developer account from Team Directory
    if (emp.id === 'emp-developer-master' || emp.email === 'developer@syncwave.io') {
      return false;
    }

    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* ── Page Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="relative overflow-hidden rounded-3xl shadow-xl px-6 py-6 lg:px-8"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)' }}
      >
        {/* particle dots */}
        {[...Array(10)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full bg-white/15"
            style={{ width: 3+i%3, height: 3+i%3, left: `${i*10+5}%`, top: `${15+(i%4)*20}%` }}
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2+i%3*0.5, repeat: Infinity, delay: i*0.15 }}
          />
        ))}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-bold mb-3 backdrop-blur-sm">
              <Users className="w-3 h-3" />
              <span>HR Module</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Team Directory</h2>
            <p className="text-indigo-200 text-sm mt-1">{employees.length} members · {employees.filter(e=>e.status==='active').length} active</p>
          </div>
          {activeRolePerspective === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={onOpenAddEmployeeModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 text-xs font-black shadow-xl shadow-black/20 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── Filter Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm px-4 py-3"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, role, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all backdrop-blur-sm"
            />
          </div>
          <CustomSelect
            value={deptFilter}
            onChange={setDeptFilter}
            options={[
              { value: 'all', label: 'All Departments' },
              { value: 'Engineering', label: 'Engineering', badgeDot: 'bg-indigo-500' },
              { value: 'Design', label: 'Design', badgeDot: 'bg-purple-500' },
              { value: 'Product', label: 'Product', badgeDot: 'bg-amber-500' },
              { value: 'Sales', label: 'Sales', badgeDot: 'bg-emerald-500' },
              { value: 'Operations', label: 'Operations', badgeDot: 'bg-rose-500' },
              { value: 'Finance', label: 'Finance', badgeDot: 'bg-teal-500' },
            ]}
          />
        </div>
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200 shrink-0">
          {(['grid', 'list'] as const).map((mode) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === mode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {mode === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Grid View ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredEmployees.map((emp, i) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 340, damping: 24 }}
                whileHover={{ y: -4, scale: 1.01 }}
                onClick={() => setSelectedEmployeeId(emp.id)}
                className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-md hover:shadow-xl cursor-pointer group"
              >
                {/* Top accent strip */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <UserAvatar src={emp.avatar} name={emp.name} className="w-14 h-14 rounded-2xl ring-2 ring-indigo-100 shadow-sm group-hover:ring-indigo-300 transition-all" />
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${emp.status === 'active' ? 'bg-emerald-400' : emp.status === 'leave' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800 group-hover:text-indigo-700 transition-colors leading-tight">{emp.name}</h3>
                        <p className="text-xs text-indigo-600 font-bold mt-0.5">{emp.role}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${statusStyle[emp.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {emp.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 mb-4">
                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /><span className="truncate">{emp.email}</span></div>
                    <div className="flex items-center gap-2"><Building className="w-3.5 h-3.5 text-slate-400 shrink-0" /><span>{emp.department}</span></div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400 font-medium"><Calendar className="w-3 h-3" />Joined {emp.joinedDate}</span>
                    <div className="flex items-center gap-2">
                      {activeRolePerspective === 'admin' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete ${emp.name} from the employee directory?`)) {
                              deleteEmployee(emp.id);
                            }
                          }}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="flex items-center gap-1 text-indigo-600 font-black group-hover:underline"><Eye className="w-3 h-3" />Profile →</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredEmployees.length === 0 && (
            <div className="col-span-3 py-16 text-center text-slate-400 text-sm">No team members match your search.</div>
          )}
        </div>
      )}

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-md overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] uppercase font-black text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEmployees.map((emp, i) => (
                  <motion.tr key={emp.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className="hover:bg-indigo-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={emp.avatar} name={emp.name} className="w-9 h-9 rounded-xl ring-1 ring-slate-100" />
                        <div><p className="font-black text-slate-800">{emp.name}</p><p className="text-[10px] text-slate-400">{emp.email}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{emp.department}</td>
                    <td className="px-5 py-3.5 text-indigo-600 font-bold">{emp.role}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${statusStyle[emp.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-medium">{emp.joinedDate}</td>
                    <td className="px-5 py-3.5 text-right">
                      {activeRolePerspective === 'admin' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete ${emp.name} from directory?`)) {
                              deleteEmployee(emp.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
