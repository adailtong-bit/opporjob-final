CREATE TABLE IF NOT EXISTS public.vendor_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'Others',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.vendor_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendors_contacts_select" ON public.vendor_contacts;
CREATE POLICY "vendors_contacts_select" ON public.vendor_contacts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.vendors v
            WHERE v.id = vendor_contacts.vendor_id
            AND (v.owner_id = auth.uid() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "vendors_contacts_insert" ON public.vendor_contacts;
CREATE POLICY "vendors_contacts_insert" ON public.vendor_contacts
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vendors v
            WHERE v.id = vendor_contacts.vendor_id
            AND (v.owner_id = auth.uid() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "vendors_contacts_update" ON public.vendor_contacts;
CREATE POLICY "vendors_contacts_update" ON public.vendor_contacts
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.vendors v
            WHERE v.id = vendor_contacts.vendor_id
            AND (v.owner_id = auth.uid() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "vendors_contacts_delete" ON public.vendor_contacts;
CREATE POLICY "vendors_contacts_delete" ON public.vendor_contacts
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.vendors v
            WHERE v.id = vendor_contacts.vendor_id
            AND (v.owner_id = auth.uid() OR public.is_admin())
        )
    );
