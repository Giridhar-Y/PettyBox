import { useEffect, useState } from 'react';
import { getEntities } from '../lib/mockData';
import type { LegalEntity } from '../lib/mockData';
import { Building2, Settings2, Download, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import * as xlsx from 'xlsx';
import { motion } from 'framer-motion';

export default function Entities() {
  const [entities, setEntities] = useState<LegalEntity[]>([]);

  useEffect(() => {
    getEntities().then(setEntities);
  }, []);

  const exportData = () => {
    const ws = xlsx.utils.json_to_sheet(entities);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Entities");
    xlsx.writeFile(wb, "legal_entities.xlsx");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end pb-4 border-b border-zinc-200/60">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900 leading-tight">Legal Entities Overview</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Manage D365 DataAreaIds and Entity configurations</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={exportData}><Download className="w-3.5 h-3.5 mr-2" /> Export CSV</Button>
          <Button><Plus className="w-4 h-4 mr-2" /> Add Entity</Button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] border-b border-zinc-200/60">
                <th className="px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Entity ID</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Entity Name</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">DataAreaId</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {entities.map(entity => (
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
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="text-zinc-400 hover:text-black transition-colors p-1.5 rounded-md hover:bg-zinc-100">
                      <Settings2 className="w-[18px] h-[18px]" />
                    </button>
                  </td>
                </tr>
              ))}
              {entities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[13px] font-medium text-zinc-400">
                    No legal entities configured in this workspace.
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
