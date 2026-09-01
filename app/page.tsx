import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RealtimeOrdersRefresher } from './RealtimeOrdersRefresher';

type ActionIconKey = 'plus' | 'orders' | 'menu' | 'staff' | 'dashboard';

function getGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'صباح الخير' : 'مساء الخير';
}

function ActionIcon({ name }: { name: ActionIconKey }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'orders':
      return (
        <svg {...common}>
          <path d="M6 3h12l1 5H5l1-5Z" />
          <path d="M5 8h14l-1 12H6L5 8Z" />
          <path d="M9 12h6" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...common}>
          <path d="M6 3v18" />
          <path d="M9 3v6a3 3 0 0 1-6 0V3" />
          <path d="M18 3c-2 0-3 1.5-3 4v4h3M18 3v18" />
        </svg>
      );
    case 'staff':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="8" r="2.5" />
          <path d="M15 14.3c2.7.4 5 2.7 5 5.7" />
        </svg>
      );
    case 'dashboard':
      return (
        <svg {...common}>
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20H2" />
        </svg>
      );
  }
}

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
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const isManager = profile?.role === 'manager';

  const { count: preparingCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'preparing');

  const actions: {
    href: string;
    label: string;
    desc: string;
    icon: ActionIconKey;
  }[] = [
    {
      href: '/orders/new',
      label: 'طلب جديد',
      desc: 'إنشاء طلب محلي، سفري، أو توصيل',
      icon: 'plus',
    },
    {
      href: '/orders',
      label: 'الطلبات',
      desc: 'متابعة كل الطلبات وحالتها',
      icon: 'orders',
    },
    ...(isManager
      ? [
          {
            href: '/menu',
            label: 'المنيو',
            desc: 'إدارة الأصناف والأسعار والصور',
            icon: 'menu' as const,
          },
          {
            href: '/staff',
            label: 'الموظفين',
            desc: 'إدارة حسابات النادل/الكاشير',
            icon: 'staff' as const,
          },
          {
            href: '/dashboard',
            label: 'لوحة التحكم',
            desc: 'المبيعات والإحصائيات',
            icon: 'dashboard' as const,
          },
        ]
      : []),
  ];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#141110] px-4 py-8 pt-20 text-[#F5EFE6] md:px-8 md:pt-8"
    >
      <RealtimeOrdersRefresher />

      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm text-[#8A8074]">{getGreeting()}،</p>
          <h1 className="text-2xl font-bold">
            {profile?.full_name ?? 'أهلاً بك'}
          </h1>
        </div>

        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-[#2A241F] bg-[#1D1815] p-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#2A241F] text-xl font-bold text-[#E3A857]">
            {preparingCount ?? 0}
          </div>
          <div>
            <p className="font-medium">طلبات قيد التحضير الآن</p>
            <p className="text-xs text-[#8A8074]">
              يتحدّث تلقائياً فور تغيّر أي طلب
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-2xl border border-[#2A241F] bg-[#1D1815] p-5 transition hover:border-[#E3A857]"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2A241F] text-[#E3A857] transition group-hover:bg-[#E3A857] group-hover:text-[#1D1815]">
                <ActionIcon name={action.icon} />
              </div>
              <p className="font-semibold">{action.label}</p>
              <p className="text-xs text-[#8A8074]">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
