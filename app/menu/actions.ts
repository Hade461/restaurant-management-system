'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type MenuActionState = {
  error: string | null;
  success: boolean;
};

async function requireManager() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: 'يجب تسجيل الدخول أولاً' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'manager') {
    return { supabase, error: 'هذا الإجراء متاح للمدير فقط' };
  }

  return { supabase, error: null };
}

export async function createMenuItem(input: {
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
}): Promise<MenuActionState> {
  const { supabase, error: authError } = await requireManager();
  if (authError) return { error: authError, success: false };

  if (!input.name.trim()) {
    return { error: 'اسم الصنف مطلوب', success: false };
  }
  if (!Number.isInteger(input.price) || input.price < 0) {
    return { error: 'السعر يجب أن يكون رقماً صحيحاً غير سالب', success: false };
  }
  const validCategories = ['appetizers', 'main_dishes', 'drinks', 'desserts'];
  if (!validCategories.includes(input.category)) {
    return { error: 'التصنيف غير صالح', success: false };
  }

  const { error } = await supabase.from('menu_items').insert({
    name: input.name.trim(),
    description: input.description.trim() || null,
    price: input.price,
    category: input.category,
    image_url: input.image_url,
  });

  if (error) {
    return { error: 'حدث خطأ أثناء إضافة الصنف', success: false };
  }

  revalidatePath('/menu');
  return { error: null, success: true };
}

export async function updateMenuItem(
  id: string,
  input: {
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string | null;
  }
): Promise<MenuActionState> {
  const { supabase, error: authError } = await requireManager();
  if (authError) return { error: authError, success: false };

  if (!input.name.trim()) {
    return { error: 'اسم الصنف مطلوب', success: false };
  }
  if (!Number.isInteger(input.price) || input.price < 0) {
    return { error: 'السعر يجب أن يكون رقماً صحيحاً غير سالب', success: false };
  }

  const { error } = await supabase
    .from('menu_items')
    .update({
      name: input.name.trim(),
      description: input.description.trim() || null,
      price: input.price,
      category: input.category,
      image_url: input.image_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { error: 'حدث خطأ أثناء تعديل الصنف', success: false };
  }

  revalidatePath('/menu');
  return { error: null, success: true };
}

export async function setAvailability(
  id: string,
  isAvailable: boolean
): Promise<MenuActionState> {
  const { supabase, error: authError } = await requireManager();
  if (authError) return { error: authError, success: false };

  const { error } = await supabase
    .from('menu_items')
    .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { error: 'حدث خطأ أثناء تحديث حالة التوفر', success: false };
  }

  revalidatePath('/menu');
  return { error: null, success: true };
}

export async function deleteMenuItem(id: string): Promise<MenuActionState> {
  const { supabase, error: authError } = await requireManager();
  if (authError) return { error: authError, success: false };

  // حذف ناعم (soft delete) للحفاظ على سجل الطلبات التاريخية
  const { error } = await supabase
    .from('menu_items')
    .update({
      is_deleted: true,
      is_available: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { error: 'حدث خطأ أثناء حذف الصنف', success: false };
  }

  revalidatePath('/menu');
  return { error: null, success: true };
}
