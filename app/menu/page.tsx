import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MenuManager } from './MenuManager';

export default async function MenuPage() {
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

  // فقط المدير يدير المنيو — النادل/الكاشير ما إله وصول لهاي الصفحة
  if (profile?.role !== 'manager') {
    redirect('/');
  }

  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_deleted', false)
    .order('category')
    .order('name');

  return <MenuManager initialItems={items ?? []} />;
}
