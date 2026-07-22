'use client';

import {
  LayoutDashboard,
  CheckSquare,
  Lightbulb,
  Calendar,
  StickyNote,
  DollarSign,
} from 'lucide-react';

export type ModuleId = 'dashboard' | 'tasks' | 'ideas' | 'calendar';

interface ModuleRailProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  taskCount?: number;
  ideaCount?: number;
}

const modules = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
  { id: 'ideas' as const, label: 'Ideas', icon: Lightbulb },
  { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
];

const comingSoon = [
  { label: 'Notes', icon: StickyNote },
  { label: 'Finance', icon: DollarSign },
];

export default function ModuleRail({
  activeModule,
  onSelectModule,
  taskCount,
  ideaCount,
}: ModuleRailProps) {
  return (
    <nav className="flex h-full w-14 flex-col items-center bg-graphite py-3 md:w-16">
      {/* Logo */}
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-sm bg-signal-teal">
        <CheckSquare className="h-4 w-4 text-white" strokeWidth={2} />
      </div>

      {/* Module buttons */}
      <div className="flex flex-1 flex-col items-center gap-1">
        {modules.map((mod) => {
          const isActive = activeModule === mod.id;
          const Icon = mod.icon;

          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              title={mod.label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-sm transition-colors ${
                isActive
                  ? 'bg-signal-teal/15 text-signal-teal'
                  : 'text-[#8B929A] hover:bg-white/5 hover:text-cloud'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />

              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute -left-1.5 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-signal-teal" />
              )}

              {/* Notification dot for Dashboard (placeholder) */}
              {mod.id === 'dashboard' && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-marigold" />
              )}

              {/* Count badge for Tasks */}
              {mod.id === 'tasks' && taskCount !== undefined && taskCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-marigold px-1 text-[10px] font-medium text-white">
                  {taskCount > 99 ? '99+' : taskCount}
                </span>
              )}

              {/* Count badge for Ideas */}
              {mod.id === 'ideas' && ideaCount !== undefined && ideaCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-marigold px-1 text-[10px] font-medium text-white">
                  {ideaCount > 99 ? '99+' : ideaCount}
                </span>
              )}

              {/* Tooltip */}
              <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-sm bg-graphite px-2 py-1 text-xs text-cloud opacity-0 shadow-float transition-opacity group-hover:opacity-100">
                {mod.label}
              </span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-2 h-px w-6 bg-white/10" />

        {/* Coming soon modules */}
        {comingSoon.map((mod) => {
          const Icon = mod.icon;

          return (
            <div
              key={mod.label}
              title={`${mod.label} — Segera Hadir`}
              className="group relative flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-sm text-[#555B63]"
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />

              {/* "Segera Hadir" badge */}
              <span className="absolute -right-1 -top-1 rounded-full bg-[#555B63] px-1 py-0.5 text-[8px] font-medium leading-none text-[#8B929A]">
                Soon
              </span>

              {/* Tooltip */}
              <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-sm bg-graphite px-2 py-1 text-xs text-cloud opacity-0 shadow-float transition-opacity group-hover:opacity-100">
                {mod.label} — Segera Hadir
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
