'use client';

import { useTransition } from 'react';
import { updateOrderStatus, updatePaymentStatus } from './actions';

type OrderItem = {
  id: string;
  item_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
};

type Order = {
  id: string;
  order_type: string;
  table_number: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
};

const TYPE_LABELS: Record<string, string> = {
  dine_in: 'محلي',
  takeaway: 'سفري',
  delivery: 'توصيل',
};

const STATUS_LABELS: Record<string, string> = {
  preparing: 'قيد التحضير',
  ready: 'جاهز',
  completed: 'مكتمل',
};

const STATUS_ORDER = ['preparing', 'ready', 'completed'];

function formatSYP(amount: number) {
  return amount.toLocaleString('ar-SY') + ' ل.س';
}

export function OrdersList({ initialOrders }: { initialOrders: Order[] }) {
  const [isPending, startTransition] = useTransition();

  function handleAdvanceStatus(order: Order) {
    const currentIndex = STATUS_ORDER.indexOf(order.status);
    const next = STATUS_ORDER[currentIndex + 1];
    if (!next) return;
    startTransition(async () => {
      await updateOrderStatus(order.id, next);
    });
  }

  function handleTogglePayment(order: Order) {
    const next = order.payment_status === 'paid' ? 'unpaid' : 'paid';
    startTransition(async () => {
      await updatePaymentStatus(order.id, next);
    });
  }

  if (initialOrders.length === 0) {
    return (
      <div className="rounded-2xl border border-[#2A241F] bg-[#1D1815] p-8 text-center text-[#B8ADA0]">
        لا يوجد طلبات بعد. ابدأ بإنشاء أول طلب.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {initialOrders.map((order) => (
        <div
          key={order.id}
          className="rounded-2xl border border-[#2A241F] bg-[#1D1815] p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <div>
              <span className="rounded-lg bg-[#2A241F] px-2 py-1 text-xs font-medium text-[#E3A857]">
                {TYPE_LABELS[order.order_type]}
              </span>
              <span className="mr-2 text-sm text-[#B8ADA0]">
                {order.order_type === 'dine_in'
                  ? `طاولة ${order.table_number}`
                  : order.customer_name}
              </span>
            </div>
            <span className="text-sm text-[#8A8074]">
              {new Date(order.created_at).toLocaleTimeString('ar-SY', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {order.order_type === 'delivery' && (
            <p className="mb-2 text-xs text-[#8A8074]">
              العنوان: {order.delivery_address}
            </p>
          )}
          {order.order_type !== 'dine_in' && (
            <p className="mb-2 text-xs text-[#8A8074]">
              الهاتف: {order.customer_phone}
            </p>
          )}

          <div className="mb-3 space-y-1 border-t border-[#2A241F] pt-2">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm text-[#C9BEB0]"
              >
                <span>
                  {item.item_name_snapshot} × {item.quantity}
                </span>
                <span>{formatSYP(item.line_total)}</span>
              </div>
            ))}
          </div>

          <div className="mb-3 flex justify-between font-semibold">
            <span>المجموع</span>
            <span className="text-[#E3A857]">
              {formatSYP(order.total_amount)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleAdvanceStatus(order)}
              disabled={isPending || order.status === 'completed'}
              className="rounded-lg bg-[#2A241F] px-3 py-1.5 text-xs font-medium text-[#E3A857] disabled:opacity-50"
            >
              {order.status === 'completed'
                ? 'مكتمل ✓'
                : `${STATUS_LABELS[order.status]} ← التالي`}
            </button>

            <button
              onClick={() => handleTogglePayment(order)}
              disabled={isPending}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                order.payment_status === 'paid'
                  ? 'bg-[#1F3A2A] text-[#7FCB9C]'
                  : 'bg-[#3A1F1F] text-[#E88A8A]'
              }`}
            >
              {order.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
