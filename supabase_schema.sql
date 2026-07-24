-- =====================================================================
-- SYNCWAVE ERP - PRODUCTION ENTERPRISE SUPABASE DATABASE SCHEMA
-- =====================================================================
-- Instructions: Run this entire script in your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CLEANUP PREVIOUS STALE DATA (SAFE DROP IF EXISTS)
DROP TABLE IF EXISTS public.employee_photos CASCADE;
DROP TABLE IF EXISTS public.employee_skills CASCADE;
DROP TABLE IF EXISTS public.task_comments CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.client_documents CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.recent_activities CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.company_profile CASCADE;

-- =====================================================================
-- 3. CORE TABLE DEFINITIONS WITH CASCADE FOREIGN KEYS
-- =====================================================================

-- 3.1 EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY DEFAULT ('emp-' || floor(extract(epoch from now()) * 1000)::text),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'Employee',
  department TEXT DEFAULT 'Engineering',
  joined_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active',
  avatar TEXT DEFAULT '',
  phone TEXT,
  password TEXT DEFAULT 'admin123',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 EMPLOYEE PHOTOS TABLE (SEPARATE DEDICATED MEDIA STORAGE)
CREATE TABLE IF NOT EXISTS public.employee_photos (
  id TEXT PRIMARY KEY DEFAULT ('photo-' || floor(extract(epoch from now()) * 1000)::text),
  employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  file_name TEXT,
  file_size INT,
  mime_type TEXT DEFAULT 'image/jpeg',
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.3 EMPLOYEE SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.employee_skills (
  id TEXT PRIMARY KEY DEFAULT ('skill-' || floor(extract(epoch from now()) * 1000)::text),
  employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency_level TEXT DEFAULT 'Intermediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.4 CLIENTS TABLE (ENTERPRISE CRM)
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY DEFAULT ('cli-' || floor(extract(epoch from now()) * 1000)::text),
  company_name TEXT NOT NULL,
  industry TEXT DEFAULT 'Technology',
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  contract_value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  start_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.5 CLIENT DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.client_documents (
  id TEXT PRIMARY KEY DEFAULT ('doc-' || floor(extract(epoch from now()) * 1000)::text),
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  document_type TEXT DEFAULT 'Contract',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.6 TASKS TABLE (SPRINT KANBAN)
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY DEFAULT ('task-' || floor(extract(epoch from now()) * 1000)::text),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT DEFAULT 'Unassigned',
  assigned_employee_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
  client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT,
  due_date DATE DEFAULT CURRENT_DATE,
  is_overdue BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.7 TASK COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.task_comments (
  id TEXT PRIMARY KEY DEFAULT ('cmt-' || floor(extract(epoch from now()) * 1000)::text),
  task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.8 COMPANY PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.company_profile (
  id TEXT PRIMARY KEY DEFAULT 'comp-main',
  name TEXT NOT NULL DEFAULT 'SYNCWAVE Technologies Inc.',
  logo TEXT DEFAULT '/logo_mark.png',
  legal_address TEXT DEFAULT '742 Evergreen Terrace, San Francisco, CA 94107',
  tax_id TEXT DEFAULT 'US-9842104-X',
  contact_email TEXT DEFAULT 'contact@syncwave.io',
  contact_phone TEXT DEFAULT '+1 (555) 234-5678',
  website TEXT DEFAULT 'https://syncwave.io',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.9 INVOICES TABLE (FINANCIAL BILLING LEDGER)
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY DEFAULT ('inv-' || floor(extract(epoch from now()) * 1000)::text),
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'Paid',
  billing_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.10 RECENT ACTIVITIES TABLE (REALTIME AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.recent_activities (
  id TEXT PRIMARY KEY DEFAULT ('act-' || floor(extract(epoch from now()) * 1000)::text),
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  activity_type TEXT DEFAULT 'task',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- 4. SUPABASE STORAGE BUCKET CONFIGURATION
-- =====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-photos', 'employee-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public photo bucket select" ON storage.objects;
DROP POLICY IF EXISTS "Public photo bucket insert" ON storage.objects;
DROP POLICY IF EXISTS "Public photo bucket update" ON storage.objects;
DROP POLICY IF EXISTS "Public photo bucket delete" ON storage.objects;

CREATE POLICY "Public photo bucket select" ON storage.objects FOR SELECT USING (bucket_id = 'employee-photos');
CREATE POLICY "Public photo bucket insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'employee-photos');
CREATE POLICY "Public photo bucket update" ON storage.objects FOR UPDATE USING (bucket_id = 'employee-photos');
CREATE POLICY "Public photo bucket delete" ON storage.objects FOR DELETE USING (bucket_id = 'employee-photos');

-- =====================================================================
-- 5. ROW LEVEL SECURITY (RLS) & AUTHORIZATION
-- =====================================================================
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_activities ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check Admin Privilege
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE (id = auth.uid()::text OR email = auth.jwt()->>'email') 
      AND (role ILIKE '%Admin%')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean existing policies
DROP POLICY IF EXISTS "Employees select policy" ON public.employees;
DROP POLICY IF EXISTS "Employees insert policy" ON public.employees;
DROP POLICY IF EXISTS "Employees update policy" ON public.employees;
DROP POLICY IF EXISTS "Employees delete policy" ON public.employees;

DROP POLICY IF EXISTS "Photos select policy" ON public.employee_photos;
DROP POLICY IF EXISTS "Photos insert policy" ON public.employee_photos;
DROP POLICY IF EXISTS "Photos update policy" ON public.employee_photos;
DROP POLICY IF EXISTS "Photos delete policy" ON public.employee_photos;

DROP POLICY IF EXISTS "Tasks select policy" ON public.tasks;
DROP POLICY IF EXISTS "Tasks insert policy" ON public.tasks;
DROP POLICY IF EXISTS "Tasks update policy" ON public.tasks;
DROP POLICY IF EXISTS "Tasks delete policy" ON public.tasks;

DROP POLICY IF EXISTS "Clients select policy" ON public.clients;
DROP POLICY IF EXISTS "Clients insert policy" ON public.clients;
DROP POLICY IF EXISTS "Clients update policy" ON public.clients;
DROP POLICY IF EXISTS "Clients delete policy" ON public.clients;

DROP POLICY IF EXISTS "Company profile select policy" ON public.company_profile;
DROP POLICY IF EXISTS "Company profile update policy" ON public.company_profile;
DROP POLICY IF EXISTS "Invoices select policy" ON public.invoices;
DROP POLICY IF EXISTS "Invoices modify policy" ON public.invoices;
DROP POLICY IF EXISTS "Activities select policy" ON public.recent_activities;
DROP POLICY IF EXISTS "Activities insert policy" ON public.recent_activities;

-- Granular RLS Policies for Application Operations
CREATE POLICY "Employees select policy" ON public.employees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Employees insert policy" ON public.employees FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Employees update policy" ON public.employees FOR UPDATE USING (auth.role() = 'authenticated' AND (id = auth.uid()::text OR public.is_admin()));
CREATE POLICY "Employees delete policy" ON public.employees FOR DELETE USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "Photos select policy" ON public.employee_photos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Photos insert policy" ON public.employee_photos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Photos update policy" ON public.employee_photos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Photos delete policy" ON public.employee_photos FOR DELETE USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "Tasks select policy" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Tasks insert policy" ON public.tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Tasks update policy" ON public.tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Tasks delete policy" ON public.tasks FOR DELETE USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "Clients select policy" ON public.clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Clients insert policy" ON public.clients FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND public.is_admin());
CREATE POLICY "Clients update policy" ON public.clients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Clients delete policy" ON public.clients FOR DELETE USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "Company profile select policy" ON public.company_profile FOR SELECT USING (true);
CREATE POLICY "Company profile update policy" ON public.company_profile FOR UPDATE USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "Invoices select policy" ON public.invoices FOR SELECT USING (auth.role() = 'authenticated' AND public.is_admin());
CREATE POLICY "Invoices modify policy" ON public.invoices FOR ALL USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "Activities select policy" ON public.recent_activities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Activities insert policy" ON public.recent_activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================================
-- 6. AUTOMATIC SUPABASE AUTH USER PROVISIONING TRIGGER
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_emp_id TEXT;
  avatar_url TEXT;
BEGIN
  new_emp_id := 'emp-' || new.id;
  avatar_url := COALESCE(new.raw_user_meta_data->>'avatar', '');

  INSERT INTO public.employees (id, name, email, role, department, status, avatar, password)
  VALUES (
    new_emp_id,
    COALESCE(new.raw_user_meta_data->>'name', initcap(split_part(new.email, '@', 1))),
    LOWER(new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'Employee'),
    COALESCE(new.raw_user_meta_data->>'department', 'Engineering'),
    'active',
    avatar_url,
    '1234'
  )
  ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, status = 'active';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 7. SEED SINGLE PRIMARY ADMIN ACCOUNT & COMPANY DATA
-- =====================================================================
INSERT INTO public.employees (id, name, email, role, department, status, avatar, password)
VALUES 
  ('emp-developer-master', 'Developer', 'developer@syncwave.io', 'Admin', 'Engineering', 'active', '', 'developer')
ON CONFLICT (email) DO UPDATE 
SET name = EXCLUDED.name, password = EXCLUDED.password, role = EXCLUDED.role, status = 'active';

INSERT INTO public.company_profile (id, name, logo, legal_address, tax_id, contact_email, contact_phone, website)
VALUES 
  ('comp-main', 'SYNCWAVE Technologies Inc.', '/logo_mark.png', '742 Evergreen Terrace, San Francisco, CA 94107', 'US-9842104-X', 'contact@syncwave.io', '+1 (555) 234-5678', 'https://syncwave.io')
ON CONFLICT (id) DO NOTHING;
