import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Building,
  Calendar,
  ShieldCheck,
  Key,
  UserCheck,
  UserX,
  CheckCircle2,
  Clock,
  Briefcase,
  Copy,
  Check,
  Shield,
  Trash2,
  Camera,
  Loader2,
  Upload,
  Eye,
  EyeOff,
  Edit2,
  Save,
  MessageSquare,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { NewEmployeeCredentials } from '../../types';
import { pageVariants } from '../../theme/animations';
import { UserAvatar } from '../common/UserAvatar';
import { uploadEmployeePhotoToSupabase } from '../../services/supabaseClient';

interface EmployeeDetailViewProps {
  employeeId: string;
  onBack: () => void;
}

export const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({ employeeId, onBack }) => {
  const {
    employees,
    tasks,
    recentActivities,
    updateEmployee,
    resetEmployeePassword,
    deleteEmployee,
    setSelectedTaskId,
    activeRolePerspective,
    addToast,
  } = useERP();

  const employee = employees.find((e) => e.id === employeeId);
  const [resetModalData, setResetModalData] = useState<NewEmployeeCredentials | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [customPassword, setCustomPassword] = useState(employee?.password || 'admin123');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveCustomPassword = () => {
    if (!employee || !customPassword.trim()) return;
    updateEmployee(employee.id, { password: customPassword.trim() });
    setIsEditingPassword(false);
    addToast({
      type: 'success',
      title: 'Password Updated',
      message: `Password for ${employee.name} updated successfully.`,
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employee) return;

    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', title: 'Invalid File', message: 'Please select an image file.' });
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast({ type: 'error', title: 'File Too Large', message: 'Please upload an image smaller than 10MB.' });
      e.target.value = '';
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const uploadedUrl = await uploadEmployeePhotoToSupabase(file, employee.id);
      updateEmployee(employee.id, { avatar: uploadedUrl });
      addToast({ type: 'success', title: 'Photo Updated', message: `Profile photo for ${employee.name} updated.` });
    } catch (err) {
      addToast({ type: 'error', title: 'Upload Failed', message: 'Could not update employee photo.' });
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  if (!employee) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-500">Employee record not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const assignedTasks = tasks.filter((t) => t.assignedTo === employee.name);
  const completedCount = assignedTasks.filter((t) => t.status === 'done').length;
  const inProgressCount = assignedTasks.filter((t) => t.status === 'in_progress').length;

  const handleToggleStatus = () => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    updateEmployee(employee.id, { status: newStatus });
  };

  const handleResetPassword = () => {
    const creds = resetEmployeePassword(employee.id);
    if (creds) {
      setResetModalData(creds);
      setCustomPassword(creds.tempPassword);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 pb-12"
    >
      {/* Back Button & Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Team Directory</span>
      </button>

      {/* Employee Profile Header Card */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <UserAvatar
              src={employee.avatar}
              name={employee.name}
              className="w-20 h-20 rounded-2xl ring-4 ring-indigo-100 shadow-md"
            />
            {activeRolePerspective === 'admin' && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute inset-0 rounded-2xl bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
                title="Change Photo"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase">Change</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{employee.name}</h1>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${
                  employee.status === 'active'
                    ? 'badge-completed'
                    : employee.status === 'onboarding'
                    ? 'badge-pending'
                    : 'badge-blocked'
                }`}
              >
                {employee.status}
              </span>
            </div>
            <p className="text-sm font-semibold text-indigo-600 mt-0.5">{employee.role}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {employee.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {employee.department}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined {employee.joinedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Action Controls */}
        {activeRolePerspective === 'admin' && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Change Access Role Dropdown */}
            <div className="flex items-center gap-2 bg-indigo-50/90 border border-indigo-200/90 rounded-2xl px-3.5 py-2 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="text-xs font-black text-indigo-950">Role:</span>
              <select
                value={employee.role}
                onChange={(e) => updateEmployee(employee.id, { role: e.target.value })}
                className="bg-white border border-indigo-200 text-xs font-black text-indigo-700 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer shadow-xs"
              >
                <option value="Employee" className="bg-white text-slate-800 font-bold py-1">Employee</option>
                <option value="Manager" className="bg-white text-slate-800 font-bold py-1">Manager</option>
                <option value="Admin" className="bg-white text-indigo-700 font-black py-1">Admin</option>
              </select>
            </div>

            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                employee.status === 'active'
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {employee.status === 'active' ? (
                <>
                  <UserX className="w-4 h-4" />
                  <span>Deactivate Member</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Activate Member</span>
                </>
              )}
            </button>

            {/* Delete Employee Button */}
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete ${employee.name}?`)) {
                  deleteEmployee(employee.id);
                  onBack();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Employee</span>
            </button>
          </div>
        )}
      </div>

      {/* Account Security & Password Reveal Panel (Admin Confidential) */}
      {activeRolePerspective === 'admin' && (
        <div className="glass-card p-6 rounded-3xl border border-indigo-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Employee Access Credentials</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Active Access Account
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Corporate Login Email</span>
              <p className="text-xs font-extrabold text-slate-800 font-mono flex items-center gap-2">
                <span>{employee.email}</span>
              </p>
            </div>

            {/* Password Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Password</span>
                {!isEditingPassword && (
                  <button
                    onClick={() => {
                      setCustomPassword(employee.password || 'admin123');
                      setIsEditingPassword(true);
                    }}
                    className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {!isEditingPassword ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-xs font-black text-indigo-900 bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex-1 flex items-center justify-between shadow-2xs">
                    <span>{showPassword ? (employee.password || 'admin123') : '••••••••••••'}</span>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-1 cursor-pointer"
                      title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(employee.password || 'admin123');
                      setCopiedPass(true);
                      setTimeout(() => setCopiedPass(false), 1500);
                    }}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 font-extrabold transition-colors cursor-pointer shrink-0"
                  >
                    {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Enter new password..."
                    className="flex-1 bg-white border border-indigo-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    onClick={handleSaveCustomPassword}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setIsEditingPassword(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Workload Metrics & Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-indigo-100 bg-white">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Assigned Deliverables</span>
          <p className="text-3xl font-extrabold text-slate-800 font-mono mt-1">{assignedTasks.length}</p>
          <p className="text-xs text-slate-400 mt-2">Active workload score</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-indigo-100 bg-white">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Finished Deliverables</span>
          <p className="text-3xl font-extrabold text-emerald-600 font-mono mt-1">{completedCount}</p>
          <p className="text-xs text-slate-400 mt-2">100% QA verified</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-indigo-100 bg-white">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">In Progress</span>
          <p className="text-3xl font-extrabold text-indigo-600 font-mono mt-1">{inProgressCount}</p>
          <p className="text-xs text-slate-400 mt-2">Currently being authored</p>
        </div>
      </div>

      {/* Assigned Tasks List Section */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Assigned Task History ({assignedTasks.length})
          </h3>
        </div>

        {assignedTasks.length > 0 ? (
          <div className="space-y-3">
            {assignedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
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
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {task.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{task.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs">
                  {task.comments && task.comments.length > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                      <MessageSquare className="w-3 h-3 text-indigo-600" />
                      <span>{task.comments.length}</span>
                    </span>
                  )}
                  <span className="text-slate-400 text-[11px]">Due {task.dueDate}</span>
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
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No active tasks currently assigned to {employee.name}.
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {resetModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-indigo-100 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              Temporary Credentials Issued
            </h3>
            <p className="text-xs text-slate-600">
              New temporary login credentials generated for <strong>{resetModalData.employee.name}</strong>:
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-sm text-indigo-800 flex items-center justify-between">
              <span>{resetModalData.tempPassword}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(resetModalData.tempPassword);
                  setCopiedPass(true);
                  setTimeout(() => setCopiedPass(false), 1500);
                }}
                className="flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-sans font-bold"
              >
                {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPass ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <button
              onClick={() => setResetModalData(null)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
