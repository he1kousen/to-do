'use client';

import {
  LayoutDashboard,
  CheckSquare,
  Lightbulb,
  Calendar,
  StickyNote,
  DollarSign,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import UserProfile from './UserProfile';

export type ModuleId = 'dashboard' | 'tasks' | 'ideas' | 'calendar';

interface ModuleRailProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
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
  isExpanded,
  onToggleExpand,
  taskCount,
  ideaCount,
}: ModuleRailProps) {
  return (
    <nav
      className={`flex h-full flex-col bg-graphite py-3 transition-[width] duration-200 ${
        isExpanded ? 'w-48' : 'w-14 md:w-16'
      }`}
    >
      {/* Logo + Toggle */}
      <div className={`mb-4 flex items-center px-3 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-signal-teal">
          <CheckSquare className="h-4 w-4 text-white" strokeWidth={2} />
        </div>
        {isExpanded && (
          <button
            onClick={onToggleExpand}
            className="flex h-7 w-7 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-white/10 hover:text-cloud"
            title="Kecilkan sidebar"
          >
            <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Module buttons */}
      <div className="flex flex-1 flex-col gap-0.5 px-2">
        {modules.map((mod) => {
          const isActive = activeModule === mod.id;
          const Icon = mod.icon;

          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              title={!isExpanded ? mod.label : undefined}
              className={`group relative flex items-center gap-3 rounded-sm transition-colors ${
                isExpanded ? 'h-9 px-3' : 'h-10 w-10 justify-center self-center'
              } ${
                isActive
                  ? 'bg-signal-teal/15 text-signal-teal'
                  : 'text-[#8B929A] hover:bg-white/5 hover:text-cloud'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />

              {isExpanded && (
                <span className={`truncate text-body-sm font-medium ${isActive ? 'text-signal-teal' : 'text-[#8B929A]'}`}>
                  {mod.label}
                </span>
              )}

              {/* Active indicator bar */}
              {isActive && !isExpanded && (
                <div className="absolute -left-2 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-signal-teal" />
              )}

              {/* Notification dot for Dashboard (placeholder) */}
              {mod.id === 'dashboard' && !isExpanded && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-marigold" />
              )}

              {/* Count badge for Tasks */}
              {mod.id === 'tasks' && taskCount !== undefined && taskCount > 0 && (
                <span className={`${isExpanded ? 'ml-auto' : 'absolute -right-1 -top-1'} flex h-4 min-w-4 items-center justify-center rounded-full bg-marigold px-1 text-[10px] font-medium text-white`}>
                  {taskCount > 99 ? '99+' : taskCount}
                </span>
              )}

              {/* Count badge for Ideas */}
              {mod.id === 'ideas' && ideaCount !== undefined && ideaCount > 0 && (
                <span className={`${isExpanded ? 'ml-auto' : 'absolute -right-1 -top-1'} flex h-4 min-w-4 items-center justify-center rounded-full bg-marigold px-1 text-[10px] font-medium text-white`}>
                  {ideaCount > 99 ? '99+' : ideaCount}
                </span>
              )}

              {/* Tooltip (only when collapsed) */}
              {!isExpanded && (
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-sm bg-graphite px-2 py-1 text-xs text-cloud opacity-0 shadow-float transition-opacity group-hover:opacity-100">
                  {mod.label}
                </span>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className={`my-2 h-px bg-white/10 ${isExpanded ? 'mx-3' : 'mx-auto w-6'}`} />

        {/* Coming soon modules */}
        {comingSoon.map((mod) => {
          const Icon = mod.icon;

          return (
            <div
              key={mod.label}
              title={!isExpanded ? `${mod.label} — Segera Hadir` : undefined}
              className={`group relative flex cursor-not-allowed items-center rounded-sm text-[#555B63] ${
                isExpanded ? 'h-9 px-3' : 'h-10 w-10 justify-center self-center'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />

              {isExpanded && (
                <span className="ml-3 truncate text-body-sm font-medium text-[#555B63]">
                  {mod.label}
                </span>
              )}

              {/* "Segera Hadir" badge */}
              {!isExpanded && (
                <span className="absolute -right-1 -top-1 rounded-full bg-[#555B63] px-1 py-0.5 text-[8px] font-medium leading-none text-[#8B929A]">
                  Soon
                </span>
              )}

              {/* Tooltip (only when collapsed) */}
              {!isExpanded && (
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-sm bg-graphite px-2 py-1 text-xs text-cloud opacity-0 shadow-float transition-opacity group-hover:opacity-100">
                  {mod.label} — Segera Hadir
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Expand button (only when collapsed) */}
      {!isExpanded && (
        <div className="px-2">
          <button
            onClick={onToggleExpand}
            className="flex h-9 w-10 items-center justify-center self-center rounded-sm text-[#8B929A] transition-colors hover:bg-white/10 hover:text-cloud"
            title="Perluas sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* User profile */}
      <UserProfile isExpanded={isExpanded} />
    </nav>
  );
}
