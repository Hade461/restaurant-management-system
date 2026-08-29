import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewOrderForm } from './NewOrderForm';

export default async function NewOrderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: items } = await supabase
    .from('menu_items')
    .select('id, name, price, category')
    .eq('is_available', true)
    .eq('is_deleted', false)
    .order('category')
    .order('name');

  return <NewOrderForm menuItems={items ?? []} />;
}
