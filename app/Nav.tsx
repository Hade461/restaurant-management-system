import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // لو ما في مستخدم مسجل دخول (مثلاً إحنا بصفحة تسجيل الدخول)، ما نعرض القائمة
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isManager = profile?.role === 'manager';

  const links = [
    { href: '/', label: 'الرئيسية' },
    { href: '/orders', label: 'الطلبات' },
    ...(isManager
      ? [
          { href: '/menu', label: 'المنيو' },
          { href: '/staff', label: 'الموظفين' },
          { href: '/dashboard', label: 'لوحة التحكم' },
        ]
      : []),
  ];

  return (
    <nav
      dir="rtl"
      className="sticky top-0 z-40 flex items-center gap-1 overflow-x-auto border-b border-[#2A241F] bg-[#1D1815] px-4 py-2"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-[#B8ADA0] transition hover:bg-[#2A241F] hover:text-[#E3A857]"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
