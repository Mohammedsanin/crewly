import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Building2,
  Calendar,
  Sparkles,
  Send,
  MessageSquare,
  Clock,
  Trash2,
  Tag,
  CheckCircle2,
  Edit3,
  Check,
  Save,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { TaskStatus, Priority } from '../../types';
import { enhanceTaskDescription } from '../../services/aiService';
import { UserAvatar } from '../common/UserAvatar';
import { CustomSelect } from '../common/CustomSelect';

interface TaskDetailDrawerProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ taskId, onClose }) => {
  const {
    tasks,
    updateTaskStatus,
    updateTaskDetails,
    addTaskComment,
    deleteTask,
    employees,
    clients,
    setSelectedEmployeeId,
    setSelectedClientId,
    setActiveTab,
    activeRolePerspective,
    addToast,
    currentUser,
  } = useERP();

  const task = tasks.find((t) => t.id === taskId);

  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [isAssigneeMenuOpen, setIsAssigneeMenuOpen] = useState(false);
  const assigneeMenuRef = useRef<HTMLDivElement>(null);

  // Edit Form Local State
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editStatus, setEditStatus] = useState<TaskStatus>('todo');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editClientName, setEditClientName] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');

  // Close assignee menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (assigneeMenuRef.current && !assigneeMenuRef.current.contains(e.target as Node)) {
        setIsAssigneeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state when task changes or edit mode opens
  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description);
      setEditPriority(task.priority);
      setEditStatus(task.status);
      setEditAssignedTo(task.assignedTo);
      setEditClientName(task.clientName || '');
      setEditDueDate(task.dueDate);
      setEditTagsInput(task.tags ? task.tags.join(', ') : '');
    }
  }, [task, isEditing]);

  if (!task) return null;

  const assignedEmp = employees.find((e) => e.name === task.assignedTo);
  const realEmployees = employees.filter(
    (e) => e.id !== 'emp-developer-master' && e.email !== 'developer@crewly.io'
  );

  const handleQuickReassign = (empName: string) => {
    updateTaskDetails(task.id, { assignedTo: empName });
    setIsAssigneeMenuOpen(false);
    addToast({
      type: 'success',
      title: 'Task Reassigned',
      message: `"${task.title}" assigned to ${empName}.`,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const matchedClient = clients.find((c) => c.companyName === editClientName);

    updateTaskDetails(task.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      status: editStatus,
      assignedTo: editAssignedTo,
      clientName: editClientName || undefined,
      clientId: matchedClient?.id || task.clientId,
      dueDate: editDueDate,
      tags: editTagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setIsEditing(false);
    addToast({
      type: 'success',
      title: 'Task Updated',
      message: `"${editTitle}" has been updated.`,
    });
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTaskStatus(task.id, newStatus);
  };

  const handleEnhanceDescription = async () => {
    setIsEnhancing(true);
    const enhanced = await enhanceTaskDescription(task.description);
    updateTaskDetails(task.id, { description: enhanced });
    setEditDescription(enhanced);
    setIsEnhancing(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addTaskComment(task.id, commentText);
    setCommentText('');
  };

  const handleJumpToEmployee = () => {
    const emp = employees.find((e) => e.name === task.assignedTo);
    if (emp) {
      setSelectedEmployeeId(emp.id);
      setActiveTab('employees');
      onClose();
    }
  };

  const handleJumpToClient = () => {
    const cli = clients.find((c) => c.companyName === task.clientName || c.id === task.clientId);
    if (cli) {
      setSelectedClientId(cli.id);
      setActiveTab('clients');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {taskId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Slide-in Drawer Card */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative w-full max-w-xl bg-white border-l border-indigo-100 shadow-2xl h-full flex flex-col z-10 overflow-hidden select-none"
          >
            {/* Top Accent Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />

            {/* Header */}
            <div className="p-5 border-b border-indigo-50 bg-[#FAFAF7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${
                    task.priority === 'urgent'
                      ? 'badge-blocked'
                      : task.priority === 'high'
                      ? 'badge-pending'
                      : 'badge-progress'
                  }`}
                >
                  {task.priority}
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {task.id}</span>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Task</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-extrabold cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}

                {activeRolePerspective === 'admin' && (
                  <button
                    onClick={() => {
                      deleteTask(task.id);
                      onClose();
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {!isEditing ? (
                /* READ ONLY VIEW */
                <>
                  {/* Task Title & Metadata */}
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 leading-tight mb-3">
                      {task.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {/* Interactive Assignee Badge */}
                      <div className="relative" ref={assigneeMenuRef}>
                        <button
                          onClick={() => setIsAssigneeMenuOpen(!isAssigneeMenuOpen)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/90 hover:bg-indigo-100 text-indigo-900 font-extrabold text-xs shadow-xs transition-all cursor-pointer group"
                          title="Click to reassign task"
                        >
                          <UserAvatar src={assignedEmp?.avatar} name={task.assignedTo} className="w-5 h-5 rounded-full" />
                          <span>{task.assignedTo}</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-indigo-500 transition-transform ${isAssigneeMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Quick Reassign Dropdown Menu */}
                        <AnimatePresence>
                          {isAssigneeMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 6, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl border border-indigo-100 shadow-2xl p-2 z-30"
                            >
                              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reassign Task</span>
                                <button
                                  onClick={handleJumpToEmployee}
                                  className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                                >
                                  View Profile →
                                </button>
                              </div>
                              <div className="py-1 max-h-48 overflow-y-auto space-y-1">
                                {realEmployees.length > 0 ? (
                                  realEmployees.map((emp) => (
                                    <button
                                      key={emp.id}
                                      onClick={() => handleQuickReassign(emp.name)}
                                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                                        task.assignedTo === emp.name
                                          ? 'bg-indigo-50 text-indigo-900 font-black'
                                          : 'hover:bg-slate-50 text-slate-700 font-medium'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <UserAvatar src={emp.avatar} name={emp.name} className="w-6 h-6 rounded-full" />
                                        <div className="text-left">
                                          <p className="leading-tight">{emp.name}</p>
                                          <p className="text-[10px] text-slate-400 font-normal">{emp.role}</p>
                                        </div>
                                      </div>
                                      {task.assignedTo === emp.name && (
                                        <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                                      )}
                                    </button>
                                  ))
                                ) : (
                                  <div className="p-2 text-center text-xs text-slate-400">No active team members.</div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Linked Client / Company Pill */}
                      {task.clientName ? (
                        <button
                          onClick={handleJumpToClient}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 border border-amber-200/90 font-extrabold text-xs transition-all cursor-pointer shadow-xs"
                          title="Click to view Linked Client CRM Account"
                        >
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{task.clientName}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-bold text-xs transition-colors cursor-pointer"
                          title="Link this deliverable to a Client Company"
                        >
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>+ Link Company</span>
                        </button>
                      )}

                      <span className="flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Due {task.dueDate}
                      </span>
                    </div>
                  </div>

                  {/* Status Selector */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-slate-50/40 to-purple-50/20 border border-indigo-100/80 flex items-center justify-between shadow-2xs">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Current Deliverable Stage
                    </span>
                    <CustomSelect
                      value={task.status}
                      onChange={(val) => handleStatusChange(val as TaskStatus)}
                      options={[
                        { value: 'todo', label: 'To Do', badgeDot: 'bg-sky-500' },
                        { value: 'in_progress', label: 'In Progress', badgeDot: 'bg-indigo-500' },
                        { value: 'in_review', label: 'In Review', badgeDot: 'bg-amber-500' },
                        { value: 'done', label: 'Completed', badgeDot: 'bg-emerald-500' },
                      ]}
                    />
                  </div>

                  {/* Description & AI Enhancer */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                        Description & Acceptance Criteria
                      </h3>
                      <button
                        onClick={handleEnhanceDescription}
                        disabled={isEnhancing}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isEnhancing ? 'Enhancing...' : 'Enhance with AI'}</span>
                      </button>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-medium shadow-2xs">
                      {task.description ? (
                        <div className="space-y-2.5">
                          {(() => {
                            let lastHeader = '';
                            return task.description.split('\n').map((line, idx) => {
                              if (line.startsWith('### ')) {
                                const currentHeader = line.substring(4).trim().toLowerCase();
                                if (currentHeader === lastHeader) return null;
                                lastHeader = currentHeader;
                                return (
                                  <h4 key={idx} className="text-xs font-black text-slate-800 uppercase tracking-wider mt-4 first:mt-0">
                                    {line.substring(4)}
                                  </h4>
                                );
                              }
                              if (line.startsWith('## ')) {
                                const currentHeader = line.substring(3).trim().toLowerCase();
                                if (currentHeader === lastHeader) return null;
                                lastHeader = currentHeader;
                                return (
                                  <h3 key={idx} className="text-sm font-black text-slate-900 uppercase tracking-wider mt-5 first:mt-0">
                                    {line.substring(3)}
                                  </h3>
                                );
                              }
                              const isChecklist = line.startsWith('- [ ]') || line.startsWith('- [x]') || line.startsWith('- [X]');
                            if (isChecklist) {
                              const checked = line.startsWith('- [x]') || line.startsWith('- [X]');
                              const content = line.substring(5).trim();
                              return (
                                <div key={idx} className="flex items-center gap-2.5 py-0.5 px-0.5 rounded-lg transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    readOnly
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-default"
                                  />
                                  <span className={`text-xs font-medium text-slate-700 ${checked ? 'line-through text-slate-400' : ''}`}>
                                    {content}
                                  </span>
                                </div>
                              );
                            }
                            if (line.trim() === '') {
                              return <div key={idx} className="h-1" />;
                            }
                            return (
                              <p key={idx} className="text-slate-600 text-xs leading-relaxed font-medium">
                                {line}
                              </p>
                            );
                            });
                          })()}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No description provided for this task.</span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-2">
                      Tags & Categories
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {task.tags && task.tags.length > 0 ? (
                        task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-indigo-700 bg-indigo-50/80 border border-indigo-200 px-3 py-1 rounded-xl flex items-center gap-1 font-bold"
                          >
                            <Tag className="w-3 h-3 text-indigo-500" />
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No tags attached.</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* INLINE EDIT FORM MODE */
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-2 text-indigo-900 text-xs font-extrabold">
                    <Edit3 className="w-4 h-4 text-indigo-600" />
                    <span>Editing Task Details</span>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Task Title *</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Description</label>
                    <textarea
                      rows={4}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Priority</label>
                      <CustomSelect
                        value={editPriority}
                        onChange={(val) => setEditPriority(val as Priority)}
                        options={[
                          { value: 'urgent', label: 'Urgent', badgeDot: 'bg-rose-500' },
                          { value: 'high', label: 'High', badgeDot: 'bg-amber-500' },
                          { value: 'medium', label: 'Medium', badgeDot: 'bg-indigo-500' },
                          { value: 'low', label: 'Low', badgeDot: 'bg-slate-400' },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Status</label>
                      <CustomSelect
                        value={editStatus}
                        onChange={(val) => setEditStatus(val as TaskStatus)}
                        options={[
                          { value: 'todo', label: 'To Do', badgeDot: 'bg-sky-500' },
                          { value: 'in_progress', label: 'In Progress', badgeDot: 'bg-indigo-500' },
                          { value: 'in_review', label: 'In Review', badgeDot: 'bg-amber-500' },
                          { value: 'done', label: 'Completed', badgeDot: 'bg-emerald-500' },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Assignee</label>
                      <select
                        value={editAssignedTo}
                        onChange={(e) => setEditAssignedTo(e.target.value)}
                        className="w-full bg-white border border-slate-200/90 hover:border-indigo-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-100/60 transition-all shadow-2xs"
                      >
                        {employees.filter((e) => e.id !== 'emp-developer-master' && e.email !== 'developer@crewly.io').length > 0 ? (
                          employees
                            .filter((e) => e.id !== 'emp-developer-master' && e.email !== 'developer@crewly.io')
                            .map((e) => (
                              <option key={e.id} value={e.name}>
                                {e.name}
                              </option>
                            ))
                        ) : (
                          <option value="Alex Vance">Alex Vance</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Due Date</label>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="w-full bg-white border border-slate-200/90 hover:border-indigo-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-100/60 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Associated Client</label>
                    <CustomSelect
                      value={editClientName}
                      onChange={setEditClientName}
                      options={[
                        { value: '', label: 'No Client (Internal Project)' },
                        ...clients.map((c) => ({
                          value: c.companyName,
                          label: c.companyName,
                          badgeDot: 'bg-amber-500',
                        })),
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={editTagsInput}
                      onChange={(e) => setEditTagsInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-indigo-400 transition-all"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-xs font-extrabold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Comment Thread */}
              <div className="pt-5 border-t border-slate-200 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Activity & Comments ({task.comments?.length || 0})</span>
                </h3>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((cmt) => (
                      <div key={cmt.id} className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-xs shadow-xs flex items-start gap-3">
                        <UserAvatar
                          src={cmt.authorAvatar}
                          name={cmt.authorName}
                          className="w-8 h-8 rounded-full ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-slate-500 mb-1">
                            <span className="font-extrabold text-slate-900">{cmt.authorName}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{cmt.createdAt}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{cmt.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No comments yet. Start the conversation below.
                    </div>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex items-center gap-2.5 pt-2">
                  <UserAvatar
                    src={currentUser?.avatar}
                    name={currentUser?.name || 'Admin'}
                    className="w-8 h-8 rounded-full shrink-0"
                  />
                  <input
                    type="text"
                    placeholder="Write a comment... (Press Enter to post)"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(e);
                      }
                    }}
                    className="flex-1 bg-slate-50/90 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
