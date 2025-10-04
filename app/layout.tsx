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
                  console.log('Access token found, waiting for Supabase to process...');
                  
                  // Wait for Supabase to process the token and then redirect
                  let attempts = 0;
                  const maxAttempts = 10;
                  
                  const checkAuthAndRedirect = () => {
                    attempts++;
                    console.log('Checking auth state, attempt:', attempts);
                    
                    // Check if we're authenticated by looking for user data in localStorage
                    const supabaseData = localStorage.getItem('sb-vgqkegvsdmildcauvfip-auth-token');
                    
                    if (supabaseData || attempts >= maxAttempts) {
                      console.log('Redirecting to dashboard...');
                      window.location.href = '/dashboard';
                    } else {
                      setTimeout(checkAuthAndRedirect, 500);
                    }
                  };
                  
                  // Start checking after a short delay
                  setTimeout(checkAuthAndRedirect, 1000);
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
