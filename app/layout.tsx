import type { Metadata } from 'next';
import { Markazi_Text, IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';

const displayFont = Markazi_Text({
  subsets: ['arabic'],
  weight: ['500', '600', '700'],
  variable: '--font-arabic-display',
});

const bodyFont = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  variable: '--font-arabic-body',
});

export const metadata: Metadata = {
  title: 'نظام إدارة المطعم',
  description: 'نظام إدارة المطعم — القائمة، الطلبات، ولوحة التحكم',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} font-[var(--font-arabic-body)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
