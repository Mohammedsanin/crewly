import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Tag,
  User,
  Calendar,
  Building2,
  Eye,
  Edit3,
  MessageSquare,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Task, TaskStatus, Priority } from '../../types';
import { kanbanCardVariants, checkmarkPulseVariants, pageVariants } from '../../theme/animations';
import { UserAvatar } from '../common/UserAvatar';
import { CustomSelect } from '../common/CustomSelect';
import { TimelineView } from './TimelineView';

interface KanbanBoardProps {
  onOpenAddTaskModal: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onOpenAddTaskModal }) => {
  const {
    tasks,
    updateTaskStatus,
    deleteTask,
    setSelectedTaskId,
    activeRolePerspective,
    currentUser,
    employees,
  } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [filterScope, setFilterScope] = useState<'my_tasks' | 'all'>('all');
  const [viewMode, setViewMode] = useState<'board' | 'timeline'>('board');
  const [animatingDoneTaskId, setAnimatingDoneTaskId] = useState<string | null>(null);

  const columns: { id: TaskStatus; title: string; color: string; badgeBg: string }[] = [
    { id: 'todo', title: 'To Do', color: 'border-slate-200', badgeBg: 'badge-pending' },
    { id: 'in_progress', title: 'In Progress', color: 'border-indigo-200', badgeBg: 'badge-progress' },
    { id: 'in_review', title: 'In Review', color: 'border-purple-200', badgeBg: 'badge-progress' },
    { id: 'done', title: 'Completed', color: 'border-emerald-200', badgeBg: 'badge-completed' },
  ];

  // Dynamic Task Assignment Matching (Supports both My Tasks and All Team Tasks)
  const displayTasks = tasks.filter((t) => {
    if (filterScope === 'my_tasks' && currentUser) {
      const uName = (currentUser.name || '').toLowerCase();
      const uEmail = (currentUser.email || '').toLowerCase();
      const aTo = (t.assignedTo || '').toLowerCase();
      return (
        aTo === uName ||
        aTo === uEmail ||
        aTo.includes(uName) ||
        (uName.length > 0 && uName.includes(aTo))
      );
    }
    return true;
  });

  const filteredTasks = displayTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.clientName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Instant zero-lag status update
    updateTaskStatus(taskId, targetStatus);

    if (targetStatus === 'done') {
      setAnimatingDoneTaskId(taskId);
      setTimeout(() => {
        setAnimatingDoneTaskId(null);
      }, 600);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="relative overflow-hidden rounded-3xl shadow-xl px-6 py-6 lg:px-8"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #5b21b6 70%, #7c3aed 100%)' }}
      >
        {[...Array(10)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white/15"
            style={{ width: 3+i%3, height: 3+i%3, left: `${i*10+5}%`, top: `${15+(i%4)*20}%` }}
            animate={{ y: [0,-10,0], opacity:[0.3,0.7,0.3] }}
            transition={{ duration: 2+i%3*0.5, repeat: Infinity, delay: i*0.15 }}
          />
        ))}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-bold mb-3">
              <CheckCircle2 className="w-3 h-3" /><span>Task Engine</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Sprint Kanban</h2>
            <p className="text-violet-200 text-sm mt-1">{filteredTasks.length} tasks · drag cards between columns</p>
          </div>
          <motion.button whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
            onClick={onOpenAddTaskModal}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-violet-700 text-xs font-black shadow-xl shadow-black/20 shrink-0">
            <Plus className="w-4 h-4" /><span>New Task</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ── Filter Bar ── */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm px-4 py-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Filter tasks by title, assignee..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all" />
        </div>

        {/* View Mode Toggle: Kanban Board vs Gantt Timeline */}
        <div className="flex items-center rounded-xl bg-slate-100/80 p-1 border border-slate-200 shrink-0">
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'board'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'timeline'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Gantt Timeline
          </button>
        </div>

        {/* Scope Toggle: All Sprint Tasks vs My Assigned Tasks */}
        <div className="flex items-center rounded-xl bg-slate-100/80 p-1 border border-slate-200 shrink-0">
          <button
            onClick={() => setFilterScope('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterScope === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilterScope('my_tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterScope === 'my_tasks'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Tasks
          </button>
        </div>

        <CustomSelect
          value={priorityFilter}
          onChange={setPriorityFilter}
          icon={<Filter className="w-3.5 h-3.5" />}
          options={[
            { value: 'all', label: 'All Priorities' },
            { value: 'urgent', label: 'Urgent', badgeDot: 'bg-rose-500' },
            { value: 'high', label: 'High Priority', badgeDot: 'bg-amber-500' },
            { value: 'medium', label: 'Medium Priority', badgeDot: 'bg-indigo-500' },
            { value: 'low', label: 'Low Priority', badgeDot: 'bg-slate-400' },
          ]}
        />
      </motion.div>

      {viewMode === 'timeline' ? (
        <TimelineView />
      ) : (
        <>
          {/* ── Kanban Columns ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              const colAccent: Record<string, string> = {
                todo: 'from-sky-400 via-blue-500 to-indigo-500',
                in_progress: 'from-indigo-500 via-violet-500 to-purple-500',
                in_review: 'from-amber-400 via-orange-500 to-rose-500',
                done: 'from-emerald-400 via-teal-500 to-cyan-500',
              };
              const colDotColor: Record<string, string> = {
                todo: 'bg-sky-500',
                in_progress: 'bg-indigo-500',
                in_review: 'bg-amber-500',
                done: 'bg-emerald-500',
              };

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl min-h-[460px] flex flex-col shadow-lg hover:shadow-xl transition-all overflow-hidden"
                >
                  {/* Top Gradient Accent Bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${colAccent[col.id]}`} />

                  {/* Column Header */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100/80 bg-white/40">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${colDotColor[col.id]} shadow-xs`} />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{col.title}</h3>
                    </div>
                    <span className="text-[10px] font-black text-white bg-slate-900 px-2.5 py-0.5 rounded-full shadow-xs font-mono">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Column Body / Cards List */}
                  <div className="p-3.5 flex-1 space-y-3.5">
                    <AnimatePresence mode="popLayout">
                      {colTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          layout
                          draggable
                          onDragStart={(e: any) => handleDragStart(e, task.id)}
                          onClick={() => setSelectedTaskId(task.id)}
                          variants={kanbanCardVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          whileHover={{ scale: 1.025, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm hover:shadow-xl hover:border-indigo-300/80 transition-all cursor-grab active:cursor-grabbing"
                        >
                          {/* Top subtle hover accent */}
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/80 transition-all duration-300" />

                          {/* Checkmark Pulse Overlay on Complete */}
                          {animatingDoneTaskId === task.id && (
                            <motion.div
                              variants={checkmarkPulseVariants}
                              initial="initial"
                              animate="animate"
                              className="absolute inset-0 bg-emerald-600/90 rounded-2xl flex items-center justify-center z-20 backdrop-blur-xs text-white"
                            >
                              <CheckCircle2 className="w-12 h-12" />
                            </motion.div>
                          )}

                          {/* Priority Badge & Card Actions */}
                          <div className="flex items-center justify-between mb-2.5">
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider ${
                                task.priority === 'urgent'
                                  ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-xs'
                                  : task.priority === 'high'
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                                  : task.priority === 'medium'
                                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {task.priority}
                            </span>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTaskId(task.id);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                                title="Edit / View Task Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {activeRolePerspective === 'admin' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(task.id);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-xs font-black text-slate-800 mb-1.5 leading-snug group-hover:text-indigo-600 transition-colors">
                            {task.title}
                          </h4>

                          {/* Linked Client / Company Badge */}
                          {task.clientName && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-200/80 text-[10px] font-extrabold mb-2.5 shadow-2xs">
                              <Building2 className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">{task.clientName}</span>
                            </div>
                          )}

                          {/* Description */}
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3 font-medium">
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

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {task.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1 font-bold"
                                >
                                  <Tag className="w-2.5 h-2.5 text-indigo-500" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Card Footer */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-800 font-extrabold">
                              <UserAvatar
                                src={employees.find((e) => e.name === task.assignedTo)?.avatar}
                                name={task.assignedTo}
                                className="w-5 h-5 rounded-full ring-2 ring-indigo-100"
                              />
                              <span className="truncate max-w-[90px]">{task.assignedTo}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {task.comments && task.comments.length > 0 && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTaskId(task.id);
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md hover:bg-indigo-100 transition-colors cursor-pointer"
                                  title={`${task.comments.length} comments`}
                                >
                                  <MessageSquare className="w-3 h-3 text-indigo-600" />
                                  <span>{task.comments.length}</span>
                                </span>
                              )}

                              <div
                                className={`flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-lg text-[10px] ${
                                  task.isOverdue
                                    ? 'bg-rose-500 text-white font-black animate-pulse shadow-xs'
                                    : 'text-slate-600 bg-slate-100 border border-slate-200/60'
                                }`}
                              >
                                <Calendar className="w-3 h-3" />
                                <span>{task.dueDate}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {colTasks.length === 0 && (
                      <div className="h-40 rounded-2xl border-2 border-dashed border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-indigo-50/20 flex flex-col items-center justify-center text-center p-4 group-hover:border-indigo-300 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-extrabold text-slate-600">No tasks in this stage</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Drag cards here to update status</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Global Empty State */}
          {filteredTasks.length === 0 && (
            <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto my-8 border border-indigo-100">
              <img
                src="/empty_tasks.png"
                alt="No tasks found"
                className="w-48 h-48 object-contain filter drop-shadow opacity-90"
              />
              <div>
                <h3 className="text-base font-bold text-slate-800">No tasks match your criteria</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search terms or priority filters, or create a brand new task.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPriorityFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
