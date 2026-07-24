export type NavigationTab = 'dashboard' | 'tasks' | 'employees' | 'clients' | 'financials' | 'company';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface TaskComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo: string; // Employee Name or ID
  clientId?: string; // Client ID link
  clientName?: string; // Linked Client Name
  dueDate: string; // YYYY-MM-DD
  isOverdue?: boolean;
  tags: string[];
  comments?: TaskComment[];
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: 'Engineering' | 'Design' | 'Product' | 'Sales' | 'Operations' | 'Finance';
  avatar: string;
  status: 'active' | 'onboarding' | 'leave' | 'inactive';
  phone?: string;
  joinedDate: string;
  password?: string;
}

export interface NewEmployeeCredentials {
  employee: Employee;
  tempPassword: string;
  portalUrl: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  status: 'active' | 'onboarding' | 'lead' | 'inactive';
  contractValue: number;
  startDate: string;
  industry: string;
  notes?: string;
}

export interface CompanyProfile {
  name: string;
  logo: string;
  legalAddress: string;
  taxId: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number; // ms
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Developer';
  avatar: string;
}
