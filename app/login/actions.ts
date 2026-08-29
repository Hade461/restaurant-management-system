'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type LoginState = {
  error: string | null;
};

export async function signIn(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email');
  const password = formData.get('password');

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email ||
    !password
  ) {
    return { error: 'الرجاء تعبئة البريد الإلكتروني وكلمة المرور' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
  }

  // تحقق إضافي: الحساب المعطّل من المدير ما إله حق دخول حتى لو كلمة المرور صحيحة
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_active')
    .eq('id', data.user.id)
    .single();

  if (profile && profile.is_active === false) {
    await supabase.auth.signOut();
    return { error: 'هذا الحساب معطّل، الرجاء التواصل مع المدير' };
  }

  redirect('/');
}
