import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, Loader2, Sparkles, AlertCircle, Key, Building, Globe, UserPlus, ArrowLeft, Briefcase } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { User } from '../../types';

export const LoginPage: React.FC = () => {
  const { setCurrentUser, setActiveRolePerspective, employees, addEmployee, createCompanyWorkspace } = useERP();
  const [email, setEmail] = useState('saninmohammed03@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Workspace Creation wizard toggle & states
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('Technology');
  const [companyLogo, setCompanyLogo] = useState('/logo_mark.png');
  const [headName, setHeadName] = useState('');
  const [headEmail, setHeadEmail] = useState('');
  const [headPassword, setHeadPassword] = useState('');

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file for the company logo.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Logo size must be smaller than 5MB.');
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCompanyLogo(reader.result as string);
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();

      // Master Developer System Account (Login ID: "developer" or "developer@syncwave.io", Password: "developer")
      if (
        cleanEmail === 'developer' ||
        cleanEmail === 'developer@syncwave.io'
      ) {
        if (password.trim() !== 'developer') {
          setErrorMessage('Incorrect password for Developer master account. (Hint: developer)');
          return;
        }

        const devUser: User = {
          id: 'emp-developer-master',
          name: 'Developer',
          email: 'developer@syncwave.io',
          role: 'Admin',
          avatar: '',
        };
        setActiveRolePerspective('admin');
        setCurrentUser(devUser);
        return;
      }

      // Dynamic Employee Account Check against Roster
      let roster = employees;
      if (!roster || roster.length === 0) {
        try {
          const savedEmps = localStorage.getItem('syncwave_employees');
          if (savedEmps) roster = JSON.parse(savedEmps);
        } catch (e) {}
      }

      const empMatch = (roster || []).find(
        (e) =>
          (e.email || '').trim().toLowerCase() === cleanEmail ||
          (e.name || '').trim().toLowerCase() === cleanEmail
      );

      if (empMatch) {
        const inputPass = password.trim();
        const isValid = empMatch.password ? inputPass === empMatch.password : inputPass === 'admin123';

        if (!isValid) {
          setErrorMessage(`Incorrect password for ${empMatch.name}. Please check your credentials.`);
          return;
        }

        const isEmpAdmin = empMatch.role.toLowerCase().includes('admin') || empMatch.role.toLowerCase().includes('manager');
        const loggedUser: User = {
          id: empMatch.id,
          name: empMatch.name,
          email: empMatch.email,
          role: empMatch.role as any,
          avatar: empMatch.avatar || '',
        };

        setActiveRolePerspective(isEmpAdmin ? 'admin' : 'employee');
        setCurrentUser(loggedUser);
      } else {
        // Strict Auth — Reject unknown users (no auto-provisioning fake accounts)
        setErrorMessage(`Account "${cleanEmail}" not found in employee directory. Please ask an Admin to add you first.`);
      }
    }, 400);
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !headName.trim() || !headEmail.trim() || !headPassword.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        const companyDetails = {
          name: companyName.trim(),
          logo: companyLogo.trim() || '/logo_mark.png',
          legalAddress: 'Corporate Headquarters',
          taxId: 'PENDING-TAX-ID',
          contactEmail: headEmail.trim().toLowerCase(),
          contactPhone: '+1 (555) 019-2834',
          website: companyWebsite.trim() || 'https://syncwave.io',
        };

        const adminEmployee = {
          name: headName.trim(),
          email: headEmail.trim().toLowerCase(),
          role: 'Admin',
          department: 'Operations' as const,
          avatar: '',
          status: 'active' as const,
          password: headPassword.trim(),
        };

        const createdAdmin = createCompanyWorkspace(companyDetails, adminEmployee);

        // Auto-login as newly created Admin (Company Head)
        const loggedUser: User = {
          id: createdAdmin.id,
          name: createdAdmin.name,
          email: createdAdmin.email,
          role: 'Admin',
          avatar: createdAdmin.avatar || '',
        };

        setActiveRolePerspective('admin');
        setCurrentUser(loggedUser);
      } catch (err) {
        setErrorMessage('Failed to initialize company workspace. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4 sm:p-6 lg:p-8 select-none relative overflow-hidden">
      {/* Floating Animated Ambient Gradient Orbs */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 15, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-300/30 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-24 -right-24 w-[26rem] h-[26rem] rounded-full bg-indigo-300/30 blur-3xl pointer-events-none"
      />

      {/* Main Glassmorphic Container with Entrance Animation */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className="w-full max-w-4xl bg-white border border-indigo-100/90 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative z-10"
      >
        {/* Left Side Artwork & Brand Section */}
        <div className="relative p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white border-r border-indigo-100/80 overflow-hidden">
          {/* Animated Video-like Motion Background */}
          <div className="absolute inset-0 opacity-60 pointer-events-none overflow-hidden mix-blend-overlay">
            <motion.img
              animate={{ scale: [1, 1.18, 1], x: [0, -10, 0], y: [0, 10, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
              src="/login_art.png"
              alt="SYNCWAVE Dynamic Motion Graphic"
              className="w-full h-full object-cover scale-110"
            />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shadow-lg cursor-pointer"
              >
                <img src="/logo_mark.png" alt="Logo" className="w-full h-full object-contain filter brightness-110" />
              </motion.div>
              <span className="text-xl font-black text-white tracking-tight">SYNCWAVE ERP</span>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 text-xs font-extrabold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>Enterprise Intelligent Workspace</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug drop-shadow-sm"
            >
              Streamline enterprise operations with intelligent UI.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-xs lg:text-sm text-indigo-100/90 leading-relaxed font-medium"
            >
              Setup your custom workspace or log in with Master Admin/employee credentials.
            </motion.p>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200 font-medium">
            <span>© 2026 SYNCWAVE Inc.</span>
            <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
              <Shield className="w-3.5 h-3.5" />
              SOC2 Type II Verified
            </span>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-white relative">
          <AnimatePresence mode="wait">
            {!isCreatingWorkspace ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Sign In to Workspace</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Enter your corporate credentials below to continue</p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Corporate Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="admin@syncwave.io"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all"
                      />
                    </div>
                  </div>

                  {/* Master Developer Login Hint Box */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-[11px] text-indigo-900 space-y-1 font-medium shadow-xs">
                    <span className="font-extrabold block text-indigo-950 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Super-Admin Master Access:</span>
                    </span>
                    <p>Login ID: <strong className="font-mono text-indigo-700">developer</strong> (or <strong className="font-mono text-indigo-700">developer@syncwave.io</strong>)</p>
                    <p>Password: <strong className="font-mono text-indigo-700">developer</strong></p>
                    <p className="text-[10px] text-indigo-600 font-semibold pt-0.5">Created employees can log in using their own email/name and password.</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <span>Enter ERP Workspace</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setIsCreatingWorkspace(true);
                      }}
                      className="w-full py-2.5 rounded-2xl border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Building className="w-4 h-4 text-indigo-500" />
                      <span>Create New Company Workspace</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="create-workspace-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setIsCreatingWorkspace(false);
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Create Workspace</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Provision a new company workspace instantly</p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  {/* Company Profile Group */}
                  <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
                    <h4 className="text-[11px] font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      <span>Company Profile Details</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Company Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Freshness Passport"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Website URL</label>
                        <div className="relative">
                          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="e.g. freshness.com"
                            value={companyWebsite}
                            onChange={(e) => setCompanyWebsite(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Industry Type</label>
                        <select
                          value={companyIndustry}
                          onChange={(e) => setCompanyIndustry(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400 cursor-pointer"
                        >
                          <option value="Technology">Technology</option>
                          <option value="Food & Beverages">Food & Beverages</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Retail & E-commerce">Retail & E-commerce</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Company Logo *</label>
                        <div
                          onClick={() => logoInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 bg-white hover:bg-slate-50/50 transition-all cursor-pointer flex items-center gap-4"
                        >
                          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {isUploadingLogo ? (
                              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                            ) : companyLogo ? (
                              <img src={companyLogo} alt="Company Logo Preview" className="w-full h-full object-contain p-1" />
                            ) : (
                              <Building className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-black text-slate-700 block">
                              {isUploadingLogo ? 'Processing logo...' : 'Upload corporate logo'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                              Supports PNG, JPG, or SVG. Max size 5MB.
                            </span>
                          </div>
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Head / Creator Profile Group */}
                  <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
                    <h4 className="text-[11px] font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Company Head (Primary Admin)</span>
                    </h4>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sanin Mohammed"
                        value={headName}
                        onChange={(e) => setHeadName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Corporate Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="saninmohammed03@gmail.com"
                          value={headEmail}
                          onChange={(e) => setHeadEmail(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Access Password *</label>
                        <input
                          type="password"
                          required
                          placeholder="Min 6 characters"
                          value={headPassword}
                          onChange={(e) => setHeadPassword(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Generate & Launch Workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
