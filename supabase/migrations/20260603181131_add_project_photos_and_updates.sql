-- Add photos to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- Create project_updates table
CREATE TABLE IF NOT EXISTS public.project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_updates
DROP POLICY IF EXISTS "auth_select_project_updates" ON public.project_updates;
CREATE POLICY "auth_select_project_updates" ON public.project_updates
    FOR SELECT TO authenticated
    USING (
        (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_updates.project_id AND projects.owner_id = auth.uid()))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "auth_insert_project_updates" ON public.project_updates;
CREATE POLICY "auth_insert_project_updates" ON public.project_updates
    FOR INSERT TO authenticated
    WITH CHECK (
        (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_updates.project_id AND projects.owner_id = auth.uid()))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "auth_update_project_updates" ON public.project_updates;
CREATE POLICY "auth_update_project_updates" ON public.project_updates
    FOR UPDATE TO authenticated
    USING (
        (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_updates.project_id AND projects.owner_id = auth.uid()))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "auth_delete_project_updates" ON public.project_updates;
CREATE POLICY "auth_delete_project_updates" ON public.project_updates
    FOR DELETE TO authenticated
    USING (
        (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_updates.project_id AND projects.owner_id = auth.uid()))
        OR public.is_admin()
    );

-- Setup Storage Bucket for project-images
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images');
