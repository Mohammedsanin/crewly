import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2 } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { backdropVariants, modalVariants } from '../../theme/animations';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose }) => {
  const { addClient } = useERP();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contractValue, setContractValue] = useState<string>('');
  const [industry, setIndustry] = useState('Fintech & Software');
  const [status, setStatus] = useState<'active' | 'onboarding' | 'lead'>('lead');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactName || !contactEmail) return;

    addClient({
      companyName,
      contactName,
      contactEmail,
      contractValue: contractValue ? Number(contractValue) : 0,
      industry,
      status,
    });

    onClose();
    setCompanyName('');
    setContactName('');
    setContactEmail('');
    setContractValue('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

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
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-800">Register Enterprise Client</h3>
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
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Global Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Primary Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Robert Sterling"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="r.sterling@acme.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Contract Value ($ ARR) <span className="text-[10px] text-slate-400 font-semibold">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    placeholder="e.g. 100000"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all font-medium"
                  >
                    <option value="lead">Sales Lead</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="active">Active Client</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Industry Sector</label>
                <input
                  type="text"
                  placeholder="Fintech & Software"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
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
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  Save Enterprise Client
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
