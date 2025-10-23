import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ModalProvider } from '@/contexts/ModalContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ToastContainer';
import { ModalContainer } from '@/components/ModalContainer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Jobs Tracker - Organiza tu búsqueda laboral',
  description: 'Centraliza oportunidades, versiones de CV y tu avance—todo en un solo lugar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <ModalProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 relative">
                  {children}
                </main>
                <Footer />
                <ToastContainer />
                <ModalContainer />
                <div id="global-loading" className="fixed inset-0 bg-white z-50 flex items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              </div>
            </ModalProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
