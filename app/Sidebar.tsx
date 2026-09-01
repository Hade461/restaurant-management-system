import { createClient } from '@/lib/supabase/server';
import { SidebarClient } from './SidebarClient';

export async function Sidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const isManager = profile?.role === 'manager';
  const roleLabel = isManager ? 'مدير' : 'نادل/كاشير';

  const links = [
    { href: '/', label: 'الرئيسية', icon: 'home' as const },
    { href: '/orders', label: 'الطلبات', icon: 'orders' as const },
    ...(isManager
      ? [
          { href: '/menu', label: 'المنيو', icon: 'menu' as const },
          { href: '/staff', label: 'الموظفين', icon: 'staff' as const },
          { href: '/dashboard', label: 'لوحة التحكم', icon: 'dashboard' as const },
        ]
      : []),
  ];

  return (
    <SidebarClient
      links={links}
      userName={profile?.full_name ?? user.email ?? ''}
      roleLabel={roleLabel}
    />
  );
}
