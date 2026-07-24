import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  Building,
  ArrowUpRight,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { queryAIAssistant, AIMessage } from '../../services/aiService';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const {
    tasks,
    clients,
    employees,
    activeRolePerspective,
    setSelectedTaskId,
    setSelectedClientId,
    setActiveTab,
  } = useERP();

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Hello! I am your SYNCWAVE AI assistant. Ask me anything about overdue deliverables, team workload, or client accounts.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const result = await queryAIAssistant(
      textToSend,
      { tasks, clients, employees },
      activeRolePerspective
    );

    const aiMsg: AIMessage = {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text: result.text,
      actions: result.actions,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const query = inputText;
    setInputText('');
    handleSendMessage(query);
  };

  const executeAction = (action: { label: string; actionType: string; payload?: any }) => {
    if (action.actionType === 'navigate' && action.payload?.tab) {
      setActiveTab(action.payload.tab);
      onClose();
    } else if (action.actionType === 'view_task' && action.payload?.id) {
      setSelectedTaskId(action.payload.id);
      setActiveTab('tasks');
      onClose();
    } else if (action.actionType === 'view_client' && action.payload?.id) {
      setSelectedClientId(action.payload.id);
      setActiveTab('clients');
      onClose();
    }
  };

  const renderMessageContent = (msg: AIMessage) => {
    const text = msg.text;

    // Detect message types for micro-widget rendering
    const isGreeting = text.includes('Hello! I am your SYNCWAVE AI assistant') || text.includes('Hello! I am your SYNCWAVE AI Assistant');
    const isSummary = text.includes('summary of the company workspace') || text.includes('Active Deliverables');
    const isOverdueList = text.includes('overdue tasks') || text.includes('urgent or overdue tasks');
    const isTeamWorkload = text.includes('team members') || text.includes('active deliverables') || text.includes('active engineer');
    const isClientAccounts = text.includes('client accounts') || text.includes('total client accounts');

    // A. Friendly Greeting Card Rendering (Clean light mode matching system layout)
    if (msg.sender === 'assistant' && isGreeting) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs tracking-wider">
            <Sparkles className="w-4.5 h-4.5 animate-pulse text-indigo-500" />
            <span>SyncWave Assistant Online</span>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
              Hello! I am your SYNCWAVE AI assistant. I can help you monitor workload, track client projects, locate overdue tasks, or navigate your workspace.
            </p>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Monitor staff task distribution</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Track critical/overdue deliverables</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Access key client partner details</span>
              </div>
            </div>
          </div>

          {msg.actions && msg.actions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
              {msg.actions.map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => executeAction(act)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] shadow-sm transition-all transform hover:-translate-y-0.5"
                >
                  {act.label}
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // B. Workspace summary rendering
    if (msg.sender === 'assistant' && isSummary) {
      const activeTasksCount = tasks.filter(t => t.status !== 'done').length;
      const criticalCount = tasks.filter(t => t.isOverdue || t.priority === 'urgent').length;
      const activeStaff = employees.filter(e => e.status === 'active').length;

      return (
        <div className="space-y-4">
          <p className="font-semibold text-slate-800 leading-relaxed">
            Here is your live SyncWave workspace state:
          </p>
          
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div>
                <span className="text-xl font-numeric font-extrabold text-indigo-900">{activeTasksCount}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Workspace Tasks</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Urgent</span>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-numeric font-extrabold text-indigo-900">{criticalCount}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Action Items</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Capacity</span>
                <Users className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div>
                <span className="text-xl font-numeric font-extrabold text-indigo-900">{activeStaff}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Active Staff</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Partners</span>
                <Building className="w-3.5 h-3.5 text-cyan-600" />
              </div>
              <div>
                <span className="text-xl font-numeric font-extrabold text-indigo-900">{clients.length}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Accounts</span>
              </div>
            </div>
          </div>

          {msg.actions && msg.actions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2 pt-3 border-t border-slate-105">
              {msg.actions.map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => executeAction(act)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] shadow-sm transition-all transform hover:-translate-y-0.5"
                >
                  {act.label}
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // C. Overdue list rendering
    if (msg.sender === 'assistant' && isOverdueList) {
      const overdueTasks = tasks.filter(t => t.isOverdue || t.priority === 'urgent');

      return (
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xs tracking-wide">
            <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>{overdueTasks.length} Urgent Deliverables Flagged</span>
          </div>
          
          <div className="space-y-2.5">
            {overdueTasks.slice(0, 3).map((task) => (
              <div 
                key={task.id} 
                className="p-3.5 rounded-2xl bg-white border-l-4 border-l-rose-500 border-y border-r border-slate-200 hover:border-rose-400/40 transition-all cursor-pointer flex items-start gap-2.5 group shadow-2xs"
                onClick={() => {
                  setSelectedTaskId(task.id);
                  setActiveTab('tasks');
                  onClose();
                }}
              >
                <Clock className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-800 text-[11px] truncate group-hover:text-rose-600 transition-colors">
                      {task.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-rose-50 text-rose-600 border border-rose-100 tracking-wider">
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Assigned: <strong className="text-slate-700">{task.assignedTo || 'Unassigned'}</strong></span>
                    <span>Due: <strong className="text-slate-700 font-numeric">{task.dueDate}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {msg.actions && msg.actions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
              {msg.actions.map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => executeAction(act)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 font-bold text-[10px] shadow-2xs transition-all transform hover:-translate-y-0.5"
                >
                  {act.label}
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // D. Team workload rendering
    if (msg.sender === 'assistant' && isTeamWorkload) {
      const activeStaff = employees.filter(e => e.status === 'active');
      const pendingTasksCount = tasks.filter(t => t.status !== 'done').length;
      const avgTasks = activeStaff.length > 0 ? (pendingTasksCount / activeStaff.length) : 0;
      
      let loadStatus = '🟢 Balanced';
      let loadColor = 'text-emerald-600';
      if (avgTasks > 3) {
        loadStatus = '🔴 Overloaded';
        loadColor = 'text-rose-600';
      } else if (avgTasks > 1.5) {
        loadStatus = '🟡 Moderate';
        loadColor = 'text-amber-600';
      }

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">Staff Workload Distribution</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 ${loadColor}`}>
              {loadStatus}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
              <span className="text-[9px] text-slate-500 block mb-0.5 font-bold uppercase tracking-wider">Active Staff</span>
              <span className="text-base font-extrabold text-slate-900">{activeStaff.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
              <span className="text-[9px] text-slate-500 block mb-0.5 font-bold uppercase tracking-wider font-numeric">Pending Tasks</span>
              <span className="text-base font-extrabold text-slate-900">{pendingTasksCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
              <span className="text-[9px] text-slate-500 block mb-0.5 font-bold uppercase tracking-wider font-numeric">Avg Load</span>
              <span className="text-base font-extrabold text-slate-900">{avgTasks.toFixed(1)}</span>
            </div>
          </div>

          <div className="space-y-2">
            {activeStaff.slice(0, 3).map((emp) => {
              const empTasks = tasks.filter(t => t.assignedTo === emp.name && t.status !== 'done').length;
              return (
                <div key={emp.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-150 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 leading-none">{emp.name}</p>
                      <span className="text-[9px] text-slate-500">{emp.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 px-2 py-0.5 rounded bg-slate-50 font-numeric">
                    {empTasks} active tasks
                  </span>
                </div>
              );
            })}
          </div>

          {msg.actions && msg.actions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
              {msg.actions.map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => executeAction(act)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] shadow-sm transition-all transform hover:-translate-y-0.5"
                >
                  {act.label}
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // E. Client accounts rendering
    if (msg.sender === 'assistant' && isClientAccounts) {
      const activeClients = clients.filter(c => c.status === 'active');
      const onboardingClients = clients.filter(c => c.status === 'onboarding');

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">Client Partner Directory</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600">
              {clients.length} Accounts Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
              <span className="text-[9px] text-slate-500 block mb-0.5 font-bold uppercase tracking-wider">Active</span>
              <span className="text-base font-extrabold text-slate-900">{activeClients.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
              <span className="text-[9px] text-slate-500 block mb-0.5 font-bold uppercase tracking-wider">Onboarding</span>
              <span className="text-base font-extrabold text-slate-900">{onboardingClients.length}</span>
            </div>
          </div>

          <div className="space-y-2">
            {clients.slice(0, 3).map((client) => (
              <div 
                key={client.id}
                className="p-3 rounded-xl bg-white border border-slate-150 flex flex-col gap-1 cursor-pointer hover:border-cyan-400 shadow-2xs"
                onClick={() => {
                  setSelectedClientId(client.id);
                  setActiveTab('clients');
                  onClose();
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] truncate">{client.companyName}</span>
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                    client.status === 'active' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {client.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 leading-none mt-1">
                  <span>Contact: {client.contactName}</span>
                  <span className="font-mono text-slate-600 font-semibold">{client.industry}</span>
                </div>
              </div>
            ))}
          </div>

          {msg.actions && msg.actions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
              {msg.actions.map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => executeAction(act)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] shadow-sm transition-all transform hover:-translate-y-0.5"
                >
                  {act.label}
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Default Fallback
    return (
      <div className="space-y-2.5">
        <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
        
        {msg.actions && msg.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
            {msg.actions.map((act, idx) => (
              <button
                key={idx}
                onClick={() => executeAction(act)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 font-bold text-[10px] shadow-2xs transition-all transform hover:-translate-y-0.5"
              >
                {act.label}
                <ArrowUpRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SUGGESTED_QUERIES = [
    { label: '📋 Task Matrix', query: 'Summarize active tasks' },
    { label: '⚠️ Overdue Items', query: 'Show overdue tasks' },
    { label: '👥 Team Workload', query: 'Tell me about team workload' },
    { label: '🏢 Client Portfolio', query: 'Show client accounts' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
          {/* Light Theme matching backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/25 backdrop-blur-xs pointer-events-auto"
          />

          {/* Dynamic Light Theme-Matched Drawer Card */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative w-full max-w-md bg-[#FAFAF7] border-l border-indigo-50/80 shadow-2xl h-full flex flex-col pointer-events-auto z-10 overflow-hidden"
          >
            {/* Custom Header */}
            <div className="p-4 border-b border-indigo-50/60 bg-white/90 backdrop-blur-md flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/10 font-bold">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">SYNCWAVE AI Copilot</h3>
                  <span className="text-[9px] text-indigo-600 font-bold tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Gemini 2.5 Active
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-slate-200 bg-[#FAFAF7]">
              {messages.map((msg) => {
                const isAI = msg.sender === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 text-xs ${
                      isAI ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isAI && (
                      <div className="w-7 h-7 rounded-lg bg-white border border-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className="max-w-[85%] flex flex-col gap-1.5">
                      <div
                        className={`p-4 rounded-2xl ${
                          isAI
                            ? 'bg-white text-slate-800 border border-indigo-50/80 shadow-2xs rounded-bl-none'
                            : 'bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/10 rounded-br-none'
                        }`}
                      >
                        {renderMessageContent(msg)}
                      </div>
                      <span className="text-[9px] text-slate-400 block px-1 text-right">
                        {msg.timestamp}
                      </span>
                    </div>

                    {!isAI && (
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={feedEndRef} />

              {isTyping && (
                <div className="flex gap-2 items-center text-xs text-slate-400 p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>AI assistant is compiling workspace status...</span>
                </div>
              )}
            </div>

            {/* Suggestion Chips */}
            <div className="p-3 border-t border-indigo-50/50 bg-slate-50/80 z-10">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                Suggested Commands
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUERIES.map((sq) => (
                  <button
                    key={sq.label}
                    onClick={() => handleSendMessage(sq.query)}
                    className="px-3 py-2 rounded-xl bg-white border border-indigo-50 text-slate-700 text-[10px] font-semibold hover:border-indigo-400 hover:text-indigo-600 transition-all transform hover:-translate-y-0.5 shadow-2xs"
                  >
                    {sq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Input Bar */}
            <form onSubmit={onSubmitForm} className="p-3.5 border-t border-indigo-50/50 bg-white flex gap-2 z-10">
              <input
                type="text"
                placeholder="Ask Copilot about tasks, workload..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all font-medium"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all shrink-0 font-bold"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
