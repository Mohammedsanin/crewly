import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Copy, Check, Key, ShieldCheck, Camera, Upload, Loader2 } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { NewEmployeeCredentials } from '../../types';
import { backdropVariants, modalVariants } from '../../theme/animations';
import { uploadEmployeePhotoToSupabase } from '../../services/supabaseClient';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose }) => {
  const { addEmployee, addToast } = useERP();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [department, setDepartment] = useState<'Engineering' | 'Design' | 'Product' | 'Sales' | 'Operations' | 'Finance'>('Engineering');
  const [status, setStatus] = useState<'active' | 'onboarding'>('onboarding');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [credentials, setCredentials] = useState<NewEmployeeCredentials | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', title: 'Invalid File', message: 'Please select an image file (PNG, JPG, WEBP).' });
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast({ type: 'error', title: 'File Too Large', message: 'Please upload an image under 10MB.' });
      e.target.value = '';
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const uploadedUrl = await uploadEmployeePhotoToSupabase(file, `emp-${Date.now()}`);
      setAvatarPreview(uploadedUrl);
      setAvatarUrl(uploadedUrl);
      addToast({ type: 'success', title: 'Photo Uploaded', message: 'Employee profile photo attached.' });
    } catch (err) {
      addToast({ type: 'error', title: 'Upload Error', message: 'Could not process photo upload.' });
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) return;

    // Only pass user-uploaded avatar; empty string lets UserAvatar display custom gradient initials
    const finalAvatar = avatarUrl || '';

    const creds = addEmployee({ name, email, role, department, status, avatar: finalAvatar });
    setCredentials(creds);
  };

  const handleCopyPassword = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(credentials.tempPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 1500);
  };

  const handleCopyUrl = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(credentials.portalUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1500);
  };

  const handleDone = () => {
    setCredentials(null);
    setName('');
    setEmail('');
    setRole('Employee');
    setAvatarPreview(null);
    setAvatarUrl('');
    onClose();
  };

  const inputCls = 'w-full bg-white/80 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium backdrop-blur-sm';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={credentials ? undefined : onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg rounded-3xl border border-white/70 bg-white/90 backdrop-blur-2xl shadow-2xl overflow-hidden z-10 select-none"
          >
            {/* Top accent strip */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    {credentials ? 'Credentials Generated' : 'Onboard New Employee'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {credentials ? 'Share securely with new member' : 'Fill details to provision access'}
                  </p>
                </div>
              </div>
              {!credentials && (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            <div className="px-6 py-5">
              {!credentials ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Photo Upload */}
                  <div className="flex flex-col items-center gap-3 pb-4 border-b border-slate-100">
                    <div
                      onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
                      className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-indigo-200 bg-indigo-50 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-100 transition-all group"
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                      ) : avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Camera className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-[9px] text-indigo-400 font-bold">PHOTO</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <motion.button
                      type="button"
                      disabled={isUploadingPhoto}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      {isUploadingPhoto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {isUploadingPhoto ? 'Uploading...' : avatarPreview ? 'Change Photo' : 'Upload Photo'}
                    </motion.button>
                  </div>

                  {/* Name + Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5">Full Name *</label>
                      <input type="text" required placeholder="Jane Doe" value={name}
                        onChange={(e) => setName(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5">Corporate Email *</label>
                      <input type="email" required placeholder="jane@company.io" value={email}
                        onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                    </div>
                  </div>

                  {/* Role + Department */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5">Access Role *</label>
                      <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                        <option value="Employee">Employee (Standard)</option>
                        <option value="Manager">Manager (Team Lead)</option>
                        <option value="Admin">Admin (Full Access)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5">Department</label>
                      <select value={department} onChange={(e) => setDepartment(e.target.value as any)} className={inputCls}>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Product">Product</option>
                        <option value="Sales">Sales</option>
                        <option value="Operations">Operations</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5">Initial Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={inputCls}>
                      <option value="onboarding">Onboarding</option>
                      <option value="active">Active</option>
                    </select>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose}
                      className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                      Cancel
                    </button>
                    <motion.button type="submit"
                      whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                      className="px-5 py-2.5 rounded-2xl text-white text-xs font-black shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #4338ca, #7c3aed)' }}>
                      Generate Credentials & Add
                    </motion.button>
                  </div>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    </motion.div>
                    <div>
                      <h4 className="text-xs font-black">Temporary Passcode Provisioned</h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Share these credentials securely with <strong>{credentials.employee.name}</strong> ({credentials.employee.role}).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200 backdrop-blur-sm">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Login Email</span>
                      <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">{credentials.employee.email}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Temporary Password</span>
                      <div className="flex items-center justify-between mt-1 p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold text-indigo-600">
                        <span>{credentials.tempPassword}</span>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={handleCopyPassword}
                          className="flex items-center gap-1 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg transition-colors cursor-pointer">
                          {copiedPass ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                        </motion.button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Role Privilege</span>
                      <p className="text-xs font-black text-indigo-700 mt-0.5">{credentials.employee.role}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                      onClick={handleDone}
                      className="px-6 py-2.5 rounded-2xl text-white text-xs font-black shadow-lg shadow-indigo-600/25 cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #4338ca, #7c3aed)' }}>
                      Done & Close
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
