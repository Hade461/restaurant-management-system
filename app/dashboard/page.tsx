import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { RealtimeOrdersRefresher } from '../RealtimeOrdersRefresher';

function formatSYP(amount: number) {
  return amount.toLocaleString('ar-SY') + ' ل.س';
}

function startOfMonthISO(monthsAgo: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  return start.toISOString();
}

function startOfTodayISO() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start.toISOString();
}

export default async function DashboardPage() {
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

  if (profile?.role !== 'manager') {
    redirect('/');
  }

  const todayStart = startOfTodayISO();
  const thisMonthStart = startOfMonthISO(0);
  const lastMonthStart = startOfMonthISO(1);

  const { data: todayOrders } = await supabase
    .from('orders')
    .select('order_type, payment_status, total_amount')
    .gte('created_at', todayStart);

  const { data: monthlyOrders } = await supabase
    .from('orders')
    .select('payment_status, total_amount, created_at')
    .eq('payment_status', 'paid')
    .gte('created_at', lastMonthStart);

  const { data: preparingOrders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('status', 'preparing')
    .order('created_at', { ascending: true });

  const { data: topItems } = await supabase.rpc('get_top_selling_items');

  const orders = todayOrders ?? [];
  const todaysSales = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_amount, 0);
  const todaysOrdersCount = orders.length;
  const dineInCount = orders.filter((o) => o.order_type === 'dine_in').length;
  const takeawayDeliveryCount = orders.filter(
    (o) => o.order_type !== 'dine_in'
  ).length;

  const monthly = monthlyOrders ?? [];
  const thisMonthSales = monthly
    .filter((o) => o.created_at >= thisMonthStart)
    .reduce((sum, o) => sum + o.total_amount, 0);
  const lastMonthSales = monthly
    .filter((o) => o.created_at < thisMonthStart)
    .reduce((sum, o) => sum + o.total_amount, 0);

  const hasComparison = lastMonthSales > 0;
  const percentChange = hasComparison
    ? Math.round(((thisMonthSales - lastMonthSales) / lastMonthSales) * 100)
    : null;
  const isUp = (percentChange ?? 0) >= 0;

  return (
    <main dir="rtl" className="min-h-screen bg-[#141110] px-4 py-8 pt-20 text-[#F5EFE6] md:px-8 md:pt-8">
      <RealtimeOrdersRefresher />

      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <Link
            href="/orders"
            className="text-sm text-[#B8ADA0] hover:text-[#E3A857]"
          >
            عرض الطلبات
          </Link>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="مبيعات اليوم" value={formatSYP(todaysSales)} />
          <StatCard label="طلبات اليوم" value={String(todaysOrdersCount)} />
          <StatCard label="محلي" value={String(dineInCount)} />
          <StatCard label="سفري/توصيل" value={String(takeawayDeliveryCount)} />
        </div>

        {/* مقارنة المبيعات الشهرية */}
        <div className="mb-8 rounded-2xl border border-[#2A241F] bg-[#1D1815] p-5">
          <p className="mb-3 text-sm text-[#8A8074]">مقارنة المبيعات الشهرية</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-[#8A8074]">هذا الشهر</p>
              <p className="text-xl font-bold text-[#E3A857]">
                {formatSYP(thisMonthSales)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8A8074]">الشهر الماضي</p>
              <p className="text-lg font-medium text-[#B8ADA0]">
                {formatSYP(lastMonthSales)}
              </p>
            </div>
            {hasComparison && (
              <div
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold ${
                  isUp
                    ? 'bg-[#1F3A2A] text-[#7FCB9C]'
                    : 'bg-[#3A1F1F] text-[#E88A8A]'
                }`}
              >
                <span>{isUp ? '▲' : '▼'}</span>
                <span>
                  {Math.abs(percentChange!)}% {isUp ? 'أعلى' : 'أقل'} من الشهر
                  الماضي
                </span>
              </div>
            )}
          </div>
          {!hasComparison && (
            <p className="mt-2 text-xs text-[#8A8074]">
              لا توجد بيانات كافية من الشهر الماضي للمقارنة بعد
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* أفضل الأصناف مبيعاً */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#E3A857]">
              أفضل 5 أصناف مبيعاً
            </h2>
            {!topItems || topItems.length === 0 ? (
              <div className="rounded-2xl border border-[#2A241F] bg-[#1D1815] p-6 text-center text-[#B8ADA0]">
                لا توجد بيانات مبيعات بعد
              </div>
            ) : (
              <div className="space-y-2">
                {topItems.map(
                  (
                    item: { id: string; name: string; total_quantity: number },
                    index: number
                  ) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-[#2A241F] bg-[#1D1815] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2A241F] text-xs font-bold text-[#E3A857]">
                          {index + 1}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <span className="text-sm text-[#B8ADA0]">
                        {item.total_quantity} قطعة
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* الطلبات قيد التحضير */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#E3A857]">
              الطلبات قيد التحضير الآن
            </h2>
            {!preparingOrders || preparingOrders.length === 0 ? (
              <div className="rounded-2xl border border-[#2A241F] bg-[#1D1815] p-6 text-center text-[#B8ADA0]">
                لا توجد طلبات قيد التحضير حالياً
              </div>
            ) : (
              <div className="space-y-2">
                {preparingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-[#2A241F] bg-[#1D1815] p-3"
                  >
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">
                        {order.order_type === 'dine_in'
                          ? `طاولة ${order.table_number}`
                          : order.customer_name}
                      </span>
                      <span className="text-[#8A8074]">
                        {new Date(order.created_at).toLocaleTimeString(
                          'ar-SY',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-[#B8ADA0]">
                      {order.order_items
                        .map(
                          (i: {
                            item_name_snapshot: string;
                            quantity: number;
                          }) => `${i.item_name_snapshot} ×${i.quantity}`
                        )
                        .join('، ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#2A241F] bg-[#1D1815] p-4 text-center">
      <p className="text-xs text-[#8A8074]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#E3A857]">{value}</p>
    </div>
  );
}
