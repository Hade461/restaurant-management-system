'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type IconKey = 'home' | 'orders' | 'menu' | 'staff' | 'dashboard';

type NavLink = {
  href: string;
  label: string;
  icon: IconKey;
};

function Icon({ name }: { name: IconKey }) {
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
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h14V10" />
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

function ChickenMark() {
  return (
    <svg viewBox="0 0 100 100" className="h-8 w-8 flex-shrink-0" aria-hidden>
      <circle cx="50" cy="55" r="34" fill="#F2C572" />
      <path
        d="M28 40 Q22 22 38 24 Q42 12 52 22 Q62 10 66 26 Q78 24 72 40"
        fill="#E3A857"
      />
      <circle cx="38" cy="52" r="4.2" fill="#241C15" />
      <circle cx="62" cy="52" r="4.2" fill="#241C15" />
      <path d="M44 62 Q50 68 56 62 Q50 72 44 62 Z" fill="#D9762E" />
    </svg>
  );
}

export function SidebarClient({
  links,
  userName,
  roleLabel,
}: {
  links: NavLink[];
  userName: string;
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* زر فتح القائمة على الموبايل */}
      <button
        onClick={() => setOpen(true)}
        aria-label="فتح القائمة"
        className="fixed top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1D1815] text-[#E3A857] shadow-lg md:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* خلفية معتمة عند فتح القائمة بالموبايل */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        dir="rtl"
        className={`fixed inset-y-0 right-0 z-40 flex w-64 flex-col border-l border-[#2A241F] bg-[#1D1815] p-4 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChickenMark />
            <span className="font-[var(--font-arabic-display)] text-lg font-bold text-[#F5EFE6]">
              لوحة المطعم
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
            className="text-[#B8ADA0] md:hidden"
          >
            ✕
          </button>
        </div>

        {/* بيانات المستخدم الحالي — بدل ما يكون فيه صفحة كاملة لهيك */}
        <div className="mb-5 rounded-xl bg-[#141110] px-3 py-2">
          <p className="truncate text-sm font-medium text-[#F5EFE6]">
            {userName}
          </p>
          <p className="text-xs text-[#8A8074]">{roleLabel}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? 'bg-[#2A241F] text-[#E3A857]'
                    : 'text-[#B8ADA0] hover:bg-[#2A241F] hover:text-[#E3A857]'
                }`}
              >
                <Icon name={link.icon} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* زر تسجيل الخروج — ثابت بأسفل القائمة دايماً */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-4 flex items-center gap-3 rounded-xl border-t border-[#2A241F] px-3 pt-4 text-sm text-[#E88A8A] transition hover:text-red-400 disabled:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          {loggingOut ? 'جارِ الخروج...' : 'تسجيل الخروج'}
        </button>
      </aside>
    </>
  );
}
