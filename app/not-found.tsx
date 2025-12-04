'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from './components/ui/Button';
import { Card, CardContent } from './components/ui/Card';

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          {/* 404 Large Number */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-accent-primary opacity-20 mb-4">
              404
            </h1>
            <h2 className="text-3xl font-bold text-text-primary -mt-8">
              Page Not Found
            </h2>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-text-secondary text-lg mb-4">
              Oops! The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <p className="text-text-tertiary">
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="h-5 w-5" />
                Go to Homepage
              </Link>
            </Button>

            <Button
              variant="secondary"
              onClick={handleGoBack}
              className="w-full gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </Button>

            {/* Search suggestion */}
            <div className="pt-4 border-t border-border-primary">
              <p className="text-text-tertiary text-sm mb-2">
                Looking for something specific?
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-accent-primary hover:text-accent-secondary text-sm transition-colors"
              >
                <Search className="h-4 w-4" />
                Browse Homepage
              </Link>
            </div>
          </div>

          {/* Help text */}
          <div className="mt-8 pt-6 border-t border-border-primary">
            <p className="text-text-tertiary text-sm">
              Visit our homepage to explore all available features including
              forms, API demos, and more.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
