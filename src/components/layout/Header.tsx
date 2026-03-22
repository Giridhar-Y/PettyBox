import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="h-[68px] bg-[#fafafa]/80 backdrop-blur-md border-b flex px-8 py-4 border-zinc-200/60 items-center justify-between sticky top-0 z-10">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 group-focus-within:text-black transition-colors" />
          <input 
            type="text" 
            placeholder="Search across workspace..." 
            className="w-full pl-9 pr-4 py-2 bg-white/50 border border-zinc-200/80 hover:border-zinc-300 hover:bg-white rounded-lg text-sm focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all outline-none text-zinc-900 placeholder:text-zinc-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 bg-white border border-zinc-200 rounded shadow-sm">⌘K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-1.5 text-zinc-400 hover:text-black transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#fafafa]"></span>
        </motion.button>
        
        <div className="h-6 w-px bg-zinc-200 mx-1"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white font-semibold text-xs shadow-sm ring-2 ring-transparent group-hover:ring-zinc-200 transition-all">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
