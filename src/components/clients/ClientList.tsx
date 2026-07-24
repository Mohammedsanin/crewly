import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, DollarSign, Calendar, Mail, User, Plus, Eye } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { pageVariants } from '../../theme/animations';
import { CustomSelect } from '../common/CustomSelect';

interface ClientListProps {
  onOpenAddClientModal: () => void;
}

export const ClientList: React.FC<ClientListProps> = ({ onOpenAddClientModal }) => {
  const { clients, setSelectedClientId, activeRolePerspective } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #b45309 70%, #f59e0b 100%)' }}
      >
        {[...Array(10)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white/15"
            style={{ width: 3+i%3, height: 3+i%3, left: `${i*10+5}%`, top: `${15+(i%4)*20}%` }}
            animate={{ y:[0,-10,0], opacity:[0.3,0.7,0.3] }}
            transition={{ duration: 2+i%3*0.5, repeat: Infinity, delay: i*0.15 }}
          />
        ))}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-bold mb-3">
              <Building2 className="w-3 h-3" /><span>CRM Module</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Enterprise CRM</h2>
            <p className="text-amber-100 text-sm mt-1">{clients.length} accounts · SLA tracking & ARR portfolio</p>
          </div>
          {activeRolePerspective === 'admin' && (
            <motion.button whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
              onClick={onOpenAddClientModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-amber-700 text-xs font-black shadow-xl shadow-black/20 shrink-0">
              <Plus className="w-4 h-4" /><span>Add Client</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── Filter Bar ── */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm px-4 py-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search client accounts by name, industry..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100/60 transition-all" />
        </div>
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active Accounts', badgeDot: 'bg-emerald-500' },
            { value: 'onboarding', label: 'Onboarding', badgeDot: 'bg-amber-500' },
            { value: 'lead', label: 'Sales Lead', badgeDot: 'bg-indigo-500' },
          ]}
        />
      </motion.div>

      {/* Client Cards Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 340, damping: 24 }}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => setSelectedClientId(client.id)}
              className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-500" />
              
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {client.companyName}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">{client.industry}</span>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full shrink-0 shadow-xs ${
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

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      Contact
                    </span>
                    <span className="font-bold text-slate-800 truncate text-right">{client.contactName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      Email
                    </span>
                    <span className="text-slate-600 truncate max-w-[170px] font-medium text-right" title={client.contactEmail}>
                      {client.contactEmail}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                {activeRolePerspective === 'admin' ? (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contract Value</span>
                    <p className="text-sm font-extrabold text-emerald-600 font-mono leading-tight flex items-baseline gap-1 mt-0.5">
                      ₹{client.contractValue.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-slate-400 font-sans font-normal">/yr</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account Status</span>
                    <p className="text-xs font-bold text-slate-700 font-sans mt-0.5">
                      Enterprise Account
                    </p>
                  </div>
                )}

                <span className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>View CRM</span>
                  <span className="text-indigo-500 font-black">→</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty State Illustration */
        <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto my-8 border border-indigo-100">
          <img
            src="/empty_clients.png"
            alt="No client accounts found"
            className="w-52 h-52 object-contain filter drop-shadow opacity-90"
          />
          <div>
            <h3 className="text-base font-bold text-slate-800">No clients match your filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Your CRM portfolio is clean. Register a new enterprise client to track ARR contracts.
            </p>
          </div>
          {activeRolePerspective === 'admin' && (
            <button
              onClick={onOpenAddClientModal}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              Add Enterprise Client
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
