import type { Metadata } from 'next';
import { Hind_Siliguri, Inter } from 'next/font/google';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { AppStateProvider } from '@/context/AppStateContext';
import { ToastProvider } from '@/context/ToastContext';
import { LanguageProvider } from '@/i18n/context';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RoktoBondhu BD | Emergency Blood Donation Network Bangladesh',
  description:
    'Unified donor & requester emergency blood network for Bangladesh with 5-tier location search, 90-day medical cooldown, and bilingual BN/EN support.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${hindSiliguri.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <LanguageProvider>
          <ToastProvider>
            <AppStateProvider>
              {children}
              <ToastContainer />
            </AppStateProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
