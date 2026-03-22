import { useEffect, useMemo, useState } from 'react';
import { Download, Lock, UserPlus, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import * as xlsx from 'xlsx';
import { toast } from 'sonner';
import { addTeam, getEntities, getSettings, getTeams } from '../lib/mockData';
import type { LegalEntity, Team } from '../lib/mockData';
import { Button } from '../components/ui/Button';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

interface TeamFormState {
  name: string;
  legal_entity_id: string;
  manager: string;
  member_count: string;
}

const emptyForm: TeamFormState = {
  name: '',
  legal_entity_id: '',
  manager: '',
  member_count: '1',
};

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [entities, setEntities] = useState<Record<string, LegalEntity>>({});
  const [workspaceName, setWorkspaceName] = useState('PettyBox Finance');
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<TeamFormState>(emptyForm);

  const loadData = async () => {
    const [teamsData, entitiesData, settings] = await Promise.all([getTeams(), getEntities(), getSettings()]);
    setTeams(teamsData);
    setWorkspaceName(settings.workspaceName);
    const entityMap = entitiesData.reduce<Record<string, LegalEntity>>((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    setEntities(entityMap);
    setForm((current) => ({
      ...current,
      legal_entity_id: current.legal_entity_id || entitiesData[0]?.id || '',
    }));
  };

  useEffect(() => {
    void Promise.all([getTeams(), getEntities(), getSettings()]).then(([teamsData, entitiesData, settings]) => {
      setTeams(teamsData);
      setWorkspaceName(settings.workspaceName);
      const entityMap = entitiesData.reduce<Record<string, LegalEntity>>((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {});
      setEntities(entityMap);
      setForm((current) => ({
        ...current,
        legal_entity_id: current.legal_entity_id || entitiesData[0]?.id || '',
      }));
    });
  }, []);

  const filteredTeams = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return teams;
    }

    return teams.filter((team) =>
      [team.name, team.manager, entities[team.legal_entity_id]?.name || '', team.id].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [entities, query, teams]);

  const exportData = () => {
    const ws = xlsx.utils.json_to_sheet(
      filteredTeams.map((team) => ({
        ID: team.id,
        'Team Name': team.name,
        Manager: team.manager,
        Members: team.member_count,
        'Legal Entity': entities[team.legal_entity_id]?.name || team.legal_entity_id,
      })),
    );
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Teams');
    xlsx.writeFile(wb, 'pettybox_teams.xlsx');
  };

  const handleAddTeam = async () => {
    if (!form.name || !form.legal_entity_id || !form.manager) {
      toast.error('Team name, manager, and entity are required.');
      return;
    }

    await addTeam({
      name: form.name,
      legal_entity_id: form.legal_entity_id,
      manager: form.manager,
      member_count: Number(form.member_count) || 1,
    });

    await loadData();
    setForm((current) => ({ ...emptyForm, legal_entity_id: current.legal_entity_id || emptyForm.legal_entity_id }));
    setIsAdding(false);
    toast.success('Team added to the directory.');
  };

  const firstEntityName = Object.values(entities)[0]?.name || 'your assigned entity';

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={itemVariants} className="flex justify-between items-end pb-4 border-b border-zinc-200/60">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900 leading-tight">Team Directory</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Manage managers, team scopes, and workspace ownership</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={exportData}>
            <Download className="w-3.5 h-3.5 mr-2" /> Export Directory
          </Button>
          <Button onClick={() => setIsAdding((current) => !current)}>
            <UserPlus className="w-4 h-4 mr-2" /> {isAdding ? 'Close' : 'Add Team'}
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card p-4">
        <input className="input-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search teams by name, manager, or entity" />
      </motion.div>

      {isAdding && (
        <motion.div variants={itemVariants} className="card p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="input-field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Team name" />
          <select className="input-field" value={form.legal_entity_id} onChange={(event) => setForm({ ...form, legal_entity_id: event.target.value })}>
            {Object.values(entities).map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
          <input className="input-field" value={form.manager} onChange={(event) => setForm({ ...form, manager: event.target.value })} placeholder="Manager name" />
          <div className="flex gap-3">
            <input className="input-field" value={form.member_count} type="number" min="1" onChange={(event) => setForm({ ...form, member_count: event.target.value })} placeholder="Members" />
            <Button onClick={() => void handleAddTeam()}>Save</Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card">
          <div className="px-5 py-4 border-b border-zinc-200/60 flex justify-between items-center bg-[#fafafa]">
            <h2 className="text-[13px] font-bold tracking-wide text-zinc-900 flex items-center gap-2 uppercase">
              <Users className="w-4 h-4 text-zinc-400" />
              Active Teams
            </h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {filteredTeams.map((team) => (
              <div key={team.id} className="p-5 hover:bg-zinc-50 transition-colors group">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-zinc-900 tracking-tight">{team.name}</h3>
                    <p className="text-[12px] text-zinc-500 mt-0.5 font-medium">
                      Manager: <span className="text-zinc-700 font-semibold">{team.manager}</span>
                    </p>
                    <p className="text-[12px] text-zinc-500 mt-0.5 font-medium">
                      Bound to: <span className="text-zinc-700 font-semibold">{entities[team.legal_entity_id]?.name || 'Unknown'}</span> • {team.member_count} member(s)
                    </p>
                  </div>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">{team.id}</span>
                </div>
              </div>
            ))}
            {filteredTeams.length === 0 && <div className="p-6 text-[13px] text-zinc-400 text-center">No teams matched the current search.</div>}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="card p-6 bg-zinc-900 border-none relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-[15px] font-bold text-white mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-400" /> Local Workspace Scope Active
              </h2>
              <p className="text-[13px] text-zinc-400 mb-5 leading-relaxed">
                This directory now persists locally in the browser for <span className="text-white font-bold">{workspaceName}</span>. Team visibility is currently centered around <span className="text-white font-bold">{firstEntityName}</span>.
              </p>
              <div className="inline-flex items-center px-2 py-1 bg-white/10 text-white rounded border border-white/10 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                Persistent Mode
              </div>
            </div>
            <div className="absolute -right-16 -bottom-16 w-48 h-48 border border-white/5 rounded-full opacity-50 pointer-events-none"></div>
            <div className="absolute right-8 bottom-8 w-24 h-24 border border-white/10 rounded-full opacity-50 pointer-events-none"></div>
          </div>

          <div className="card">
            <div className="px-5 py-3 border-b border-zinc-200/60 bg-[#fafafa]">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Workspace Notes</h3>
            </div>
            <div className="p-4 space-y-4 text-[13px] text-zinc-600">
              <p>Teams added here become available immediately in the claim submission form.</p>
              <p>Exports reflect the current filtered directory, which makes it easier to hand off scoped team lists.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
