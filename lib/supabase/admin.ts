import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ⚠️ هذا الملف يُستخدم فقط داخل Server Actions — أبداً لا يُستورد في أي
// ملف يحمل توجيه 'use client'، لأن مفتاح service_role يمنح صلاحيات كاملة.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
