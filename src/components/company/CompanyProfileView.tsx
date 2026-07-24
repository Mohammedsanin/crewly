import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  Edit2,
  Save,
  Globe,
  Mail,
  Phone,
  FileText,
  TrendingUp,
  Download,
  Trash2,
  ShieldAlert,
  Database,
  FileSpreadsheet,
  IndianRupee,
  Printer,
  Camera,
  Key,
  Upload,
  User,
  Loader2,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { pageVariants } from '../../theme/animations';
import { getSupabaseConfig, uploadEmployeePhotoToSupabase } from '../../services/supabaseClient';
import { UserAvatar } from '../common/UserAvatar';
import {
  exportPendingTasksToCSV,
  exportFinancialsToCSV,
  generatePendingTasksPDFReport,
  generateRevenuePDFReport,
} from '../../utils/exportUtils';

interface CompanyProfileViewProps {
  onOpenSupabaseModal?: () => void;
}

export const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({ onOpenSupabaseModal }) => {
  const supabaseConfig = getSupabaseConfig();
  const {
    companyInfo,
    updateCompanyInfo,
    employees,
    clients,
    tasks,
    recentActivities,
    clearAllData,
    setActiveTab,
    activeRolePerspective,
    addToast,
  } = useERP();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(companyInfo);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isUploadingEditLogo, setIsUploadingEditLogo] = useState(false);
  const editLogoInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setFormData(companyInfo);
  }, [companyInfo]);

  const handleEditLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEditLogo(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, logo: reader.result as string }));
      setIsUploadingEditLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const totalEmployees = employees.length;
  const totalClients = clients.length;
  const openTasks = tasks.filter((t) => t.status !== 'done').length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 100;
  const totalARR = clients.reduce((acc, c) => acc + c.contractValue, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyInfo(formData);
    setIsEditing(false);
  };

  // Export Data Helpers
  const downloadJSON = (filename: string, data: any) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPendingTasks = () => {
    const pending = tasks.filter((t) => t.status !== 'done');
    downloadJSON(`syncwave-pending-tasks-${Date.now()}.json`, {
      exportTimestamp: new Date().toISOString(),
      pendingCount: pending.length,
      tasks: pending,
    });
    addToast({
      type: 'success',
      title: 'Pending Tasks Exported',
      message: `${pending.length} pending task records downloaded.`,
    });
  };

  const handleExportFinancials = () => {
    const financialReport = {
      exportTimestamp: new Date().toISOString(),
      companyName: companyInfo.name,
      totalARR,
      activeClientsCount: clients.length,
      clients: clients.map((c) => ({
        companyName: c.companyName,
        contactName: c.contactName,
        contactEmail: c.contactEmail,
        contractValue: c.contractValue,
        status: c.status,
        startDate: c.startDate,
      })),
    };
    downloadJSON(`syncwave-financial-report-${Date.now()}.json`, financialReport);
    addToast({
      type: 'success',
      title: 'Financial Report Exported',
      message: `ARR data ($${totalARR.toLocaleString()}) exported successfully.`,
    });
  };

  const handleExportFullBackup = () => {
    const backup = {
      exportTimestamp: new Date().toISOString(),
      companyInfo,
      tasks,
      clients,
      employees,
      recentActivities,
    };
    downloadJSON(`syncwave-full-backup-${Date.now()}.json`, backup);
    addToast({
      type: 'success',
      title: 'Complete ERP Backup Downloaded',
      message: 'Full company workspace backup saved to JSON.',
    });
  };

  const handleConfirmClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
    addToast({
      type: 'info',
      title: 'Workspace Data Reset',
      message: 'All task cards, clients, and employee records have been removed.',
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 pb-12 select-none"
    >
      {/* Company Profile Card */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-100 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 p-2 flex items-center justify-center overflow-hidden">
              <img src={companyInfo.logo || "/logo_mark.png"} alt="Company Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {companyInfo.name}
              </h2>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">Corporate Organization Settings</p>
            </div>
          </div>

          {activeRolePerspective === 'admin' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Company Profile</span>
            </button>
          )}
        </div>

        {!isEditing ? (
          <div>
            {activeRolePerspective === 'admin' ? (
              /* Admin View — Full Confidential Corporate Info */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      Tax Identifier / EIN (Confidential)
                    </span>
                    <span className="font-mono font-bold text-indigo-950 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{companyInfo.taxId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Corporate Email</span>
                    <span className="font-semibold text-slate-800">{companyInfo.contactEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Contact Phone</span>
                    <span className="font-semibold text-slate-800">{companyInfo.contactPhone}</span>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Headquarters Address</span>
                    <span className="font-semibold text-slate-800 text-right">{companyInfo.legalAddress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Corporate Website</span>
                    <a href={companyInfo.website} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                      <span>{companyInfo.website}</span>
                      <Globe className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Employee View — My Account Settings & Public Corporate Info */
              <div className="space-y-6">
                <EmployeePersonalSettingsCard />

                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <span className="font-extrabold text-slate-800 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      Public Corporate Profile
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
                      Employee Perspective
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 font-medium block mb-0.5">Corporate Email</span>
                      <span className="font-bold text-slate-800">{companyInfo.contactEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-0.5">Official Website</span>
                      <a href={companyInfo.website} target="_blank" rel="noreferrer" className="font-bold text-indigo-600 hover:underline flex items-center gap-1">
                        {companyInfo.website}
                      </a>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-800 flex items-center gap-2 font-medium">
                    <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Confidential tax identification numbers (EIN) and legal registration records are restricted to Admin perspective.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Logo Upload Dropzone in Settings Edit */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                {isUploadingEditLogo ? (
                  <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                ) : formData.logo ? (
                  <img src={formData.logo} alt="Company Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Building2 className="w-7 h-7 text-slate-400" />
                )}
              </div>
              <div className="text-left space-y-1.5 flex-1">
                <span className="text-xs font-black text-slate-800 block">Change corporate logo image</span>
                <button
                  type="button"
                  onClick={() => editLogoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Upload Custom Logo</span>
                </button>
                <input
                  ref={editLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditLogoUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax ID</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Legal Address</label>
              <input
                type="text"
                value={formData.legalAddress}
                onChange={(e) => setFormData({ ...formData, legalAddress: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Admin Settings & Data Management Panel (Admin Only) */}
      {activeRolePerspective === 'admin' && (
        <div className="glass-card p-6 rounded-3xl border border-indigo-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  Admin Data Export & Management Controls
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Export pending tasks, revenue financial reports, or purge workspace data
                </p>
              </div>
            </div>

            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
              Admin Exclusive
            </span>
          </div>

          {/* Supabase Cloud Database Integration Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-50 border border-emerald-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-black text-slate-800">Supabase Cloud Database Integration</h4>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                    {supabaseConfig.isConnected ? 'Active & Synced' : 'Local Storage Mode'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Configure cloud database URL, API anon keys, Postgres triggers & photo storage</p>
              </div>
            </div>

            <button
              onClick={onOpenSupabaseModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
            >
              <Database className="w-4 h-4" />
              <span>Configure Supabase Settings</span>
            </button>
          </div>

          {/* Export Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Export Pending Tasks */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-800">Pending Tasks Deliverables</span>
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-xs text-slate-500">
                  Export structured report of all open & in-progress deliverables ({openTasks} items).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    exportPendingTasksToCSV(tasks, companyInfo.name);
                    addToast({
                      type: 'success',
                      title: 'Excel CSV Downloaded',
                      message: 'Pending tasks exported for Microsoft Excel.',
                    });
                  }}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[11px] font-extrabold transition-all cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (CSV)</span>
                </button>

                <button
                  onClick={() => {
                    generatePendingTasksPDFReport(tasks, companyInfo);
                  }}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>

            {/* Export Revenue Report */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-800">Revenue & Financial Audit</span>
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500">
                  Export executive revenue report (₹{totalARR.toLocaleString('en-IN')} ARR) & active contracts.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    exportFinancialsToCSV(clients, companyInfo);
                    addToast({
                      type: 'success',
                      title: 'Revenue CSV Downloaded',
                      message: 'Financial ARR report exported for Excel.',
                    });
                  }}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-extrabold transition-all cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (CSV)</span>
                </button>

                <button
                  onClick={() => {
                    generateRevenuePDFReport(clients, companyInfo);
                  }}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>

            {/* Export Full ERP Backup */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-800">Complete ERP Backup</span>
                  <Database className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-xs text-slate-500">
                  Full backup of all workspace tasks, clients, team roster, and system log into JSON.
                </p>
              </div>
              <button
                onClick={handleExportFullBackup}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-extrabold transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Backup (JSON)</span>
              </button>
            </div>
          </div>

          {/* Purge All Data Danger Zone */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-xs font-extrabold text-rose-900">Danger Zone: Remove All Data</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  Purge all task cards, client portfolios, and team members to reset your workspace.
                </p>
              </div>
            </div>

            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove All Data</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 rounded-xl bg-white text-slate-600 border border-slate-200 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClearAll}
                  className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Confirm Purge
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clickable Live Summary Metrics Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
          Live Company Performance Indicators (Click card to deep-link)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Employees Card */}
          <div
            onClick={() => (activeRolePerspective === 'admin' ? setActiveTab('employees') : undefined)}
            className="glass-card glass-card-hover p-5 rounded-2xl border border-indigo-100 cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Employees
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 font-mono">{totalEmployees}</p>
            <span className="text-[11px] text-indigo-600 font-semibold mt-2 group-hover:underline">
              View Team Roster →
            </span>
          </div>

          {/* Active Clients Card */}
          <div
            onClick={() => setActiveTab('clients')}
            className="glass-card glass-card-hover p-5 rounded-2xl border border-indigo-100 cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Clients
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 font-mono">{totalClients}</p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 group-hover:underline">
              View CRM Portfolio →
            </span>
          </div>

          {/* Open Tasks Card */}
          <div
            onClick={() => setActiveTab('tasks')}
            className="glass-card glass-card-hover p-5 rounded-2xl border border-indigo-100 cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Open Tasks
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 font-mono">{openTasks}</p>
            <span className="text-[11px] text-amber-600 font-semibold mt-2 group-hover:underline">
              Open Kanban Engine →
            </span>
          </div>

          {/* Completion Rate */}
          <div
            onClick={() => setActiveTab('tasks')}
            className="glass-card glass-card-hover p-5 rounded-2xl border border-indigo-100 cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Completion Rate
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 font-mono">{completionRate}%</p>
            <span className="text-[11px] text-indigo-600 font-semibold mt-2 group-hover:underline">
              View Performance Details →
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────── Employee Personal Profile Settings ─────────────────────────── */
const EmployeePersonalSettingsCard: React.FC = () => {
  const { currentUser, employees, updateEmployee, addToast } = useERP();
  const currentEmp = employees.find(
    (e) => e.email === currentUser?.email || e.id === currentUser?.id
  ) || {
    id: currentUser?.id || 'emp-me',
    name: currentUser?.name || 'Employee',
    email: currentUser?.email || '',
    role: currentUser?.role || 'Developer',
    department: 'Engineering',
    status: 'active',
    avatar: currentUser?.avatar || '',
    password: '',
  };

  const [name, setName] = useState(currentEmp.name);
  const [status, setStatus] = useState<any>(currentEmp.status || 'active');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(currentEmp.avatar || '');
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadEmployeePhotoToSupabase(file, currentEmp.id);
      setAvatarUrl(url);
      updateEmployee(currentEmp.id, { avatar: url });
      addToast({
        type: 'success',
        title: 'Photo Uploaded',
        message: 'Your profile photo has been updated and saved to Supabase Cloud.',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: any = { name, status };
    if (newPassword.trim().length > 0) {
      updates.password = newPassword.trim();
    }
    updateEmployee(currentEmp.id, updates);
    setNewPassword('');
  };

  return (
    <div className="rounded-3xl border border-indigo-100 bg-white/80 backdrop-blur-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            My Account Settings & Profile
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Update your display name, upload a profile photo, set work status, and change your password.
          </p>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
          Employee Settings
        </span>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Photo & Avatar Upload */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="relative group shrink-0">
            <UserAvatar src={avatarUrl} name={name} className="w-20 h-20 rounded-2xl border-2 border-indigo-200 shadow-md object-cover" />
            <label className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
          <div className="space-y-1.5 text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-800">{name}</h4>
            <p className="text-xs text-slate-500">{currentEmp.email} · <span className="font-semibold text-indigo-600">{currentEmp.role}</span></p>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isUploading ? 'Uploading...' : 'Upload Profile Photo'}</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Editable Name & Work Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">Work Availability Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              <option value="active">🟢 Active & Online</option>
              <option value="leave">🟡 On Leave / Away</option>
              <option value="offline">⚪ Offline / Inactive</option>
              <option value="onboarding">🔵 Onboarding</option>
            </select>
          </div>
        </div>

        {/* Password Security Section */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 space-y-3">
          <span className="font-extrabold text-xs text-indigo-950 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-indigo-600" />
            <span>Change Security Password</span>
          </span>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">New Security Password</label>
            <input
              type="password"
              placeholder="Enter new password (leave blank to keep current)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Account Changes</span>
        </button>
      </form>
    </div>
  );
};
