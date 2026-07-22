'use client';

import { type LucideIcon, CheckSquare } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon = CheckSquare, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <Icon className="mb-4 h-12 w-12 text-[#C4C9CE]" strokeWidth={1.5} />
      <h3 className="mb-2 text-display-sm text-graphite">{title}</h3>
      <p className="mb-6 max-w-sm text-center text-body-md text-[#6B7280]">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-sm bg-signal-teal px-4 py-2 text-body-md font-medium text-white transition-colors hover:bg-signal-teal-hover"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
