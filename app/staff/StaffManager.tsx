'use client';

import { useState, useTransition } from 'react';
import {
  createStaffAccount,
  resetStaffPassword,
  toggleStaffActive,
} from './actions';

type Staff = {
  id: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
};

export function StaffManager({ initialStaff }: { initialStaff: Staff[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [resetTargetId, setResetTargetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!addForm.fullName.trim()) {
      setFormError('الرجاء إدخال الاسم');
      return;
    }
    if (!addForm.email.includes('@')) {
      setFormError('الرجاء إدخال بريد إلكتروني صالح');
      return;
    }
    if (addForm.password.length < 6) {
      setFormError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    startTransition(async () => {
      const result = await createStaffAccount(addForm);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      setIsAddOpen(false);
      setAddForm({ fullName: '', email: '', password: '' });
      setSuccessMsg('تم إنشاء الحساب بنجاح');
    });
  }

  function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!resetTargetId) return;

    if (newPassword.length < 6) {
      setFormError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    startTransition(async () => {
      const result = await resetStaffPassword(resetTargetId, newPassword);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      setResetTargetId(null);
      setNewPassword('');
      setSuccessMsg('تم تغيير كلمة المرور بنجاح');
    });
  }

  function handleToggleActive(member: Staff) {
    startTransition(async () => {
      await toggleStaffActive(member.id, !member.is_active);
    });
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#141110] px-4 py-8 text-[#F5EFE6]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">إدارة الموظفين</h1>
          <button
            onClick={() => {
              setIsAddOpen(true);
              setFormError(null);
              setSuccessMsg(null);
            }}
            className="rounded-xl bg-[#E3A857] px-4 py-2 font-semibold text-[#1D1815] transition active:scale-[0.98]"
          >
            + إضافة موظف
          </button>
        </div>

        {successMsg && (
          <p className="mb-4 rounded-lg border border-[#2A4A33] bg-[#16261C] px-3 py-2 text-sm text-[#8FD9A8]">
            {successMsg}
          </p>
        )}

        {initialStaff.length === 0 ? (
          <div className="rounded-2xl border border-[#2A241F] bg-[#1D1815] p-8 text-center text-[#B8ADA0]">
            لا يوجد موظفين بعد. أضف أول حساب نادل/كاشير.
          </div>
        ) : (
          <div className="space-y-2">
            {initialStaff.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-xl border border-[#2A241F] bg-[#1D1815] p-3"
              >
                <div className="flex-1">
                  <p className="font-medium">{member.full_name}</p>
                  <p className="text-xs text-[#8A8074]">نادل / كاشير</p>
                </div>

                <span
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                    member.is_active
                      ? 'bg-[#1F3A2A] text-[#7FCB9C]'
                      : 'bg-[#3A1F1F] text-[#E88A8A]'
                  }`}
                >
                  {member.is_active ? 'مفعّل' : 'معطّل'}
                </span>

                <button
                  onClick={() => {
                    setResetTargetId(member.id);
                    setNewPassword('');
                    setFormError(null);
                    setSuccessMsg(null);
                  }}
                  className="rounded-lg px-2.5 py-1.5 text-xs text-[#B8ADA0] hover:text-[#E3A857]"
                >
                  إعادة تعيين كلمة المرور
                </button>

                <button
                  onClick={() => handleToggleActive(member)}
                  disabled={isPending}
                  className="rounded-lg px-2.5 py-1.5 text-xs text-[#B8ADA0] hover:text-[#E3A857]"
                >
                  {member.is_active ? 'تعطيل' : 'تفعيل'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* نموذج إضافة موظف */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <form
            onSubmit={handleAddSubmit}
            dir="rtl"
            className="w-full max-w-md rounded-2xl border border-[#2A241F] bg-[#1D1815] p-6"
          >
            <h2 className="mb-4 text-lg font-bold">إضافة موظف جديد</h2>

            <div className="mb-3">
              <label className="mb-1 block text-sm text-[#C9BEB0]">
                الاسم الكامل
              </label>
              <input
                value={addForm.fullName}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, fullName: e.target.value }))
                }
                className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-3 py-2 text-[#F5EFE6] outline-none focus:border-[#E3A857]"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-sm text-[#C9BEB0]">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                dir="ltr"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-3 py-2 text-right text-[#F5EFE6] outline-none focus:border-[#E3A857]"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm text-[#C9BEB0]">
                كلمة المرور المبدئية
              </label>
              <input
                type="text"
                dir="ltr"
                value={addForm.password}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, password: e.target.value }))
                }
                className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-3 py-2 text-right text-[#F5EFE6] outline-none focus:border-[#E3A857]"
              />
            </div>

            {formError && (
              <p className="mb-3 rounded-lg border border-[#5C2A22] bg-[#2A1714] px-3 py-2 text-sm text-[#F0A78E]">
                {formError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-xl bg-[#E3A857] py-2.5 font-semibold text-[#1D1815] disabled:opacity-60"
              >
                {isPending ? 'جارِ الإنشاء...' : 'إنشاء الحساب'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl border border-[#332C25] px-4 py-2.5 text-[#B8ADA0]"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* نموذج إعادة تعيين كلمة المرور */}
      {resetTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <form
            onSubmit={handleResetSubmit}
            dir="rtl"
            className="w-full max-w-sm rounded-2xl border border-[#2A241F] bg-[#1D1815] p-6"
          >
            <h2 className="mb-4 text-lg font-bold">إعادة تعيين كلمة المرور</h2>

            <div className="mb-4">
              <label className="mb-1 block text-sm text-[#C9BEB0]">
                كلمة المرور الجديدة
              </label>
              <input
                type="text"
                dir="ltr"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-3 py-2 text-right text-[#F5EFE6] outline-none focus:border-[#E3A857]"
              />
            </div>

            {formError && (
              <p className="mb-3 rounded-lg border border-[#5C2A22] bg-[#2A1714] px-3 py-2 text-sm text-[#F0A78E]">
                {formError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-xl bg-[#E3A857] py-2.5 font-semibold text-[#1D1815] disabled:opacity-60"
              >
                {isPending ? 'جارِ الحفظ...' : 'حفظ'}
              </button>
              <button
                type="button"
                onClick={() => setResetTargetId(null)}
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
