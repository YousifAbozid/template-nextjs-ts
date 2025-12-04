'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/network/QueryClient';
import { ThemeProvider } from './ThemeProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from './ToastContext';
import ToastContainer from '@/components/ui/ToastContainer';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
          <ErrorBoundary>{children}</ErrorBoundary>
          <ToastContainer />
        </ThemeProvider>
      </QueryClientProvider>
    </ToastProvider>
  );
}
