import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ThemeProvider } from '@/features/theme/ThemeProvider';
import { SchemeProvider } from '@/features/theme/SchemeProvider';
import { DEFAULT_SCHEME, SCHEMES } from '@/features/theme/scheme.config';
import { fontVariables } from '@/features/theme/font.config';
import './globals.css';

export const metadata: Metadata = {
  title: 'Little Alchemy',
  description: 'Combine elements to discover the world'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieScheme = cookieStore.get('active_scheme')?.value;
  const scheme = SCHEMES.some((s) => s.value === cookieScheme)
    ? cookieScheme!
    : DEFAULT_SCHEME;

  return (
    <html
      lang='en'
      suppressHydrationWarning
      data-theme={scheme}
      className={fontVariables}
    >
      <body className='antialiased'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <SchemeProvider initialScheme={scheme}>{children}</SchemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
