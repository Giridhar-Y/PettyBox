import { NavLink, useLocation } from 'react-router-dom';
import {
  Building2,
  Command,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard, hint: 'Overview' },
  { name: 'Claims', to: '/claims', icon: FileText, hint: 'Workflow' },
  { name: 'Entities', to: '/entities', icon: Building2, hint: 'Finance map' },
  { name: 'Team', to: '/team', icon: Users, hint: 'People' },
  { name: 'Settings', to: '/settings', icon: Settings, hint: 'Controls' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex lg:w-[292px] lg:flex-col lg:border-r lg:border-zinc-200/60 lg:bg-[rgba(255,255,255,0.46)] lg:backdrop-blur-xl">
      <div className="flex h-full flex-col px-5 py-5">
        <div className="card dashboard-mesh p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-black p-2 text-white shadow-lg shadow-black/10">
              <Command className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">Workspace</p>
              <h1 className="text-xl font-bold tracking-tight text-zinc-950">PettyBox</h1>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-white/70 bg-white/80 p-3">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-[rgba(201,115,66,0.14)] p-2 text-[color:var(--page-accent)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">Local finance workspace</p>
                <p className="mt-1 text-[13px] leading-relaxed text-zinc-600">
                  Claims, teams, and entities stay persisted in this browser so the workspace feels stable during review.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 px-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400">Navigation</p>
        </div>

        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.name}
                to={item.to}
                className="relative block rounded-2xl outline-none transition-colors group"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl border border-[rgba(24,24,27,0.08)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <div className={cn('relative z-10 flex items-center justify-between gap-3 px-4 py-3', isActive ? 'text-black' : 'text-zinc-500 group-hover:text-black')}>
                  <div className="flex items-center gap-3">
                    <item.icon className={cn('h-[18px] w-[18px] transition-colors', isActive ? 'text-black' : 'text-zinc-400 group-hover:text-zinc-700')} strokeWidth={isActive ? 2.4 : 2} />
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-[12px] text-zinc-400">{item.hint}</p>
                    </div>
                  </div>
                  {isActive && <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--page-accent)]" />}
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-6 rounded-[24px] border border-zinc-200/70 bg-white/75 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400">Session</p>
          <p className="mt-2 text-sm font-semibold text-zinc-900">JD is active</p>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
            Review, update, and export workspace data from one place.
          </p>
          <button className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-black">
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
