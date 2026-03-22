import { NavLink, useLocation } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings,
  LogOut,
  Command
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Claims', to: '/claims', icon: FileText },
  { name: 'Entities', to: '/entities', icon: Building2 },
  { name: 'Team', to: '/team', icon: Users },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-[#fbfbfb] text-zinc-600 min-h-screen border-r border-zinc-200/60 transition-all duration-300 ease-in-out">
      <div className="h-16 flex items-center px-6 mt-2 mb-4">
        <div className="flex items-center gap-2.5 text-black">
          <div className="bg-black text-white p-1 rounded-lg shadow-sm">
            <Command className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900">Pettybox</span>
        </div>
      </div>

      <div className="flex-1 px-4 flex flex-col gap-0.5 overflow-y-auto">
        <div className="mb-4 px-2">
          <p className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Menu</p>
        </div>

        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className="relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium outline-none transition-colors group"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white shadow-sm border border-zinc-200/50 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <div className={cn(
                "relative z-10 flex items-center gap-3 transition-colors",
                isActive ? "text-black" : "text-zinc-500 group-hover:text-black"
              )}>
                <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0 transition-colors", isActive ? "text-black" : "text-zinc-400 group-hover:text-zinc-700")} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </div>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4">
        <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors duration-200 group">
          <LogOut className="w-[18px] h-[18px] text-zinc-400 group-hover:text-black transition-colors" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
