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
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <ToastContainer />
                <ModalContainer />
              </div>
            </ModalProvider>
          </ToastProvider>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // OAuth redirect handler
              (function() {
                console.log('OAuth redirect script loaded');
                const hash = window.location.hash;
                console.log('Current hash:', hash);
                
                if (hash.includes('access_token')) {
                  console.log('Access token found, redirecting to dashboard...');
                  setTimeout(() => {
                    window.location.href = '/dashboard';
                  }, 1000);
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
