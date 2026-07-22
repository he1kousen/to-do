'use client';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <span className="mb-4 text-5xl">{icon}</span>
      <h3 className="mb-2 text-lg font-semibold text-slate-700">{title}</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-slate-500">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
