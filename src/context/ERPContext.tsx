import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Task,
  Employee,
  Client,
  Toast,
  User,
  NavigationTab,
  NewEmployeeCredentials,
  TaskStatus,
  CompanyProfile,
  TaskComment,
  ChatMessage,
  ChatConnection,
} from '../types';
import {
  syncEmployeesFromSupabase,
  syncTasksFromSupabase,
  syncClientsFromSupabase,
  saveEmployeeToSupabase,
  saveTaskToSupabase,
  saveClientToSupabase,
  subscribeToSupabaseChanges,
  deleteEmployeeFromSupabase,
  deleteTaskFromSupabase,
  deleteClientFromSupabase,
  saveCompanyProfileToSupabase,
  syncCompanyProfileFromSupabase,
  syncChatMessagesFromSupabase,
  saveChatMessageToSupabase,
  syncChatConnectionsFromSupabase,
  saveChatConnectionToSupabase,
} from '../services/supabaseClient';

interface ERPContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  activeRolePerspective: 'admin' | 'employee';
  setActiveRolePerspective: (perspective: 'admin' | 'employee') => void;

  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Deep-link Selected Item State for Click-Through Map
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'updatedAt'>) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  updateTaskDetails: (taskId: string, updates: Partial<Task>) => void;
  addTaskComment: (taskId: string, text: string) => void;
  deleteTask: (taskId: string) => void;

  // Employees
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'joinedDate'>) => NewEmployeeCredentials;
  updateEmployee: (empId: string, updates: Partial<Employee>) => void;
  resetEmployeePassword: (empId: string) => NewEmployeeCredentials | null;
  deleteEmployee: (empId: string) => void;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'startDate'>) => void;
  updateClientNotes: (clientId: string, notes: string) => void;

  // Company Settings
  companyInfo: CompanyProfile;
  updateCompanyInfo: (updates: Partial<CompanyProfile>) => void;
  createCompanyWorkspace: (companyData: CompanyProfile, adminData: Omit<Employee, 'id' | 'joinedDate'>) => Employee;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Recent Activity Log
  recentActivities: { id: string; user: string; action: string; time: string; type: 'task' | 'employee' | 'client' | 'finance' }[];
  clearAllData: () => void;

  // Real-time Chat
  chatMessages: ChatMessage[];
  sendChatMessage: (channel: string, text: string) => Promise<void>;
  syncChatMessages: (channel: string) => Promise<void>;
  chatChannels: string[];
  createChatChannel: (channelName: string) => void;
  chatConnections: ChatConnection[];
  sendChatRequest: (receiverId: string) => Promise<void>;
  acceptChatRequest: (connectionId: string) => Promise<void>;
  declineChatRequest: (connectionId: string) => Promise<void>;
}

const defaultUser: User = {
  id: 'emp-developer-master',
  name: 'Developer',
  email: 'developer@crewly.io',
  role: 'Admin',
  avatar: '',
};

const defaultCompany: CompanyProfile = {
  name: 'Crewly Technologies Inc.',
  logo: '/logo.png',
  legalAddress: '742 Evergreen Terrace, San Francisco, CA 94107',
  taxId: 'US-9842104-X',
  contactEmail: 'contact@crewly.io',
  contactPhone: '+1 (555) 234-5678',
  website: 'https://crewly.io',
};

export const defaultEmployees: Employee[] = [
  {
    id: 'emp-developer-master',
    name: 'Developer',
    email: 'developer@crewly.io',
    role: 'Admin',
    department: 'Engineering',
    joinedDate: '2026-01-01',
    status: 'active',
    avatar: '',
    password: 'developer',
  },
];

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('syncwave_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.email !== 'admin@crewly.io' &&
          parsed.name !== 'Sarah Chen' &&
          !parsed.id?.startsWith('usr-')
        ) {
          return parsed;
        }
      } catch (e) {}
    }
    return defaultUser;
  });
  const [activeRolePerspective, setActiveRolePerspective] = useState<'admin' | 'employee'>('admin');
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('syncwave_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('syncwave_user');
    }
  }, [currentUser]);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [companyInfo, setCompanyInfo] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('syncwave_company');
    return saved ? JSON.parse(saved) : defaultCompany;
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('syncwave_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('syncwave_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const [chatChannels, setChatChannels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('syncwave_chat_channels');
      return saved
        ? JSON.parse(saved)
        : ['#general', '#engineering', '#design', '#product', '#operations', '#sales', '#announcements'];
    } catch (e) {
      return ['#general', '#engineering', '#design', '#product', '#operations', '#sales', '#announcements'];
    }
  });

  useEffect(() => {
    localStorage.setItem('syncwave_chat_channels', JSON.stringify(chatChannels));
  }, [chatChannels]);

  const [chatConnections, setChatConnections] = useState<ChatConnection[]>(() => {
    try {
      const saved = localStorage.getItem('syncwave_chat_connections');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('syncwave_chat_connections', JSON.stringify(chatConnections));
  }, [chatConnections]);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('syncwave_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('syncwave_employees');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (e) =>
              e.name !== 'Alex Vance' &&
              e.name !== 'Sarah Chen' &&
              !e.id?.startsWith('usr-')
          );
          if (cleaned.length > 0) return cleaned;
        }
      } catch (e) {}
    }
    return defaultEmployees;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('syncwave_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [recentActivities, setRecentActivities] = useState<{ id: string; user: string; action: string; time: string; type: 'task' | 'employee' | 'client' | 'finance' }[]>([]);

  useEffect(() => {
    localStorage.setItem('syncwave_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('syncwave_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('syncwave_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('syncwave_company', JSON.stringify(companyInfo));
  }, [companyInfo]);

  // Real-time Multi-Browser & Cloud Sync (Postgres CDC + BroadcastChannel + Polling)
  useEffect(() => {
    async function loadCloudData() {
      const [remoteEmps, remoteTasks, remoteClients, remoteCompany] = await Promise.all([
        syncEmployeesFromSupabase(),
        syncTasksFromSupabase(),
        syncClientsFromSupabase(),
        syncCompanyProfileFromSupabase(),
      ]);

      if (remoteEmps && remoteEmps.length > 0) {
        const now = Date.now();
        const cleanEmps = remoteEmps.filter(
          (e: Employee) => {
            const recentlyDeleted = localStorage.getItem(`deleted_emp_${e.id}`);
            if (recentlyDeleted && now - Number(recentlyDeleted) < 15000) {
              return false;
            }
            return e.name !== 'Alex Vance' &&
              e.name !== 'Sarah Chen' &&
              !e.id?.startsWith('usr-');
          }
        );

        setEmployees((prev) => {
          const isSame = JSON.stringify(prev) === JSON.stringify(cleanEmps);
          return isSame ? prev : (cleanEmps.length > 0 ? cleanEmps : defaultEmployees);
        });
      }
      if (remoteTasks && remoteTasks.length > 0) {
        setTasks((prevTasks: Task[]): Task[] => {
          const now = Date.now();
          const remoteMap = new Map(remoteTasks.map((t: Task) => [t.id, t]));
          let changed = false;
          
          const updated = prevTasks.map((localTask: Task): Task | null => {
            const recentlyDeleted = localStorage.getItem(`deleted_task_${localTask.id}`);
            if (recentlyDeleted && now - Number(recentlyDeleted) < 15000) {
              changed = true;
              return null;
            }

            const lastUpdated = new Date(localTask.updatedAt || 0).getTime();
            if (now - lastUpdated < 15000) {
              return localTask;
            }

            const remote = remoteMap.get(localTask.id);
            if (!remote) {
              changed = true;
              return null;
            }

            if (JSON.stringify(remote) !== JSON.stringify(localTask)) {
              changed = true;
              return remote;
            }
            return localTask;
          }).filter(Boolean) as Task[];

          for (const rt of remoteTasks) {
            const recentlyDeleted = localStorage.getItem(`deleted_task_${rt.id}`);
            if (recentlyDeleted && now - Number(recentlyDeleted) < 15000) {
              continue;
            }
            if (!prevTasks.some((pt: Task) => pt.id === rt.id)) {
              changed = true;
              updated.push(rt);
            }
          }

          return changed ? updated : prevTasks;
        });
      }
      if (remoteClients && remoteClients.length > 0) {
        const now = Date.now();
        const cleanClients = remoteClients.filter((c: Client) => {
          const recentlyDeleted = localStorage.getItem(`deleted_client_${c.id}`);
          if (recentlyDeleted && now - Number(recentlyDeleted) < 15000) {
            return false;
          }
          return true;
        });
        setClients((prev) => {
          const isSame = JSON.stringify(prev) === JSON.stringify(cleanClients);
          return isSame ? prev : cleanClients;
        });
      }
      const lastCompUpdated = Number(localStorage.getItem('syncwave_company_last_updated') || 0);
      if (remoteCompany && (Date.now() - lastCompUpdated > 15000)) {
        setCompanyInfo(remoteCompany);
      }

      const remoteConns = await syncChatConnectionsFromSupabase();
      if (remoteConns && remoteConns.length > 0) {
        setChatConnections((prev) => {
          const connMap = new Map(prev.map((c) => [c.id, c]));
          remoteConns.forEach((c) => connMap.set(c.id, c));
          const merged = Array.from(connMap.values());
          const isSame = JSON.stringify(prev) === JSON.stringify(merged);
          return isSame ? prev : merged;
        });
      }
    }

    loadCloudData();

    // 1. Supabase Realtime Postgres CDC Subscription
    const unsubscribe = subscribeToSupabaseChanges(() => {
      loadCloudData();
    });

    // 2. Cross-Tab & Multi-Browser BroadcastChannel Sync
    let broadcast: BroadcastChannel | null = null;
    try {
      broadcast = new BroadcastChannel('syncwave_erp_realtime');
      broadcast.onmessage = (event) => {
        if (event.data === 'SYNC_ERP_DATA') {
          loadCloudData();
        } else if (event.data && event.data.type === 'NEW_CHAT_MESSAGE') {
          const newMsg = event.data.payload;
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        } else if (event.data && event.data.type === 'NEW_CHAT_CHANNEL') {
          const newChan = event.data.payload;
          setChatChannels((prev) => {
            if (prev.includes(newChan)) return prev;
            return [...prev, newChan];
          });
        } else if (event.data && event.data.type === 'NEW_CHAT_CONNECTION') {
          const newConn = event.data.payload;
          setChatConnections((prev) => {
            const index = prev.findIndex((c) => c.id === newConn.id);
            if (index > -1) {
              return prev.map((c) => (c.id === newConn.id ? newConn : c));
            }
            return [...prev, newConn];
          });
        }
      };
    } catch (e) {}

    // 3. Background Sync Interval (3 seconds) so separate browsers auto-reflect changes instantly
    const pollInterval = setInterval(() => {
      loadCloudData();
    }, 3000);

    return () => {
      unsubscribe();
      if (broadcast) broadcast.close();
      clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
    // No legacy migrations needed in production
  }, []);

  const clearAllData = () => {
    setTasks([]);
    setEmployees([]);
    setClients([]);
    setRecentActivities([]);
    localStorage.removeItem('syncwave_tasks');
    localStorage.removeItem('syncwave_employees');
    localStorage.removeItem('syncwave_clients');
  };

  const updateCompanyInfo = (updates: Partial<CompanyProfile>) => {
    localStorage.setItem('syncwave_company_last_updated', Date.now().toString());
    setCompanyInfo((prev) => {
      const updated = { ...prev, ...updates };
      const companyId = localStorage.getItem('syncwave_active_company_id') || 'comp-main';
      saveCompanyProfileToSupabase(updated, companyId);
      return updated;
    });
    addToast({
      type: 'success',
      title: 'Company Settings Updated',
      message: 'Corporate details updated successfully.',
    });
  };

  const createCompanyWorkspace = (companyData: CompanyProfile, adminData: Omit<Employee, 'id' | 'joinedDate'>): Employee => {
    const companyId = `comp-${Date.now()}`;
    localStorage.setItem('syncwave_active_company_id', companyId);
    localStorage.setItem('syncwave_company_last_updated', Date.now().toString());
    
    // 1. Save and update company details
    setCompanyInfo(companyData);
    saveCompanyProfileToSupabase(companyData, companyId);

    // 2. Add Company Head as Administrator Employee
    const id = `emp-${Date.now()}`;
    const joinedDate = new Date().toISOString().split('T')[0];
    const newAdmin: Employee = {
      ...adminData,
      id,
      joinedDate,
      role: 'Admin',
      status: 'active',
    };

    setEmployees((prev) => [newAdmin, ...prev]);
    saveEmployeeToSupabase(newAdmin);

    // 3. Return the new admin toLoginPage for automatic login
    addToast({
      type: 'success',
      title: 'Workspace Created! 🎉',
      message: `Welcome to ${companyData.name}. Workspace is initialized.`,
    });

    return newAdmin;
  };

  // Toast Helpers
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: Toast = { id, duration: 4000, ...toast };
    setToasts((prev) => {
      const exists = prev.some((t) => t.title === toast.title && t.type === toast.type);
      if (exists) return prev;
      return [...prev.slice(-2), newToast];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Task Handlers
  const addTask = (taskData: Omit<Task, 'id' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      comments: [],
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    saveTaskToSupabase(newTask);
    addToast({
      type: 'success',
      title: 'Task Created',
      message: `"${newTask.title}" added to ${newTask.status.replace('_', ' ').toUpperCase()}`,
    });
    setRecentActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        user: currentUser?.name || 'Admin',
        action: `Created task "${newTask.title}"`,
        time: 'Just now',
        type: 'task',
      },
      ...prev,
    ]);
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    let taskTitle = '';
    let updatedTaskObj: Task | null = null;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          taskTitle = task.title;
          updatedTaskObj = {
            ...task,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
          return updatedTaskObj;
        }
        return task;
      })
    );

    if (updatedTaskObj) {
      saveTaskToSupabase(updatedTaskObj);
    }

    if (newStatus === 'done') {
      addToast({
        type: 'success',
        title: 'Task Completed! 🎉',
        message: `"${taskTitle}" moved to Completed`,
      });
    }

    setRecentActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        user: currentUser?.name || 'Admin',
        action: `Moved "${taskTitle}" to ${newStatus.replace('_', ' ')}`,
        time: 'Just now',
        type: 'task',
      },
      ...prev,
    ]);
  };

  const updateTaskDetails = (taskId: string, updates: Partial<Task>) => {
    const existing = tasks.find((t) => t.id === taskId);
    if (!existing) return;

    const oldTask = existing;
    const updatedTaskObj = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? updatedTaskObj : t))
    );

    saveTaskToSupabase(updatedTaskObj);

    // Determine what changed for cleaner log action
    let changeMsg = `Updated task "${updatedTaskObj.title}"`;
    if (updates.assignedTo && oldTask.assignedTo !== updates.assignedTo) {
      changeMsg = `Reassigned "${updatedTaskObj.title}" to ${updates.assignedTo}`;
    } else if (updates.clientName && oldTask.clientName !== updates.clientName) {
      changeMsg = `Linked "${updatedTaskObj.title}" to client ${updates.clientName}`;
    }

    setRecentActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        user: currentUser?.name || 'Admin',
        action: changeMsg,
        time: 'Just now',
        type: 'task',
      },
      ...prev,
    ]);
  };

  const addTaskComment = (taskId: string, text: string) => {
    const newComment: TaskComment = {
      id: `cmt-${Date.now()}`,
      authorName: currentUser?.name || 'Alex Vance',
      authorAvatar: currentUser?.avatar || '',
      text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let updatedTaskObj: Task | null = null;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          updatedTaskObj = {
            ...t,
            comments: [...(t.comments || []), newComment],
            updatedAt: new Date().toISOString(),
          };
          return updatedTaskObj;
        }
        return t;
      })
    );

    if (updatedTaskObj) {
      saveTaskToSupabase(updatedTaskObj);
      setRecentActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          user: currentUser?.name || 'Admin',
          action: `Commented on "${updatedTaskObj?.title}": "${text.length > 30 ? text.substring(0, 30) + '...' : text}"`,
          time: 'Just now',
          type: 'task',
        },
        ...prev,
      ]);
    }
  };

  const deleteTask = (taskId: string) => {
    localStorage.setItem(`deleted_task_${taskId}`, Date.now().toString());
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteTaskFromSupabase(taskId);
    if (taskToDelete) {
      addToast({
        type: 'info',
        title: 'Task Removed',
        message: `"${taskToDelete.title}" has been deleted.`,
      });
      setRecentActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          user: currentUser?.name || 'Admin',
          action: `Deleted task "${taskToDelete.title}"`,
          time: 'Just now',
          type: 'task',
        },
        ...prev,
      ]);
    }
  };

  // Employee Handlers
  const addEmployee = (empData: Omit<Employee, 'id' | 'joinedDate'>): NewEmployeeCredentials => {
    const id = `emp-${Date.now()}`;
    const joinedDate = new Date().toISOString().split('T')[0];

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let tempPassword = 'SW-';
    for (let i = 0; i < 8; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newEmp: Employee = {
      ...empData,
      email: empData.email.trim().toLowerCase(),
      id,
      joinedDate,
      password: tempPassword,
    };

    setEmployees((prev) => [newEmp, ...prev]);
    saveEmployeeToSupabase(newEmp);

    addToast({
      type: 'success',
      title: 'Employee Added',
      message: `${newEmp.name} has been added to ${newEmp.department}`,
    });

    setRecentActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        user: currentUser?.name || 'Admin',
        action: `Added employee ${newEmp.name} (${newEmp.role})`,
        time: 'Just now',
        type: 'employee',
      },
      ...prev,
    ]);

    return {
      employee: newEmp,
      tempPassword,
      portalUrl: `https://erp.syncwave.io/login?user=${encodeURIComponent(newEmp.email)}`,
    };
  };

  const updateEmployee = (empId: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === empId) {
          const updated = { ...e, ...updates };
          saveEmployeeToSupabase(updated);
          return updated;
        }
        return e;
      })
    );

    if (currentUser && (currentUser.id === empId || currentUser.email === updates.email)) {
      setCurrentUser((prev) => (prev ? { ...prev, name: updates.name || prev.name, avatar: updates.avatar !== undefined ? updates.avatar : prev.avatar } : prev));
    }

    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Account settings & credentials modified.',
    });
  };

  const resetEmployeePassword = (empId: string): NewEmployeeCredentials | null => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return null;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let tempPassword = 'SW-';
    for (let i = 0; i < 8; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const updatedEmp = { ...emp, password: tempPassword };
    setEmployees((prev) => prev.map((e) => (e.id === empId ? updatedEmp : e)));

    addToast({
      type: 'warning',
      title: 'Password Reset Generated',
      message: `New temporary password created for ${emp.name}`,
    });

    return {
      employee: updatedEmp,
      tempPassword,
      portalUrl: `https://erp.syncwave.io/login?user=${encodeURIComponent(emp.email)}`,
    };
  };

  const deleteEmployee = async (empId: string) => {
    localStorage.setItem(`deleted_emp_${empId}`, Date.now().toString());
    const empToDelete = employees.find((e) => e.id === empId);
    setEmployees((prev) => prev.filter((e) => e.id !== empId));

    if (empToDelete) {
      // 1. Permanent deletion from Supabase Cloud
      deleteEmployeeFromSupabase(empId, empToDelete.email);

      // 2. Broadcast deletion to all active browsers
      try {
        const bc = new BroadcastChannel('syncwave_erp_realtime');
        bc.postMessage('SYNC_ERP_DATA');
        bc.close();
      } catch (e) {}

      addToast({
        type: 'info',
        title: 'Employee Removed',
        message: `${empToDelete.name} has been permanently deleted.`,
      });

      setRecentActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          user: currentUser?.name || 'Admin',
          action: `Deleted employee ${empToDelete.name}`,
          time: 'Just now',
          type: 'employee',
        },
        ...prev,
      ]);
    }
  };

  // Client Handlers
  const addClient = (clientData: Omit<Client, 'id' | 'startDate'>) => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      startDate: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);
    saveClientToSupabase(newClient);
    addToast({
      type: 'success',
      title: 'Client Registered',
      message: `${newClient.companyName} added with ₹${newClient.contractValue.toLocaleString('en-IN')} contract value`,
    });
    setRecentActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        user: currentUser?.name || 'Admin',
        action: `Registered client ${newClient.companyName}`,
        time: 'Just now',
        type: 'client',
      },
      ...prev,
    ]);
  };

  const updateClientNotes = (clientId: string, notes: string) => {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, notes } : c)));
    addToast({
      type: 'info',
      title: 'Notes Saved',
      message: 'Client account notes updated.',
    });
  };

  const syncChatMessages = async (channel: string) => {
    const remoteMsgs = await syncChatMessagesFromSupabase(channel);
    if (remoteMsgs) {
      setChatMessages((prev) => {
        const msgMap = new Map(prev.map((m) => [m.id, m]));
        remoteMsgs.forEach((m) => msgMap.set(m.id, m));
        const merged = Array.from(msgMap.values()).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return merged;
      });
    }
  };

  const sendChatMessage = async (channel: string, text: string) => {
    if (!currentUser) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      channel,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || '',
      text,
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    await saveChatMessageToSupabase(newMsg);

    try {
      const bc = new BroadcastChannel('syncwave_erp_realtime');
      bc.postMessage({ type: 'NEW_CHAT_MESSAGE', payload: newMsg });
      bc.close();
    } catch (e) {}
  };

  const createChatChannel = (channelName: string) => {
    const formatted = channelName.startsWith('#') ? channelName.trim() : `#${channelName.trim()}`;
    setChatChannels((prev) => {
      if (prev.includes(formatted)) return prev;
      const updated = [...prev, formatted];
      try {
        const bc = new BroadcastChannel('syncwave_erp_realtime');
        bc.postMessage({ type: 'NEW_CHAT_CHANNEL', payload: formatted });
        bc.close();
      } catch (e) {}
      return updated;
    });
  };

  const sendChatRequest = async (receiverId: string) => {
    if (!currentUser) return;
    const exists = chatConnections.find(
      (c) => (c.senderId === currentUser.id && c.receiverId === receiverId) ||
             (c.senderId === receiverId && c.receiverId === currentUser.id)
    );
    if (exists) return;

    const newConn: ChatConnection = {
      id: `conn-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setChatConnections((prev) => [...prev, newConn]);
    await saveChatConnectionToSupabase(newConn);

    try {
      const bc = new BroadcastChannel('syncwave_erp_realtime');
      bc.postMessage({ type: 'NEW_CHAT_CONNECTION', payload: newConn });
      bc.close();
    } catch (e) {}
  };

  const acceptChatRequest = async (connectionId: string) => {
    const conn = chatConnections.find((c) => c.id === connectionId);
    if (!conn) return;

    const updated = { ...conn, status: 'accepted' as const };
    setChatConnections((prev) => prev.map((c) => (c.id === connectionId ? updated : c)));
    await saveChatConnectionToSupabase(updated);

    try {
      const bc = new BroadcastChannel('syncwave_erp_realtime');
      bc.postMessage({ type: 'NEW_CHAT_CONNECTION', payload: updated });
      bc.close();
    } catch (e) {}
  };

  const declineChatRequest = async (connectionId: string) => {
    const conn = chatConnections.find((c) => c.id === connectionId);
    if (!conn) return;

    const updated = { ...conn, status: 'declined' as const };
    setChatConnections((prev) => prev.map((c) => (c.id === connectionId ? updated : c)));
    await saveChatConnectionToSupabase(updated);

    try {
      const bc = new BroadcastChannel('syncwave_erp_realtime');
      bc.postMessage({ type: 'NEW_CHAT_CONNECTION', payload: updated });
      bc.close();
    } catch (e) {}
  };

  return (
    <ERPContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeRolePerspective,
        setActiveRolePerspective,
        activeTab,
        setActiveTab,
        selectedTaskId,
        setSelectedTaskId,
        selectedEmployeeId,
        setSelectedEmployeeId,
        selectedClientId,
        setSelectedClientId,
        tasks,
        addTask,
        updateTaskStatus,
        updateTaskDetails,
        addTaskComment,
        deleteTask,
        employees,
        addEmployee,
        updateEmployee,
        resetEmployeePassword,
        deleteEmployee,
        clients,
        addClient,
        updateClientNotes,
        companyInfo,
        updateCompanyInfo,
        createCompanyWorkspace,
        toasts,
        addToast,
        removeToast,
        recentActivities,
        clearAllData,
        chatMessages,
        sendChatMessage,
        syncChatMessages,
        chatChannels,
        createChatChannel,
        chatConnections,
        sendChatRequest,
        acceptChatRequest,
        declineChatRequest,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
