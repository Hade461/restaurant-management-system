import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from './LogoutButton';

// صفحة مؤقتة بسيطة — رح تتوسع لاحقاً لتصير لوحة تحكم حقيقية
// هدفها الحالي فقط إثبات إنه تسجيل الدخول والخروج شغالين
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  return (
    <main
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#141110] px-4 text-center"
    >
      <p className="text-lg text-[#F5EFE6]">
        مرحباً، {profile?.full_name ?? user.email}
      </p>
      <p className="text-sm text-[#B8ADA0]">
        الدور: {profile?.role === 'manager' ? 'مدير' : 'نادل/كاشير'}
      </p>
      <LogoutButton />
    </main>
  );
}
