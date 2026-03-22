import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarDays, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { getSettings } from '../../lib/mockData';

export function Header() {
  const [workspaceName, setWorkspaceName] = useState('PettyBox Finance');

  useEffect(() => {
    void getSettings().then((settings) => setWorkspaceName(settings.workspaceName));
  }, []);

  const todayLabel = useMemo(() => format(new Date(), 'EEEE, MMM d'), []);

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/60 bg-[rgba(246,244,238,0.76)] px-4 py-4 backdrop-blur-xl md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2 lg:hidden">
            <span className="section-eyebrow">Workspace</span>
            <span className="text-sm font-semibold text-zinc-900">{workspaceName}</span>
          </div>
          <div className="relative w-full max-w-xl group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-black" />
            <input
              type="text"
              placeholder={`Search across ${workspaceName}...`}
              className="w-full rounded-2xl border border-zinc-200/80 bg-white/85 py-3 pl-11 pr-24 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-[rgba(201,115,66,0.65)] focus:ring-4 focus:ring-[rgba(201,115,66,0.12)]"
            />
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
              <kbd className="hidden rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-400 shadow-sm sm:inline-block">Ctrl K</kbd>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-2xl border border-zinc-200/70 bg-white/75 px-4 py-2.5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Today</p>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <CalendarDays className="h-4 w-4 text-zinc-400" />
              {todayLabel}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="relative rounded-2xl border border-zinc-200/70 bg-white/80 p-3 text-zinc-500 shadow-sm transition-colors hover:text-black"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[color:var(--page-accent)] ring-2 ring-white" />
          </motion.button>

          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white/80 px-3 py-2 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-xs font-semibold text-white">
              JD
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">Jordan Doe</p>
              <p className="text-[12px] text-zinc-500">Finance reviewer</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
