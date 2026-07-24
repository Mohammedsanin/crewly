import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Employee, Task, Client, CompanyProfile } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  const envMeta = (import.meta as any).env || {};

  const envUrl =
    envMeta.VITE_SUPABASE_URL ||
    envMeta.NEXT_PUBLIC_SUPABASE_URL ||
    localStorage.getItem('syncwave_supabase_url') ||
    'https://jwqfplsfneltcyumrvew.supabase.co';

  const envKey =
    envMeta.VITE_SUPABASE_ANON_KEY ||
    envMeta.VITE_SUPABASE_PUBLISHABLE_KEY ||
    envMeta.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    localStorage.getItem('syncwave_supabase_key') ||
    'sb_publishable_yc4Ge9YhfPUvTsEiCpYJag_rQtnZdBk';

  const isConnected = Boolean(envUrl && envKey && envUrl.startsWith('http'));

  return {
    url: envUrl,
    anonKey: envKey,
    isConnected,
  };
};

export const saveSupabaseConfigInStorage = (url: string, anonKey: string) => {
  if (url) localStorage.setItem('syncwave_supabase_url', url.trim());
  if (anonKey) localStorage.setItem('syncwave_supabase_key', anonKey.trim());
  window.location.reload();
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.isConnected) return null;
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
};

// ==========================================
// SUPABASE STORAGE PHOTO UPLOAD HELPER
// ==========================================

export const uploadEmployeePhotoToSupabase = async (file: File, employeeId: string): Promise<string> => {
  const client = getSupabaseClient();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const filePath = `${employeeId}/${Date.now()}.${fileExt}`;

  if (client) {
    try {
      const { data, error } = await client.storage.from('employee-photos').upload(filePath, file, { upsert: true });
      if (!error && data) {
        const { data: publicUrlData } = client.storage.from('employee-photos').getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (e) {
      console.warn('Supabase Storage bucket upload fallback to base64:', e);
    }
  }

  // Persistent base64 Data URL fallback so uploaded user photos never expire
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};

// ==========================================
// SUPABASE REAL-TIME DATABASE SYNC HELPERS
// ==========================================

export const subscribeToSupabaseChanges = (onDataChanged: () => void) => {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel('erp-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => onDataChanged())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => onDataChanged())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => onDataChanged())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_profile' }, () => onDataChanged())
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (e) {
    return () => {};
  }
};

export const syncEmployeesFromSupabase = async (): Promise<Employee[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('employees').select('*');
    if (error) throw error;
    if (!data) return null;
    return data
      .filter((row: any) => row.id !== 'emp-sanin-system-admin' && row.email !== 'admin@syncwave.io')
      .map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        department: row.department,
        joinedDate: row.joined_date || row.joinedDate || new Date().toISOString().split('T')[0],
        status: row.status || 'active',
        avatar: row.avatar || '',
        password: row.password || 'admin123',
      }));
  } catch (err) {
    console.warn('Supabase fetch employees fallback to local:', err);
    return null;
  }
};

export const saveEmployeeToSupabase = async (employee: Employee): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const empId = employee.id || `emp-${Date.now()}`;
    const avatarUrl = employee.avatar || '';

    const { error } = await client.from('employees').upsert(
      {
        id: empId,
        name: employee.name,
        email: employee.email.trim().toLowerCase(),
        role: employee.role || 'Developer',
        department: employee.department || 'Engineering',
        joined_date: employee.joinedDate || new Date().toISOString().split('T')[0],
        status: employee.status || 'active',
        avatar: avatarUrl,
        password: employee.password || 'admin123',
      },
      { onConflict: 'email' }
    );

    if (!error && avatarUrl) {
      try {
        await client.from('employee_photos').upsert(
          {
            employee_id: empId,
            photo_url: avatarUrl,
            file_name: `${employee.name.toLowerCase().replace(/\s+/g, '_')}_avatar`,
            is_primary: true,
          },
          { onConflict: 'employee_id' }
        );
      } catch (photoErr) {}
    }

    return !error;
  } catch (err) {
    console.warn('Supabase save employee error:', err);
    return false;
  }
};

export const deleteEmployeeFromSupabase = async (empId: string, email?: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    try {
      await client.from('employee_photos').delete().eq('employee_id', empId);
    } catch (e) {}

    let query = client.from('employees').delete();
    if (empId) {
      query = query.eq('id', empId);
    } else if (email) {
      query = query.eq('email', email.trim().toLowerCase());
    }
    const { error } = await query;
    return !error;
  } catch (err) {
    console.warn('Supabase delete employee error:', err);
    return false;
  }
};

export const syncTasksFromSupabase = async (): Promise<Task[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('tasks').select('*');
    if (error) throw error;
    if (!data) return null;
    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      status: row.status || 'todo',
      priority: row.priority || 'medium',
      assignedTo: row.assigned_to || row.assignedTo || 'Unassigned',
      clientId: row.client_id || row.clientId,
      clientName: row.client_name || row.clientName,
      dueDate: row.due_date || row.dueDate || new Date().toISOString().split('T')[0],
      tags: row.tags || [],
      comments: row.comments || [],
      updatedAt: row.updated_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Supabase fetch tasks fallback to local:', err);
    return null;
  }
};

export const saveTaskToSupabase = async (task: Task): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('tasks').upsert({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigned_to: task.assignedTo,
      client_id: task.clientId,
      due_date: task.dueDate,
      tags: task.tags,
      comments: task.comments,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    console.warn('Supabase save task error:', err);
    return false;
  }
};

export const syncClientsFromSupabase = async (): Promise<Client[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('clients').select('*');
    if (error) throw error;
    if (!data) return null;
    return data.map((row: any) => ({
      id: row.id,
      companyName: row.company_name || row.companyName,
      contactName: row.contact_person || row.contactName,
      contactEmail: row.contact_email || row.contactEmail,
      contactPhone: row.contact_phone || row.contactPhone,
      status: row.status || 'active',
      contractValue: Number(row.contract_value || row.contractValue || 0),
      startDate: row.start_date || row.startDate || new Date().toISOString().split('T')[0],
      industry: row.industry || 'Technology',
      notes: row.notes || '',
    }));
  } catch (err) {
    console.warn('Supabase fetch clients fallback to local:', err);
    return null;
  }
};

export const deleteTaskFromSupabase = async (taskId: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('tasks').delete().eq('id', taskId);
    return !error;
  } catch (err) {
    console.warn('Supabase delete task error:', err);
    return false;
  }
};

export const saveClientToSupabase = async (clientData: Client): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('clients').upsert({
      id: clientData.id,
      company_name: clientData.companyName,
      contact_person: clientData.contactName,
      contact_email: clientData.contactEmail,
      contact_phone: clientData.contactPhone,
      status: clientData.status,
      contract_value: clientData.contractValue,
      start_date: clientData.startDate,
      industry: clientData.industry,
      notes: clientData.notes,
    });
    return !error;
  } catch (err) {
    console.warn('Supabase save client error:', err);
    return false;
  }
};

export const deleteClientFromSupabase = async (clientId: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('clients').delete().eq('id', clientId);
    return !error;
  } catch (err) {
    console.warn('Supabase delete client error:', err);
    return false;
  }
};

export const syncCompanyProfileFromSupabase = async (companyId?: string): Promise<CompanyProfile | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  const activeId = companyId || localStorage.getItem('syncwave_active_company_id') || 'comp-main';
  try {
    const { data, error } = await client.from('company_profile').select('*').eq('id', activeId).single();
    if (error || !data) return null;
    return {
      name: data.name,
      logo: data.logo || '/logo_mark.png',
      legalAddress: data.legal_address || '',
      taxId: data.tax_id || '',
      contactEmail: data.contact_email || '',
      contactPhone: data.contact_phone || '',
      website: data.website || '',
    };
  } catch (err) {
    console.warn('Supabase fetch company profile fallback:', err);
    return null;
  }
};

export const saveCompanyProfileToSupabase = async (profile: CompanyProfile, companyId?: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  const activeId = companyId || localStorage.getItem('syncwave_active_company_id') || 'comp-main';
  try {
    const { error } = await client.from('company_profile').upsert({
      id: activeId,
      name: profile.name,
      logo: profile.logo || '/logo_mark.png',
      legal_address: profile.legalAddress,
      tax_id: profile.taxId,
      contact_email: profile.contactEmail,
      contact_phone: profile.contactPhone,
      website: profile.website,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    console.warn('Supabase save company profile error:', err);
    return false;
  }
};
