import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

import {
  MobileHeader,
  Sidebar,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/ui/theme/theme-provider';
import { getSession } from '@/lib/auth/session';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});
const interTight = Inter({
  variable: '--font-inter-tight',
  subsets: ['latin'],
  weight: ['700'],
});

export const metadata: Metadata = {
  title: 'Agendamentos Clínicos',
  description:
    'Aqui você pode ver todos os pacientes e serviços agendados para hoje',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const isAuthenticated = !!session.usuarioId;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: aplica o tema antes do React hidratar */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.add('light')})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${interTight.variable} antialiased`}>
        <ThemeProvider>
          {isAuthenticated ? (
            <SidebarProvider>
              <MobileHeader />
              <div className="flex min-h-screen bg-background-primary">
                <Sidebar />
                <div className="flex-1 overflow-y-auto max-md:pt-14">
                  {children}
                </div>
              </div>
            </SidebarProvider>
          ) : (
            <div className="min-h-screen bg-background-primary">{children}</div>
          )}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
