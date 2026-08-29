'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl bg-[#E3A857] px-5 py-2.5 font-semibold text-[#1D1815] transition active:scale-[0.98]"
    >
      تسجيل الخروج
    </button>
  );
}
