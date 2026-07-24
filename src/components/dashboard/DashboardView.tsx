import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimationFrame } from 'framer-motion';
import {
  DollarSign,
  CheckCircle2,
  Users,
  Building2,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  Activity,
  User,
  TrendingUp,
  Shield,
  Cpu,
  Wifi,
  BarChart2,
  Circle,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { KPIAnimatedCard } from './KPIAnimatedCard';
import { UserAvatar } from '../common/UserAvatar';

/* ─────────────────────────── Animated Waveform ─────────────────────────── */
const WaveBar: React.FC<{ delay: number; color: string }> = ({ delay, color }) => (
  <motion.div
    className="w-1 rounded-full"
    style={{ background: color, minHeight: 4 }}
    animate={{ height: ['8px', '28px', '6px', '22px', '8px'] }}
    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

const LiveWaveform: React.FC<{ color?: string }> = ({ color = '#6366f1' }) => (
  <div className="flex items-center gap-0.5 h-8">
    {[0, 0.1, 0.2, 0.3, 0.15, 0.25, 0.05].map((d, i) => (
      <WaveBar key={i} delay={d} color={color} />
    ))}
  </div>
);

/* ─────────────────────────── Floating Orb ──────────────────────────────── */
const FloatingOrb: React.FC<{
  size: number; color: string; x: string; y: string; duration: number;
}> = ({ size, color, x, y, duration }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, background: color, left: x, top: y, filter: 'blur(60px)' }}
    animate={{ y: [0, -30, 12, -18, 0], x: [0, 14, -10, 6, 0], scale: [1, 1.12, 0.94, 1.06, 1] }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ─────────────────────────── Pulse Ring ────────────────────────────────── */
const PulseRing: React.FC<{ color: string }> = ({ color }) => (
  <span className="relative flex h-2.5 w-2.5">
    <motion.span
      className="absolute inline-flex h-full w-full rounded-full opacity-75"
      style={{ background: color }}
      animate={{ scale: [1, 2.4], opacity: [0.75, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
    />
    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: color }} />
  </span>
);

/* ─────────────────────────── Sparkline Mini Chart ──────────────────────── */
const SparklinePath: React.FC<{ color: string }> = ({ color }) => {
  const points = [40, 55, 35, 62, 48, 70, 52, 80, 60, 75];
  const w = 80, h = 32;
  const minV = Math.min(...points), maxV = Math.max(...points);
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - minV) / (maxV - minV)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <motion.polyline
        points={pts}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />
    </svg>
  );
};

/* ─────────────────────────── System Health Row ─────────────────────────── */
const HealthRow: React.FC<{
  icon: React.ReactNode; label: string; value: string; pct: number; color: string;
}> = ({ icon, label, value, pct, color }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-slate-600 font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-black text-slate-800">{value}</span>
    </div>
    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  </div>
);

/* ═══════════════════════════ Main Dashboard ═══════════════════════════════ */
export const DashboardView: React.FC = () => {
  const {
    tasks, employees, clients, recentActivities,
    setActiveTab, setSelectedTaskId, activeRolePerspective, currentUser,
  } = useERP();

  const totalARR = clients.reduce((acc, c) => acc + c.contractValue, 0);
  const displayTasks =
    activeRolePerspective === 'employee'
      ? tasks.filter((t) => t.assignedTo === currentUser?.name)
      : tasks;

  const activeTasksCount   = displayTasks.filter((t) => t.status !== 'done').length;
  const completedTasksCount = displayTasks.filter((t) => t.status === 'done').length;
  const activeTeamCount    = employees.filter((e) => e.status === 'active').length;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const priorityBg: Record<string, string> = {
    urgent: 'bg-rose-500/10 text-rose-600 border-rose-200',
    high:   'bg-amber-500/10 text-amber-600 border-amber-200',
    medium: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    low:    'bg-slate-100 text-slate-500 border-slate-200',
  };
  const statusBg: Record<string, string> = {
    done:        'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    in_progress: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    todo:        'bg-slate-100 text-slate-500 border-slate-200',
    blocked:     'bg-rose-500/10 text-rose-600 border-rose-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative space-y-6 pb-12 min-h-screen"
    >
      {/* ── Floating ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <FloatingOrb size={380} color="rgba(99,102,241,0.07)"  x="60%"  y="-10%" duration={9} />
        <FloatingOrb size={260} color="rgba(139,92,246,0.08)"  x="5%"   y="30%"  duration={11} />
        <FloatingOrb size={200} color="rgba(16,185,129,0.06)"  x="80%"  y="60%"  duration={13} />
        <FloatingOrb size={160} color="rgba(245,158,11,0.06)"  x="20%"  y="75%"  duration={10} />
      </div>

      <div className="relative z-10 space-y-6">
        {/* ══ Welcome Hero Banner ══ */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="relative overflow-hidden rounded-3xl border border-indigo-100/80 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #4338ca 65%, #6366f1 100%)',
          }}
        >
          {/* Animated mesh gradient overlay */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            style={{
              backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.6) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.5) 0%, transparent 55%)',
              backgroundSize: '200% 200%',
            }}
          />

          {/* Particle dots */}
          {[...Array(14)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                left: `${(i / 14) * 100}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{ y: [0, -12, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5 + (i % 4) * 0.7, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 lg:p-8">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-bold mb-3 backdrop-blur-sm"
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span>{activeRolePerspective === 'admin' ? 'Executive Mode Active' : 'Personal Sprint Space'}</span>
                <PulseRing color="#34d399" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl lg:text-4xl font-black text-white tracking-tight"
              >
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  {currentUser?.name?.split(' ')[0] ?? 'Alex'}
                </span>{' '}
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, 0] }}
                  transition={{ duration: 1.5, delay: 0.8, repeat: Infinity, repeatDelay: 5 }}
                  className="inline-block"
                >👋</motion.span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-indigo-200 mt-2 max-w-xl font-medium"
              >
                {activeRolePerspective === 'admin'
                  ? `All systems nominal. ${activeTasksCount} active deliverables in flight across ${activeTeamCount} team members.`
                  : `You have ${activeTasksCount} active tasks assigned to your sprint backlog.`}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-3 shrink-0"
            >
              {/* Live waveform badge */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                <LiveWaveform color="#a5b4fc" />
                <div className="text-left">
                  <p className="text-[9px] text-indigo-300 font-black uppercase tracking-widest">Live Status</p>
                  <p className="text-xs text-white font-bold">All Systems Go</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab('tasks')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 text-xs font-black shadow-xl shadow-black/20 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Go to Kanban</span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* ══ Quick Actions Strip ══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 26 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: 'Kanban Board', icon: Activity,   tab: 'tasks',      color: '#6366f1', bg: 'from-indigo-500/10 to-violet-500/5',  border: 'border-indigo-200/60', desc: `${activeTasksCount} active tasks` },
            { label: 'Team Directory', icon: Users,    tab: 'employees',  color: '#8b5cf6', bg: 'from-violet-500/10 to-purple-500/5',  border: 'border-violet-200/60', desc: `${activeTeamCount} members online` },
            { label: 'Client CRM',   icon: Building2, tab: 'clients',    color: '#f59e0b', bg: 'from-amber-500/10 to-orange-500/5',   border: 'border-amber-200/60',  desc: `${clients.length} enterprises` },
            { label: 'Financials',   icon: DollarSign,tab: 'financials', color: '#10b981', bg: 'from-emerald-500/10 to-teal-500/5',   border: 'border-emerald-200/60',desc: 'Revenue & invoices' },
          ].map(({ label, icon: Icon, tab, color, bg, border, desc }) => (
            <motion.button
              key={tab}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab as any)}
              className={`relative overflow-hidden flex items-center gap-3 p-4 rounded-2xl border ${border} bg-gradient-to-br ${bg} backdrop-blur-sm text-left transition-all group`}
            >
              {/* Hover sweep */}
              <motion.div
                className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 pointer-events-none"
              />
              <div className="p-2 rounded-xl shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">{label}</p>
                <p className="text-[10px] text-slate-500 truncate font-medium">{desc}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 ml-auto shrink-0 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
            </motion.button>
          ))}
        </motion.div>

        {/* ══ Team Member Status Strip ══ */}
        {employees.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-sm px-5 py-3.5 flex items-center gap-4"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">Team Online</span>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
              {employees.slice(0, 8).map((emp, i) => (
                <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  title={`${emp.name} — ${emp.role}`}
                  className="relative shrink-0 group cursor-default"
                >
                  <UserAvatar
                    src={emp.avatar}
                    name={emp.name}
                    className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-slate-100 group-hover:scale-110 transition-transform"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      emp.status === 'active' ? 'bg-emerald-400' :
                      emp.status === 'leave'  ? 'bg-amber-400' : 'bg-slate-300'
                    }`}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
                    {emp.name}
                  </div>
                </motion.div>
              ))}
              {employees.length > 8 && (
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                  +{employees.length - 8}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <PulseRing color="#10b981" />
              <span className="text-[11px] font-bold text-slate-600">{activeTeamCount} active</span>
            </div>
          </motion.div>
        )}

        {/* ══ Middle: Tasks + Activity ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Panel */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 backdrop-blur-xl shadow-lg p-6 space-y-4">
            {/* Subtle gradient top strip */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  {activeRolePerspective === 'admin' ? 'Company Kanban Tasks' : 'My Sprint Tasks'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 ml-8">Click any card to open Task Detail Drawer</p>
              </div>
              <motion.button
                whileHover={{ x: 3 }}
                onClick={() => setActiveTab('tasks')}
                className="flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {displayTasks.slice(0, 5).map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -16, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 16, scale: 0.97 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 340, damping: 24 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="group relative p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  >
                    {/* Hover gradient sheen */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-indigo-50/40 to-transparent pointer-events-none rounded-2xl" />

                    <div className="relative flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${priorityBg[task.priority] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {task.priority}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors truncate">
                            {task.title}
                          </h4>
                        </div>
                         <p className="text-[11px] text-slate-400 truncate">
                           {task.description ? (
                             task.description
                               .replace(/###\s+/g, '')
                               .replace(/##\s+/g, '')
                               .replace(/-\s+\[\s*\]/g, '• ')
                               .replace(/-\s+\[\s*[xX]\s*\]/g, '✓ ')
                               .replace(/\s+/g, ' ')
                               .trim()
                           ) : (
                             ''
                           )}
                         </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500 font-semibold hidden sm:flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-300" />
                          {task.assignedTo}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${statusBg[task.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {displayTasks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-10 flex flex-col items-center gap-3 text-slate-400"
                >
                  <motion.div
                    animate={{ scale: [1, 1.06, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="p-3 rounded-2xl bg-indigo-50"
                  >
                    <Zap className="w-6 h-6 text-indigo-300" />
                  </motion.div>
                  <p className="text-xs font-medium">No active tasks. Create one with the AI action bar!</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Panel: Activity + System Health */}
          <div className="flex flex-col gap-5">
            {/* Activity Feed */}
            <div className="relative overflow-hidden flex-1 rounded-3xl border border-white/70 bg-white/70 backdrop-blur-xl shadow-lg p-5">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  Audit Activity Log
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <PulseRing color="#10b981" />
                  <span>Live</span>
                </div>
              </div>

              <div className="space-y-3 relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-violet-100 to-transparent" />

                <AnimatePresence mode="popLayout">
                  {recentActivities.slice(0, 5).map((act, i) => (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="relative pl-5 text-xs"
                    >
                      <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full bg-white border-2 border-indigo-300 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      </div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-black text-slate-700 text-[11px]">{act.user}</span>
                        <span className="text-[10px] text-slate-400">{act.time}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-snug">{act.action}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {recentActivities.length === 0 && (
                  <p className="text-xs text-slate-400 italic pl-5">No activity recorded yet.</p>
                )}
              </div>
            </div>

            {/* System Health Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 backdrop-blur-xl shadow-lg p-5 space-y-4"
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-50">
                    <Shield className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  System Health
                </h3>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  100% Compliant
                </span>
              </div>

              <div className="space-y-3">
                <HealthRow
                  icon={<Cpu className="w-3 h-3 text-indigo-500" />}
                  label="Security Score"
                  value="100%"
                  pct={100}
                  color="linear-gradient(90deg, #6366f1, #8b5cf6)"
                />
                <HealthRow
                  icon={<Wifi className="w-3 h-3 text-emerald-500" />}
                  label="SLA Uptime"
                  value="99.98%"
                  pct={99.98}
                  color="linear-gradient(90deg, #10b981, #34d399)"
                />
                <HealthRow
                  icon={<BarChart2 className="w-3 h-3 text-amber-500" />}
                  label="Sprint Velocity"
                  value={`${completedTasksCount} done`}
                  pct={Math.min(completedTasksCount * 20, 100)}
                  color="linear-gradient(90deg, #f59e0b, #fbbf24)"
                />
              </div>

              {/* Sparkline mini chart */}
              <div className="flex items-end justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">7-Day Trend</p>
                  <p className="text-xs font-black text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +14.2%
                  </p>
                </div>
                <SparklinePath color="#6366f1" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
