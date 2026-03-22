import { useEffect, useState } from 'react';
import { getTeams, getEntities } from '../lib/mockData';
import type { Team, LegalEntity } from '../lib/mockData';
import { Users, Download, UserPlus, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import * as xlsx from 'xlsx';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [entities, setEntities] = useState<Record<string, LegalEntity>>({});

  useEffect(() => {
    Promise.all([getTeams(), getEntities()]).then(([teamsData, entitiesData]) => {
      setTeams(teamsData);
      const entityMap = entitiesData.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {} as Record<string, LegalEntity>);
      setEntities(entityMap);
    });
  }, []);

  const exportData = () => {
    const ws = xlsx.utils.json_to_sheet(teams.map(t => ({
      ID: t.id,
      'Team Name': t.name,
      'Legal Entity': entities[t.legal_entity_id]?.name || t.legal_entity_id
    })));
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Teams");
    xlsx.writeFile(wb, "pettybox_teams.xlsx");
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={itemVariants} className="flex justify-between items-end pb-4 border-b border-zinc-200/60">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900 leading-tight">Team Directory</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Manage workspace users and global RLS boundaries</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={exportData}><Download className="w-3.5 h-3.5 mr-2" /> Export Directory</Button>
          <Button><UserPlus className="w-4 h-4 mr-2" /> Invite Member</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card">
          <div className="px-5 py-4 border-b border-zinc-200/60 flex justify-between items-center bg-[#fafafa]">
            <h2 className="text-[13px] font-bold tracking-wide text-zinc-900 flex items-center gap-2 uppercase">
              <Users className="w-4 h-4 text-zinc-400" />
              Active Teams
            </h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {teams.map(team => (
              <div key={team.id} className="p-5 hover:bg-zinc-50 transition-colors group">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-[15px] font-bold text-zinc-900 tracking-tight">{team.name}</h3>
                    <p className="text-[12px] text-zinc-500 mt-0.5 font-medium">Bound to: <span className="text-zinc-700 font-semibold">{entities[team.legal_entity_id]?.name || 'Unknown'}</span></p>
                  </div>
                  <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Manage</Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="card p-6 bg-zinc-900 border-none relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-[15px] font-bold text-white mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-400" /> Row-Level Security Active
              </h2>
              <p className="text-[13px] text-zinc-400 mb-5 leading-relaxed text-balance">
                Your current session scope is restricted. You can only view claims and directory data associated with <span className="text-white font-bold">{entities['le-1']?.name || 'your assigned Entity'}</span>.
              </p>
              <div className="inline-flex items-center px-2 py-1 bg-white/10 text-white rounded border border-white/10 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                Enforced Mode
              </div>
            </div>
            {/* Minimal brutalist decorative shape */}
            <div className="absolute -right-16 -bottom-16 w-48 h-48 border border-white/5 rounded-full opacity-50 pointer-events-none"></div>
            <div className="absolute right-8 bottom-8 w-24 h-24 border border-white/10 rounded-full opacity-50 pointer-events-none"></div>
          </div>
          
          <div className="card">
             <div className="px-5 py-3 border-b border-zinc-200/60 bg-[#fafafa]">
               <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Workspace Settings</h3>
             </div>
             <div className="p-2 space-y-1">
               <button className="w-full text-left px-3 py-3 rounded-lg hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-200 group">
                 <p className="font-bold text-zinc-900 text-[13px] group-hover:translate-x-1 transition-transform">Configure Roles</p>
                 <p className="text-[12px] text-zinc-500 mt-0.5 font-medium group-hover:translate-x-1 transition-transform">Define permissions for manager scopes</p>
               </button>
               <button className="w-full text-left px-3 py-3 rounded-lg hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-200 group">
                 <p className="font-bold text-zinc-900 text-[13px] group-hover:translate-x-1 transition-transform">Bulk Import Roster</p>
                 <p className="text-[12px] text-zinc-500 mt-0.5 font-medium group-hover:translate-x-1 transition-transform">Upload CSV to provision multiple accounts</p>
               </button>
             </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
