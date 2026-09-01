'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  createMenuItem,
  updateMenuItem,
  setAvailability,
  deleteMenuItem,
} from './actions';

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
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

type FormState = {
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string | null;
};

const emptyForm: FormState = {
  name: '',
  description: '',
  price: '',
  category: 'main_dishes',
  image_url: null,
};

export function MenuManager({ initialItems }: { initialItems: MenuItem[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(item: MenuItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      category: item.category,
      image_url: item.image_url,
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setFormError(null);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from('menu-images')
      .upload(path, file);

    if (error) {
      setFormError('تعذّر رفع الصورة، حاول مرة أخرى');
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('menu-images').getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const priceNumber = Number(form.price);
    if (!form.name.trim()) {
      setFormError('الرجاء إدخال اسم الصنف');
      return;
    }
    if (!Number.isInteger(priceNumber) || priceNumber < 0) {
      setFormError('الرجاء إدخال سعر صحيح غير سالب');
      return;
    }

    startTransition(async () => {
      const payload = {
        name: form.name,
        description: form.description,
        price: priceNumber,
        category: form.category,
        image_url: form.image_url,
      };

      const result = editingId
        ? await updateMenuItem(editingId, payload)
        : await createMenuItem(payload);

      if (result.error) {
        setFormError(result.error);
        return;
      }

      setIsFormOpen(false);
    });
  }

  function handleToggleAvailability(item: MenuItem) {
    startTransition(async () => {
      await setAvailability(item.id, !item.is_available);
    });
  }

  function handleDelete(item: MenuItem) {
    if (!confirm(`هل أنت متأكد من حذف "${item.name}"؟`)) return;
    startTransition(async () => {
      await deleteMenuItem(item.id);
    });
  }

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: initialItems.filter((i) => i.category === cat),
  }));

  return (
    <main dir="rtl" className="min-h-screen bg-[#141110] px-4 py-8 pt-20 text-[#F5EFE6] md:px-8 md:pt-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">إدارة المنيو</h1>
          <button
            onClick={openAddForm}
            className="rounded-xl bg-[#E3A857] px-4 py-2 font-semibold text-[#1D1815] transition active:scale-[0.98]"
          >
            + إضافة صنف
          </button>
        </div>

        {initialItems.length === 0 ? (
          <div className="rounded-2xl border border-[#2A241F] bg-[#1D1815] p-8 text-center text-[#B8ADA0]">
            لا يوجد أصناف بعد. ابدأ بإضافة أول صنف للمنيو.
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(
              (group) =>
                group.items.length > 0 && (
                  <section key={group.category}>
                    <h2 className="mb-3 text-lg font-semibold text-[#E3A857]">
                      {CATEGORY_LABELS[group.category]}
                    </h2>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-xl border border-[#2A241F] bg-[#1D1815] p-3"
                        >
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-14 w-14 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#2A241F] text-xs text-[#8A8074]">
                              لا صورة
                            </div>
                          )}

                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-[#B8ADA0]">
                              {formatSYP(item.price)}
                            </p>
                          </div>

                          <button
                            onClick={() => handleToggleAvailability(item)}
                            disabled={isPending}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition active:scale-95 ${
                              item.is_available
                                ? 'bg-[#1F3A2A] text-[#7FCB9C]'
                                : 'bg-[#3A1F1F] text-[#E88A8A]'
                            }`}
                          >
                            {item.is_available ? 'متوفر' : 'غير متوفر'}
                          </button>

                          <button
                            onClick={() => openEditForm(item)}
                            className="rounded-lg px-2.5 py-1.5 text-xs text-[#B8ADA0] transition hover:text-[#E3A857]"
                          >
                            تعديل
                          </button>

                          <button
                            onClick={() => handleDelete(item)}
                            disabled={isPending}
                            className="rounded-lg px-2.5 py-1.5 text-xs text-[#E88A8A] transition hover:text-red-400"
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )
            )}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <form
            onSubmit={handleSubmit}
            dir="rtl"
            className="w-full max-w-md rounded-2xl border border-[#2A241F] bg-[#1D1815] p-6"
          >
            <h2 className="mb-4 text-lg font-bold">
              {editingId ? 'تعديل صنف' : 'إضافة صنف جديد'}
            </h2>

            {/* صندوق الصورة — أول عنصر بالنموذج ليكون أوضح للمستخدم */}
            <div className="mb-4 flex justify-center">
              <label
                htmlFor="menu-image-input"
                className="relative flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-dashed border-[#332C25] bg-[#141110] text-center transition hover:border-[#E3A857]"
              >
                {uploading ? (
                  <span className="text-xs text-[#E3A857]">جارِ الرفع...</span>
                ) : form.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.image_url}
                    alt="معاينة الصنف"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8A8074"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <circle cx="9" cy="10" r="2" />
                      <path d="M21 15l-5-4-9 7" />
                    </svg>
                    <span className="px-2 text-[10px] leading-tight text-[#8A8074]">
                      اضغط لإضافة صورة
                    </span>
                  </>
                )}
              </label>
              <input
                id="menu-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-sm text-[#C9BEB0]">
                اسم الصنف
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-3 py-2 text-[#F5EFE6] outline-none focus:border-[#E3A857]"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-sm text-[#C9BEB0]">
                الوصف (اختياري)
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-3 py-2 text-[#F5EFE6] outline-none focus:border-[#E3A857]"
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-[#C9BEB0]">
                  السعر (ل.س)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  dir="ltr"
                  className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-3 py-2 text-right text-[#F5EFE6] outline-none focus:border-[#E3A857]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#C9BEB0]">
                  التصنيف
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-3 py-2 text-[#F5EFE6] outline-none focus:border-[#E3A857]"
                >
                  {CATEGORY_ORDER.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p className="mb-3 rounded-lg border border-[#5C2A22] bg-[#2A1714] px-3 py-2 text-sm text-[#F0A78E]">
                {formError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending || uploading}
                className="flex-1 rounded-xl bg-[#E3A857] py-2.5 font-semibold text-[#1D1815] disabled:opacity-60"
              >
                {isPending ? 'جارِ الحفظ...' : 'حفظ'}
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl border border-[#332C25] px-4 py-2.5 text-[#B8ADA0]"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
