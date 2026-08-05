import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, PlusCircle } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Priority, TaskStatus } from '../../types';
import { backdropVariants, modalVariants } from '../../theme/animations';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, employees, clients, currentUser } = useERP();

  const realEmployees = employees.filter(
    (e) => e.id !== 'emp-developer-master' && e.email !== 'developer@crewly.io'
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assignedTo, setAssignedTo] = useState(realEmployees[0]?.name || 'sanin');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [dueDate, setDueDate] = useState('2026-07-28');
  const [tagsInput, setTagsInput] = useState('Frontend, UI/UX');

  React.useEffect(() => {
    if (isOpen) {
      const activeList = employees.filter(
        (e) => e.id !== 'emp-developer-master' && e.email !== 'developer@crewly.io'
      );
      if (activeList.length > 0 && !assignedTo) {
        setAssignedTo(activeList[0].name);
      }
    }
  }, [isOpen, employees]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    const clientObj = clients.find((c) => c.id === selectedClientId);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      addTask({
        title,
        description,
        priority,
        status,
        assignedTo,
        clientId: clientObj?.id,
        clientName: clientObj?.companyName,
        dueDate,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      });

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setTitle('');
        setDescription('');
        setSelectedClientId('');
      }, 600);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-white border border-indigo-100 rounded-3xl shadow-2xl p-6 overflow-hidden z-10 select-none"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-800">Create New Task</h3>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement OAuth 2.0 Auth Flow"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide brief context and acceptance criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Column / Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Assignee</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium"
                  >
                    {realEmployees.length > 0 ? (
                      realEmployees.map((e) => (
                        <option key={e.id} value={e.name}>
                          {e.name} ({e.department})
                        </option>
                      ))
                    ) : (
                      <option value="sanin">sanin (Engineering)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Link Task to Client / Company</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium"
                >
                  <option value="">No Client (Internal Company Project)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      🏢 {c.companyName} ({c.industry})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Frontend, UI/UX"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className="relative min-w-[120px] px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : isSuccess ? (
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-300" />
                      Created!
                    </span>
                  ) : (
                    <span>Add Task</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
