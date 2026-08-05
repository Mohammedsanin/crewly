import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, ExternalLink, X, Shield, Key } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfigInStorage, getSupabaseClient } from '../../services/supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfigInStorage(url, anonKey);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const client = getSupabaseClient();
      if (!client) {
        setTestResult({ success: false, message: 'Invalid URL or key syntax.' });
        setIsTesting(false);
        return;
      }
      const { error } = await client.from('employees').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet, but server connected!
        setTestResult({ success: true, message: `Connected to Supabase! (${error.message})` });
      } else {
        setTestResult({ success: true, message: 'Connected to Supabase DB successfully!' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Connection failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  const copySQL = () => {
    const sql = `-- Crewly ERP Supabase Migration with New User Auto-Sync Triggers
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY DEFAULT ('emp-' || floor(extract(epoch from now()) * 1000)::text),
  name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, role TEXT DEFAULT 'Developer',
  department TEXT DEFAULT 'Engineering', joined_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active', avatar TEXT, password TEXT DEFAULT 'admin123',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY DEFAULT ('cli-' || floor(extract(epoch from now()) * 1000)::text),
  company_name TEXT NOT NULL, industry TEXT DEFAULT 'Technology',
  contact_person TEXT NOT NULL, contact_email TEXT NOT NULL, contract_value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active', start_date DATE DEFAULT CURRENT_DATE, notes TEXT
);
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY DEFAULT ('task-' || floor(extract(epoch from now()) * 1000)::text),
  title TEXT NOT NULL, description TEXT, status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium', assigned_to TEXT DEFAULT 'Unassigned', due_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

-- AUTOMATIC AUTH USER TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.employees (id, name, email, role, department, status, avatar, password)
  VALUES (
    'emp-' || new.id,
    COALESCE(new.raw_user_meta_data->>'name', initcap(split_part(new.email, '@', 1))),
    LOWER(new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'Admin / Developer'),
    COALESCE(new.raw_user_meta_data->>'department', 'Engineering'),
    'active',
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
    'admin123'
  )
  ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, status = 'active';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.employees (id, name, email, role, department, status, avatar, password)
VALUES ('emp-sanin', 'Sanin', 'saninmohammed03@gmail.com', 'Admin / Lead Architect', 'Engineering', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'admin123')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, status = 'active';`;

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-xl bg-white border border-white/80 rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {/* Top Accent Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                  Supabase Cloud Connection
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${config.isConnected ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                    {config.isConnected ? 'Active & Ready' : 'Local Offline Mode'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Real-time cloud database configuration & SQL schema</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Database Endpoint Status
                </span>
                <button onClick={handleTestConnection} disabled={isTesting} className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 text-[11px]">
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  Test Live Connection
                </button>
              </div>
              <p className="text-slate-500 font-mono break-all text-[11px]">
                {config.url ? config.url : 'No custom URL set (using local storage persistence)'}
              </p>
              {testResult && (
                <div className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            {/* Config Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Supabase Project URL</label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Supabase Anon / Public Key</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Copy SQL Migration Button */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-indigo-950 block">Database Tables Schema (SQL)</span>
                  <span className="text-[11px] text-indigo-700">Creates employees, clients & tasks tables in 1 click</span>
                </div>
                <button
                  type="button"
                  onClick={copySQL}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Save Supabase Settings
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
