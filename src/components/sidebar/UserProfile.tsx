'use client';

import { useState, useEffect, useRef } from 'react';
import { LogOut, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface UserProfileProps {
  isExpanded: boolean;
}

interface UserInfo {
  name: string;
  email: string;
  avatarUrl: string | null;
}

export default function UserProfile({ isExpanded }: UserProfileProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'User',
          email: data.user.email ?? '',
          avatarUrl: data.user.user_metadata?.avatar_url ?? null,
        });
      }
    });
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative px-2 pb-2" ref={menuRef}>
      {/* Menu popup */}
      {showMenu && (
        <div className={`absolute bottom-full mb-2 rounded-lg border border-cloud bg-white py-1 shadow-modal ${
          isExpanded ? 'left-2 right-2' : 'left-2 w-56'
        }`}>
          <div className="border-b border-cloud px-3 py-2">
            <p className="text-body-sm font-medium text-graphite truncate">{user.name}</p>
            <p className="text-mono-sm text-[#8B929A] truncate">{user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 text-body-sm text-danger transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Keluar
            </button>
          </form>
        </div>
      )}

      {/* Profile button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`flex w-full items-center gap-2 rounded-sm transition-colors hover:bg-white/5 ${
          isExpanded ? 'px-3 py-2' : 'h-10 justify-center'
        }`}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-7 w-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal-teal/20 text-mono-sm font-medium text-signal-teal">
            {initials}
          </div>
        )}

        {isExpanded && (
          <>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-body-sm font-medium text-cloud">{user.name}</p>
            </div>
            <ChevronUp className={`h-4 w-4 text-[#8B929A] transition-transform ${showMenu ? '' : 'rotate-180'}`} strokeWidth={1.5} />
          </>
        )}
      </button>
    </div>
  );
}
