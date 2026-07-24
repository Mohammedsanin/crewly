import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ERPProvider, useERP } from './context/ERPContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { KanbanBoard } from './components/tasks/KanbanBoard';
import { EmployeeList } from './components/employees/EmployeeList';
import { ClientList } from './components/clients/ClientList';
import { FinancialsView } from './components/financials/FinancialsView';
import { CompanyProfileView } from './components/company/CompanyProfileView';

import { EmployeeDetailView } from './components/employees/EmployeeDetailView';
import { ClientDetailView } from './components/clients/ClientDetailView';
import { TaskDetailDrawer } from './components/tasks/TaskDetailDrawer';

import { AddTaskModal } from './components/tasks/AddTaskModal';
import { AddEmployeeModal } from './components/employees/AddEmployeeModal';
import { AddClientModal } from './components/clients/AddClientModal';

import { NaturalTaskCreatorModal } from './components/ai/NaturalTaskCreatorModal';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';

import { LoginPage } from './components/auth/LoginPage';

import { SupabaseModal } from './components/common/SupabaseModal';

const ERPAppContent: React.FC = () => {
  const {
    currentUser,
    activeTab,
    selectedTaskId,
    setSelectedTaskId,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedClientId,
    setSelectedClientId,
  } = useERP();

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isNaturalTaskOpen, setIsNaturalTaskOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAF7] text-slate-800 relative select-none">
      {/* Floating Animated Ambient Mesh Gradient Orbs */}
      <motion.div
        animate={{ y: [0, -25, 0], x: [0, 15, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed -top-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-indigo-200/25 blur-3xl pointer-events-none z-0"
      />
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, -15, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="fixed -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-purple-200/25 blur-3xl pointer-events-none z-0"
      />

      {/* Sidebar Navigation */}
      <Sidebar onOpenAIAssistant={() => setIsAIAssistantOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
        <Header
          onOpenAddTaskModal={() => setIsAddTaskOpen(true)}
          onOpenAddEmployeeModal={() => setIsAddEmployeeOpen(true)}
          onOpenAddClientModal={() => setIsAddClientOpen(true)}
          onOpenNaturalTaskModal={() => setIsNaturalTaskOpen(true)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {/* Deep-link Click-Through Detail Views Priority */}
          {selectedEmployeeId ? (
            <EmployeeDetailView
              employeeId={selectedEmployeeId}
              onBack={() => setSelectedEmployeeId(null)}
            />
          ) : selectedClientId ? (
            <ClientDetailView
              clientId={selectedClientId}
              onBack={() => setSelectedClientId(null)}
              onOpenAddTaskModal={() => setIsAddTaskOpen(true)}
            />
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && <DashboardView key="dashboard" />}
              {activeTab === 'tasks' && (
                <KanbanBoard key="tasks" onOpenAddTaskModal={() => setIsAddTaskOpen(true)} />
              )}
              {activeTab === 'employees' && (
                <EmployeeList key="employees" onOpenAddEmployeeModal={() => setIsAddEmployeeOpen(true)} />
              )}
              {activeTab === 'clients' && (
                <ClientList key="clients" onOpenAddClientModal={() => setIsAddClientOpen(true)} />
              )}
              {activeTab === 'financials' && <FinancialsView key="financials" />}
              {activeTab === 'company' && (
                <CompanyProfileView
                  key="company"
                  onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                />
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Slide-in Task Detail Drawer */}
      <TaskDetailDrawer taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />

      {/* Natural Task AI Modal */}
      <NaturalTaskCreatorModal isOpen={isNaturalTaskOpen} onClose={() => setIsNaturalTaskOpen(false)} />

      {/* Supabase Cloud Modal */}
      <SupabaseModal isOpen={isSupabaseModalOpen} onClose={() => setIsSupabaseModalOpen(false)} />

      {/* Standard Modals */}
      <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} />
      <AddEmployeeModal isOpen={isAddEmployeeOpen} onClose={() => setIsAddEmployeeOpen(false)} />
      <AddClientModal isOpen={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} />

      {/* Toast Stack */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ERPProvider>
      <ERPAppContent />
    </ERPProvider>
  );
};

export default App;
