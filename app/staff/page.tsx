import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StaffManager } from './StaffManager';

export default async function StaffPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (myProfile?.role !== 'manager') {
    redirect('/');
  }

  const { data: staff } = await supabase
    .from('profiles')
    .select('id, full_name, is_active, created_at')
    .eq('role', 'waiter_cashier')
    .order('created_at', { ascending: false });

  return <StaffManager initialStaff={staff ?? []} />;
}
