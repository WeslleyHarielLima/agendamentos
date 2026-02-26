import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

import { Sidebar } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/ui/theme/theme-provider';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <div className="flex min-h-screen bg-background-primary">
            <Sidebar />
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
