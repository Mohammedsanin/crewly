import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Check, ArrowLeft, ArrowRight, Calendar, AlertCircle, Building, User } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { parseNaturalLanguageTask, ParsedTaskResult } from '../../services/aiService';
import { backdropVariants, modalVariants } from '../../theme/animations';

interface NaturalTaskCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NaturalTaskCreatorModal: React.FC<NaturalTaskCreatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addTask, employees, clients, currentUser } = useERP();

  const [promptText, setPromptText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedTaskResult | null>(null);
  const [assignedTo, setAssignedTo] = useState(employees[0]?.name || currentUser?.name || 'Alex Vance');

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsParsing(true);
    // Call improved context-aware parsing function
    const result = await parseNaturalLanguageTask(promptText, { employees, clients });
    setParsedResult(result);
    
    // Auto-select assignee if detected by the smart AI parse engine!
    if (result.assignedTo) {
      setAssignedTo(result.assignedTo);
    }
    setIsParsing(false);
  };

  const handleConfirmTask = () => {
    if (!parsedResult) return;

    const matchedClient = clients.find(
      (c) => c.companyName.toLowerCase() === parsedResult.clientName?.toLowerCase()
    );

    addTask({
      title: parsedResult.title,
      description: parsedResult.description,
      priority: parsedResult.priority,
      status: parsedResult.status,
      assignedTo,
      clientName: parsedResult.clientName || matchedClient?.companyName,
      clientId: matchedClient?.id,
      dueDate: parsedResult.dueDate,
      tags: parsedResult.tags,
    });

    onClose();
    setPromptText('');
    setParsedResult(null);
  };

  const EXAMPLE_PROMPTS = [
    'Schedule database security audit for Nexus Logistics before Friday urgent',
    'Create UI redesign task for design team due tomorrow ASAP',
  ];

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
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-xs"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-[#FAFAF7] border border-indigo-50 shadow-2xl rounded-3xl p-6 z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-indigo-50/70 pb-4 mb-4 z-10 relative">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/10">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-wide">Natural-Language Task AI</h3>
                  <p className="text-[11px] text-indigo-600 font-semibold">
                    Gemini AI extracts structured fields from your prompt
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!parsedResult ? (
              <form onSubmit={handleParse} className="space-y-4 z-10 relative">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-1">
                    Describe your deliverable in plain English
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Schedule database security audit for Nexus Logistics before Friday urgent"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all leading-relaxed font-semibold"
                  />
                </div>

                {/* Clickable Suggestion Prompts */}
                <div className="p-3 rounded-2xl bg-white border border-indigo-50/80 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    💡 Suggested Templates (Click to fill)
                  </span>
                  <div className="space-y-1.5">
                    {EXAMPLE_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPromptText(prompt)}
                        className="w-full text-left text-[11px] text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 p-2 rounded-xl border border-slate-200/60 hover:border-indigo-200 transition-all font-semibold"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-450 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isParsing}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Extracting Fields...</span>
                      </>
                    ) : (
                      <>
                        <span>Parse Prompt</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Confirmation Preview of AI Parsed Task (Light Theme matched) */
              <div className="space-y-5 z-10 relative">
                <div className="p-4 rounded-2xl bg-white border-l-4 border-l-indigo-500 border-y border-r border-indigo-50/80 shadow-2xs space-y-3">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest block">
                    AI Parsed Task Preview
                  </span>
                  
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{parsedResult.title}</h4>
                    <div className="text-[11px] text-slate-600 leading-relaxed font-semibold space-y-2.5">
                      {parsedResult.description.split('\n').map((line, idx) => {
                        if (line.startsWith('### ')) {
                          return (
                            <h5 key={idx} className="text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mt-3.5 first:mt-0">
                              {line.substring(4)}
                            </h5>
                          );
                        }
                        const isChecklist = line.startsWith('- [ ]') || line.startsWith('- [x]') || line.startsWith('- [X]');
                        if (isChecklist) {
                          const checked = line.startsWith('- [x]') || line.startsWith('- [X]');
                          const content = line.substring(5).trim();
                          return (
                            <div key={idx} className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-slate-50 border border-slate-150/60 shadow-2xs hover:bg-indigo-50/20 hover:border-indigo-100/30 transition-all">
                              <input
                                type="checkbox"
                                checked={checked}
                                readOnly
                                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-default"
                              />
                              <span className={`text-[11px] font-bold text-slate-700 ${checked ? 'line-through text-slate-400' : ''}`}>
                                {content}
                              </span>
                            </div>
                          );
                        }
                        if (line.trim() === '') {
                          return null;
                        }
                        return (
                          <p key={idx} className="text-slate-500 text-[11px] leading-relaxed font-medium bg-slate-50 border border-slate-150/40 p-2.5 rounded-xl">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-slate-500">Priority: <strong className="uppercase text-slate-800 font-bold">{parsedResult.priority}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-slate-500">Due: <strong className="text-slate-800 font-numeric font-bold">{parsedResult.dueDate}</strong></span>
                    </div>
                    {parsedResult.clientName && (
                      <div className="col-span-2 flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-cyan-600" />
                        <span className="text-slate-500">Linked Client: <strong className="text-slate-800 font-bold">{parsedResult.clientName}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
                    Assign Task To
                  </label>
                  <div className="relative">
                    {employees.length > 0 ? (
                      <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                      >
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.name}>
                            {emp.name} ({emp.department})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-between gap-3">
                  <button
                    onClick={() => setParsedResult(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-450 hover:text-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Edit Prompt</span>
                  </button>

                  <button
                    onClick={handleConfirmTask}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>Confirm & Create Task</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
