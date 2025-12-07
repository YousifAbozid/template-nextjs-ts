import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/context/Providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      'http://localhost:3000'
  ),
  title: {
    default: 'Next.js Full-Stack Template',
    template: '%s | Next.js Full-Stack Template'
  },
  description:
    'Production-ready Next.js 16+ full-stack template with TypeScript, MongoDB, Tailwind CSS v4, and comprehensive tooling. Features Zod-based schemas with auto-generated OpenAPI documentation, Orval SDK with React Query hooks, functional architecture with zero decorators, dark mode support, and complete developer experience.',
  keywords: [
    'Next.js',
    'TypeScript',
    'MongoDB',
    'Tailwind CSS',
    'React Query',
    'OpenAPI',
    'Full-Stack',
    'Template',
    'React',
    'Node.js',
    'API',
    'Framer Motion',
    'Dark Mode',
    'Zod',
    'ESLint',
    'Prettier',
    'Orval',
    'Functional Programming'
  ],
  authors: [{ name: 'Yousif Abozid', url: 'https://github.com/YousifAbozid' }],
  creator: 'Yousif Abozid',
  publisher: 'Yousif Abozid',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://github.com/YousifAbozid/template-nextjs-ts',
    siteName: 'Next.js Full-Stack Template',
    title: 'Next.js Full-Stack Template',
    description:
      'Production-ready Next.js 16+ full-stack template with Zod-based schemas, auto-generated OpenAPI documentation, and Orval SDK with React Query hooks.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Next.js Full-Stack Template'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next.js Full-Stack Template',
    description:
      'Production-ready Next.js 16+ full-stack template with Zod-based schemas, auto-generated OpenAPI documentation, and Orval SDK with React Query hooks.',
    images: ['/og-image.png'],
    creator: '@YousifAbozid'
  },
  category: 'technology',
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
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
