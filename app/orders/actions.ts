'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type OrderActionState = {
  error: string | null;
};

export async function createOrder(input: {
  orderType: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: { menuItemId: string; quantity: number }[];
}): Promise<OrderActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'يجب تسجيل الدخول أولاً' };
  }

  if (input.orderType === 'dine_in' && !input.tableNumber.trim()) {
    return { error: 'رقم الطاولة مطلوب للطلبات المحلية' };
  }
  if (
    (input.orderType === 'takeaway' || input.orderType === 'delivery') &&
    (!input.customerName.trim() || !input.customerPhone.trim())
  ) {
    return { error: 'اسم الزبون ورقم هاتفه مطلوبان' };
  }
  if (input.orderType === 'delivery' && !input.deliveryAddress.trim()) {
    return { error: 'عنوان التوصيل مطلوب' };
  }
  if (input.items.length === 0) {
    return { error: 'أضف صنفاً واحداً على الأقل للطلب' };
  }

  const { data: orderId, error } = await supabase.rpc(
    'create_order_with_items',
    {
      p_order_type: input.orderType,
      p_table_number: input.orderType === 'dine_in' ? input.tableNumber.trim() : null,
      p_customer_name:
        input.orderType !== 'dine_in' ? input.customerName.trim() : null,
      p_customer_phone:
        input.orderType !== 'dine_in' ? input.customerPhone.trim() : null,
      p_delivery_address:
        input.orderType === 'delivery' ? input.deliveryAddress.trim() : null,
      p_items: input.items.map((i) => ({
        menu_item_id: i.menuItemId,
        quantity: i.quantity,
      })),
    }
  );

  if (error || !orderId) {
    return { error: 'تعذّر إنشاء الطلب، تأكد من توفر الأصناف المختارة' };
  }

  revalidatePath('/orders');
  redirect('/orders');
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<OrderActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) {
    return { error: 'تعذّر تحديث حالة الطلب' };
  }

  revalidatePath('/orders');
  return { error: null };
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: string
): Promise<OrderActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) {
    return { error: 'تعذّر تحديث حالة الدفع' };
  }

  revalidatePath('/orders');
  return { error: null };
}
