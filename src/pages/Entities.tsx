import { useEffect, useMemo, useState } from 'react';
import { Building2, Download, Plus, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import * as xlsx from 'xlsx';
import { toast } from 'sonner';
import { addEntity, getEntities, updateEntityStatus } from '../lib/mockData';
import type { LegalEntity } from '../lib/mockData';
import { Button } from '../components/ui/Button';

interface EntityFormState {
  name: string;
  d365_data_area_id: string;
  currency: string;
}

const emptyForm: EntityFormState = {
  name: '',
  d365_data_area_id: '',
  currency: 'USD',
};

export default function Entities() {
  const [entities, setEntities] = useState<LegalEntity[]>([]);
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<EntityFormState>(emptyForm);

  const loadEntities = async () => {
    const data = await getEntities();
    setEntities(data);
  };

  useEffect(() => {
    void getEntities().then((data) => setEntities(data));
  }, []);

  const filteredEntities = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return entities;
    }

    return entities.filter((entity) =>
      [entity.name, entity.id, entity.d365_data_area_id, entity.currency, entity.status].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [entities, query]);

  const exportData = () => {
    const ws = xlsx.utils.json_to_sheet(filteredEntities);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Entities');
    xlsx.writeFile(wb, 'legal_entities.xlsx');
  };

  const handleAddEntity = async () => {
    if (!form.name || !form.d365_data_area_id) {
      toast.error('Entity name and DataAreaId are required.');
      return;
    }

    await addEntity({
      name: form.name,
      d365_data_area_id: form.d365_data_area_id.toUpperCase(),
      currency: form.currency.toUpperCase(),
      status: 'active',
    });

    await loadEntities();
    setForm(emptyForm);
    setIsAdding(false);
    toast.success('Entity added to the workspace.');
  };

  const handleToggleStatus = async (entity: LegalEntity) => {
    const nextStatus = entity.status === 'active' ? 'inactive' : 'active';
    await updateEntityStatus(entity.id, nextStatus);
    await loadEntities();
    toast.success(`${entity.name} marked ${nextStatus}.`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end pb-4 border-b border-zinc-200/60">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900 leading-tight">Legal Entities Overview</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Manage DataAreaIds, currencies, and entity status</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={exportData}>
            <Download className="w-3.5 h-3.5 mr-2" /> Export Excel
          </Button>
          <Button onClick={() => setIsAdding((current) => !current)}>
            <Plus className="w-4 h-4 mr-2" /> {isAdding ? 'Close' : 'Add Entity'}
          </Button>
        </div>
      </div>

      <div className="card p-4">
        <input className="input-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search entities by name, code, currency, or status" />
      </div>

      {isAdding && (
        <div className="card p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="input-field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Entity name" />
          <input className="input-field" value={form.d365_data_area_id} onChange={(event) => setForm({ ...form, d365_data_area_id: event.target.value })} placeholder="DataAreaId" />
          <input className="input-field" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} placeholder="Currency" />
          <Button onClick={() => void handleAddEntity()}>Save Entity</Button>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] border-b border-zinc-200/60">
                <th className="px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Entity ID</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Entity Name</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">DataAreaId</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Currency</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredEntities.map((entity) => (
                <tr key={entity.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-5 py-4 text-[13px] font-semibold text-zinc-900">{entity.id}</td>
                  <td className="px-5 py-4 text-[13px] font-medium text-zinc-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-zinc-400 group-hover:text-black transition-colors" />
                      {entity.name}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px] font-mono font-bold text-zinc-600 bg-zinc-100/50 px-2 py-0.5 rounded border border-zinc-200/50">{entity.d365_data_area_id}</span>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-zinc-700 font-medium">{entity.currency}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${entity.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                      {entity.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button type="button" onClick={() => void handleToggleStatus(entity)} className="inline-flex items-center gap-2 text-zinc-400 hover:text-black transition-colors p-1.5 rounded-md hover:bg-zinc-100">
                      <Settings2 className="w-[18px] h-[18px]" />
                      <span className="text-[12px] font-semibold">{entity.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEntities.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[13px] font-medium text-zinc-400">
                    No legal entities matched the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
