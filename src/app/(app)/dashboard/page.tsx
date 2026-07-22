'use client';

import EmptyState from '@/components/EmptyState';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  return (
    <EmptyState
      icon={LayoutDashboard}
      title="Dashboard"
      description="Ringkasan dari semua module akan tersedia segera."
    />
  );
}
