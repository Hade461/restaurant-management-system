'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder } from '../actions';

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  appetizers: 'مقبلات',
  main_dishes: 'أطباق رئيسية',
  drinks: 'مشروبات',
  desserts: 'حلويات',
};

const CATEGORY_ORDER = ['appetizers', 'main_dishes', 'drinks', 'desserts'];

function formatSYP(amount: number) {
  return amount.toLocaleString('ar-SY') + ' ل.س';
}

export function NewOrderForm({ menuItems }: { menuItems: MenuItem[] }) {
  const router = useRouter();
  const [orderType, setOrderType] = useState('dine_in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateQuantity(itemId: string, delta: number) {
    setCart((prev) => {
      const current = prev[itemId] ?? 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev, [itemId]: next };
      if (next === 0) delete updated[itemId];
      return updated;
    });
  }

  const cartEntries = Object.entries(cart);
  const total = cartEntries.reduce((sum, [itemId, qty]) => {
    const item = menuItems.find((m) => m.id === itemId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (orderType === 'dine_in' && !tableNumber.trim()) {
      setError('رقم الطاولة مطلوب');
      return;
    }
    if (
      (orderType === 'takeaway' || orderType === 'delivery') &&
      (!customerName.trim() || !customerPhone.trim())
    ) {
      setError('اسم الزبون ورقم هاتفه مطلوبان');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setError('عنوان التوصيل مطلوب');
      return;
    }
    if (cartEntries.length === 0) {
      setError('أضف صنفاً واحداً على الأقل');
      return;
    }

    startTransition(async () => {
      const result = await createOrder({
        orderType,
        tableNumber,
        customerName,
        customerPhone,
        deliveryAddress,
        items: cartEntries.map(([menuItemId, quantity]) => ({
          menuItemId,
          quantity,
        })),
      });

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: menuItems.filter((i) => i.category === cat),
  }));

  return (
    <main dir="rtl" className="min-h-screen bg-[#141110] px-4 py-8 text-[#F5EFE6]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">طلب جديد</h1>
          <button
            onClick={() => router.push('/orders')}
            className="text-sm text-[#B8ADA0] hover:text-[#E3A857]"
          >
            رجوع للطلبات
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* نوع الطلب */}
          <div className="mb-4 rounded-2xl border border-[#2A241F] bg-[#1D1815] p-4">
            <label className="mb-2 block text-sm text-[#C9BEB0]">
              نوع الطلب
            </label>
            <div className="flex gap-2">
              {[
                { value: 'dine_in', label: 'محلي' },
                { value: 'takeaway', label: 'سفري' },
                { value: 'delivery', label: 'توصيل' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOrderType(opt.value)}
                  className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
                    orderType === opt.value
                      ? 'bg-[#E3A857] text-[#1D1815]'
                      : 'bg-[#141110] text-[#B8ADA0]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {orderType === 'dine_in' && (
              <div className="mt-3">
                <label className="mb-1 block text-sm text-[#C9BEB0]">
                  رقم الطاولة
                </label>
                <input
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-3 py-2 text-[#F5EFE6] outline-none focus:border-[#E3A857]"
                />
              </div>
            )}

            {(orderType === 'takeaway' || orderType === 'delivery') && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-[#C9BEB0]">
                    اسم الزبون
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-3 py-2 text-[#F5EFE6] outline-none focus:border-[#E3A857]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#C9BEB0]">
                    رقم الهاتف
                  </label>
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    dir="ltr"
                    className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-3 py-2 text-right text-[#F5EFE6] outline-none focus:border-[#E3A857]"
                  />
                </div>
              </div>
            )}

            {orderType === 'delivery' && (
              <div className="mt-3">
                <label className="mb-1 block text-sm text-[#C9BEB0]">
                  عنوان التوصيل
                </label>
                <input
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-3 py-2 text-[#F5EFE6] outline-none focus:border-[#E3A857]"
                />
              </div>
            )}
          </div>

          {/* اختيار الأصناف */}
          <div className="mb-4 space-y-4">
            {grouped.map(
              (group) =>
                group.items.length > 0 && (
                  <div key={group.category}>
                    <h2 className="mb-2 text-sm font-semibold text-[#E3A857]">
                      {CATEGORY_LABELS[group.category]}
                    </h2>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-[#2A241F] bg-[#1D1815] p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-[#8A8074]">
                              {formatSYP(item.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="h-7 w-7 rounded-lg bg-[#2A241F] text-[#E3A857]"
                            >
                              −
                            </button>
                            <span className="w-5 text-center">
                              {cart[item.id] ?? 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="h-7 w-7 rounded-lg bg-[#2A241F] text-[#E3A857]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-[#5C2A22] bg-[#2A1714] px-3 py-2 text-sm text-[#F0A78E]">
              {error}
            </p>
          )}

          <div className="sticky bottom-4 rounded-2xl border border-[#2A241F] bg-[#1D1815] p-4">
            <div className="mb-3 flex justify-between font-semibold">
              <span>المجموع</span>
              <span className="text-[#E3A857]">{formatSYP(total)}</span>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-[#E3A857] py-3 font-semibold text-[#1D1815] disabled:opacity-60"
            >
              {isPending ? 'جارِ الإنشاء...' : 'إنشاء الطلب'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
