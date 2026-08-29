'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export type StaffActionState = {
  error: string | null;
  success: boolean;
};

// يتحقق من طرف السيرفر أن الطالب فعلاً مدير — لا يعتمد على إخفاء الزر بالواجهة فقط
async function requireManager() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'يجب تسجيل الدخول أولاً' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'manager') {
    return { error: 'هذا الإجراء متاح للمدير فقط' };
  }

  return { error: null };
}

export async function createStaffAccount(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<StaffActionState> {
  const { error: authError } = await requireManager();
  if (authError) return { error: authError, success: false };

  if (!input.fullName.trim()) {
    return { error: 'الاسم مطلوب', success: false };
  }
  if (!input.email.trim() || !input.email.includes('@')) {
    return { error: 'البريد الإلكتروني غير صالح', success: false };
  }
  if (input.password.length < 6) {
    return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', success: false };
  }

  const admin = createAdminClient();

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: input.email.trim(),
      password: input.password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    return {
      error: 'تعذّر إنشاء الحساب (ربما البريد مستخدم مسبقاً)',
      success: false,
    };
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    full_name: input.fullName.trim(),
    role: 'waiter_cashier',
    is_active: true,
  });

  if (profileError) {
    return { error: 'تم إنشاء الحساب لكن فشل ربطه بالنظام', success: false };
  }

  revalidatePath('/staff');
  return { error: null, success: true };
}

export async function resetStaffPassword(
  userId: string,
  newPassword: string
): Promise<StaffActionState> {
  const { error: authError } = await requireManager();
  if (authError) return { error: authError, success: false };

  if (newPassword.length < 6) {
    return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', success: false };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    return { error: 'تعذّر تغيير كلمة المرور', success: false };
  }

  return { error: null, success: true };
}

export async function toggleStaffActive(
  profileId: string,
  isActive: boolean
): Promise<StaffActionState> {
  const { error: authError } = await requireManager();
  if (authError) return { error: authError, success: false };

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', profileId);

  if (error) {
    return { error: 'تعذّر تحديث حالة الحساب', success: false };
  }

  revalidatePath('/staff');
  return { error: null, success: true };
}
