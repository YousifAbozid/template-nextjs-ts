import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './context/Providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Next.js Full-Stack Template',
  description:
    '🚀 Production-ready Next.js 15+ full-stack template with TypeScript, MongoDB, Tailwind CSS v4, and comprehensive tooling. Features auto-generated OpenAPI documentation, type-safe API client, React Query integration, dark mode support, custom UI components with Framer Motion, form validation with Zod, and complete developer experience with ESLint, Prettier, and Husky. Perfect for building scalable web applications with modern architecture patterns. ✨',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background-primary text-text-primary`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
