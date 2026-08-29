'use client';

import { useActionState, useState } from 'react';
import { signIn, type LoginState } from './actions';

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#141110] px-4 py-10"
    >
      {/* توهجان دافئان بالخلفية */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-8%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#E3A857] opacity-[0.14] blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-15%] right-[-10%] h-[380px] w-[380px] rounded-full bg-[#C75D3D] opacity-[0.10] blur-[120px]"
      />

      <div className="relative w-full max-w-sm animate-[card-in_0.5s_ease-out]">
        {/* الشعار */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 animate-[glow-pulse_3s_ease-in-out_infinite] rounded-full bg-[#E3A857] opacity-20 blur-xl"
            />
            <ChickenMascot passwordFocused={isPasswordFocused} />
          </div>
          <h1 className="font-[var(--font-arabic-display)] text-2xl font-bold text-[#F5EFE6]">
            لوحة المطعم
          </h1>
          <p className="mt-1 text-sm text-[#B8ADA0]">
            سجّل الدخول لإدارة المطبخ والطلبات
          </p>
        </div>

        {/* البطاقة */}
        <form
          action={formAction}
          className="rounded-3xl border border-[#2A241F] bg-[#1D1815] p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
        >
          <div className="mb-4">
            <label htmlFor="email" className="mb-1.5 block text-sm text-[#C9BEB0]">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              dir="ltr"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-4 py-3 text-right text-[#F5EFE6] placeholder:text-[#5C5347] outline-none transition focus:border-[#E3A857] focus:ring-2 focus:ring-[#E3A857]/30"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="mb-1.5 block text-sm text-[#C9BEB0]">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                dir="ltr"
                placeholder="••••••••"
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="w-full rounded-xl border border-[#332C25] bg-[#141110] px-4 py-3 pl-11 text-right text-[#F5EFE6] placeholder:text-[#5C5347] outline-none transition focus:border-[#E3A857] focus:ring-2 focus:ring-[#E3A857]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8074] transition hover:text-[#E3A857]"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <label className="mb-5 flex cursor-pointer items-center gap-2 text-sm text-[#B8ADA0]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#332C25] bg-[#141110] accent-[#E3A857]"
            />
            تذكرني
          </label>

          {state.error && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-[#5C2A22] bg-[#2A1714] px-3 py-2 text-sm text-[#F0A78E]"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E3A857] py-3 font-semibold text-[#1D1815] transition active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? (
              <>
                <SpinnerIcon />
                جارِ الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

function ChickenMascot({ passwordFocused }: { passwordFocused: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="relative h-16 w-16" aria-hidden>
      <circle cx="50" cy="55" r="34" fill="#F2C572" />
      <path
        d="M28 40 Q22 22 38 24 Q42 12 52 22 Q62 10 66 26 Q78 24 72 40"
        fill="#E3A857"
      />
      {/* العينان تختفيان بجناح صغير عند التركيز على حقل كلمة المرور */}
      <g
        className="transition-all duration-300 ease-in-out"
        style={{
          opacity: passwordFocused ? 0 : 1,
          transform: passwordFocused ? 'scaleY(0.1)' : 'scaleY(1)',
          transformOrigin: '50px 52px',
        }}
      >
        <circle cx="38" cy="52" r="4.2" fill="#241C15" />
        <circle cx="62" cy="52" r="4.2" fill="#241C15" />
      </g>
      {passwordFocused && (
        <path
          d="M30 52 Q50 44 70 52 Q50 58 30 52 Z"
          fill="#241C15"
          opacity="0.9"
        />
      )}
      <path d="M44 62 Q50 68 56 62 Q50 72 44 62 Z" fill="#D9762E" />
      <circle cx="26" cy="60" r="5" fill="#E8896B" opacity="0.7" />
      <circle cx="74" cy="60" r="5" fill="#E8896B" opacity="0.7" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" />
      <path d="M9.4 5.3A11 11 0 0 1 12 5c7 0 11 7 11 7a13.4 13.4 0 0 1-3.15 3.9M6.1 6.1A13.4 13.4 0 0 0 1 12s4 7 11 7a10.9 10.9 0 0 0 4.4-.9" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
