import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // لو المستخدم مسجّل دخول أصلاً، ما في داعي يشوف صفحة تسجيل الدخول
  if (user) {
    redirect('/');
  }

  return <LoginForm />;
}
