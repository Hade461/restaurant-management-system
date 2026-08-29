import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// عميل Supabase يُستخدم داخل Server Components و Server Actions
// هذا ما يخلي السيرفر "يعرف" هوية المستخدم ودوره بشكل موثوق (مطلوب لأمان RLS)
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // يحدث هذا بشكل طبيعي عند الاستدعاء من مكوّن سيرفر عادي
            // ولا داعي للقلق طالما الـ middleware مفعّل (انظر src/middleware.ts)
          }
        },
      },
    }
  );
}
