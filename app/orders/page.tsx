import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { OrdersList } from './OrdersList';
import { RealtimeOrdersRefresher } from '../RealtimeOrdersRefresher';

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isManager = profile?.role === 'manager';

  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (!isManager) {
    query = query.eq('created_by', user.id);
  }

  const { data: orders } = await query;

  return (
    <main dir="rtl" className="min-h-screen bg-[#141110] px-4 py-8 text-[#F5EFE6]">
      <RealtimeOrdersRefresher />

      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">الطلبات</h1>
          <div className="flex items-center gap-3">
            {isManager && (
              <Link
                href="/dashboard"
                className="text-sm text-[#B8ADA0] hover:text-[#E3A857]"
              >
                لوحة التحكم
              </Link>
            )}
            <Link
              href="/orders/new"
              className="rounded-xl bg-[#E3A857] px-4 py-2 font-semibold text-[#1D1815] transition active:scale-[0.98]"
            >
              + طلب جديد
            </Link>
          </div>
        </div>

        <OrdersList initialOrders={orders ?? []} />
      </div>
    </main>
  );
}
