import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Calendar,
  DollarSign,
  Plus,
  Edit2,
  Save,
  CheckCircle2,
  Clock,
  Briefcase,
  MessageSquare,
  Tag,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { pageVariants } from '../../theme/animations';
import { UserAvatar } from '../common/UserAvatar';

interface ClientDetailViewProps {
  clientId: string;
  onBack: () => void;
  onOpenAddTaskModal: () => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({
  clientId,
  onBack,
  onOpenAddTaskModal,
}) => {
  const { clients, tasks, employees, updateClientNotes, setSelectedTaskId, activeRolePerspective } = useERP();
  const client = clients.find((c) => c.id === clientId);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(client?.notes || '');

  if (!client) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-500">Client account not found.</p>
        <button onClick={onBack} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Back to CRM
        </button>
      </div>
    );
  }

  const clientTasks = tasks.filter(
    (t) => t.clientId === client.id || t.clientName === client.companyName
  );

  const handleSaveNotes = () => {
    updateClientNotes(client.id, notesText);
    setIsEditingNotes(false);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 pb-12"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Client CRM</span>
      </button>

      {/* Client Header Card */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  {client.companyName}
                </h1>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${
                    client.status === 'active'
                      ? 'badge-completed'
                      : client.status === 'onboarding'
                      ? 'badge-progress'
                      : 'badge-pending'
                  }`}
                >
                  {client.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{client.industry}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 mt-4">
            {activeRolePerspective === 'admin' ? (
              <>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-500" />
                  Contact: <strong>{client.contactName}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {client.contactEmail}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-emerald-600 font-extrabold">
                  <DollarSign className="w-4 h-4" />
                  ₹{client.contractValue.toLocaleString('en-IN')} /yr ARR
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                <Briefcase className="w-4 h-4" />
                Active Client Deliverable Scope
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              Since {client.startDate}
            </span>
          </div>
        </div>

        {activeRolePerspective === 'admin' && (
          <button
            onClick={onOpenAddTaskModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task for Client</span>
          </button>
        )}
      </div>

      {/* Account Executive Notes (Admin Confidential Only) */}
      {activeRolePerspective === 'admin' && (
        <div className="glass-card p-6 rounded-3xl border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Account Executive Confidential Notes
            </h3>
            {isEditingNotes ? (
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Notes</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Notes</span>
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <textarea
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
              placeholder="Add notes about contract terms, SLA preferences, quarterly reviews..."
            />
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {client.notes || (
                <span className="text-slate-400 italic">No custom notes recorded for this client account yet. Click edit to add notes.</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Linked Task History Section */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-100 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Client Task Deliverables ({clientTasks.length})
          </h3>
        </div>

        {clientTasks.length > 0 ? (
          <div className="space-y-3">
            {clientTasks.map((task) => (
              <motion.div
                key={task.id}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedTaskId(task.id)}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-2xs hover:shadow-md"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        task.priority === 'urgent'
                          ? 'badge-blocked'
                          : task.priority === 'high'
                          ? 'badge-pending'
                          : 'badge-progress'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                      {task.title}
                    </h4>
                  </div>
                  {task.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                      {task.description
                        .replace(/###\s+/g, '')
                        .replace(/##\s+/g, '')
                        .replace(/-\s+\[\s*\]/g, '• ')
                        .replace(/-\s+\[\s*[xX]\s*\]/g, '✓ ')
                        .replace(/\s+/g, ' ')
                        .trim()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs">
                  {/* Assignee Pill */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/80 border border-slate-200/80 text-[11px] font-extrabold text-slate-700">
                    <UserAvatar
                      src={employees.find((e) => e.name === task.assignedTo)?.avatar}
                      name={task.assignedTo}
                      className="w-4 h-4 rounded-full"
                    />
                    <span>{task.assignedTo}</span>
                  </div>

                  {/* Comment Count Badge */}
                  {task.comments && task.comments.length > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                      <MessageSquare className="w-3 h-3 text-indigo-600" />
                      <span>{task.comments.length}</span>
                    </span>
                  )}

                  {/* Due Date */}
                  <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Due {task.dueDate}</span>

                  {/* Status Pill */}
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${
                      task.status === 'done'
                        ? 'badge-completed'
                        : task.status === 'in_progress'
                        ? 'badge-progress'
                        : 'badge-pending'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No active tasks linked to {client.companyName} yet.
          </div>
        )}
      </div>
    </motion.div>
  );
};
