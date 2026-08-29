'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// لا يعرض أي شيء بنفسه — فقط يستمع لتغييرات الطلبات ويحدّث الصفحة
// تلقائياً (بدون أي بيانات حساسة تُعرض من الحدث نفسه، فقط إشارة لإعادة الجلب)
export function RealtimeOrdersRefresher() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
