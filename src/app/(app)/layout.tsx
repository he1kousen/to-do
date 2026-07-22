import { Suspense } from 'react';
import AppShell from '@/components/AppShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-(--color-bg)" />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
