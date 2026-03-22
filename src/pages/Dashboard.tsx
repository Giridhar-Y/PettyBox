import { useEffect, useState } from 'react';
import { getDashboardStats, mockClaims } from '../lib/mockData';
import type { Claim } from '../lib/mockData';
import { format, subDays } from 'date-fns';
import { CheckCircle2, Clock, FileWarning, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const containerParams: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemParams: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [stats, setStats] = useState({ imprestBalance: 0, pendingApprovals: 0, syncedClaims: 0 });
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await getDashboardStats();
      setStats(data);
      setRecentClaims(mockClaims.slice(0, 5));
    }
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status: Claim['status']) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-wide bg-zinc-100 text-zinc-900 border border-zinc-200"><CheckCircle2 className="w-3 h-3 mr-1" /> APPROVED</span>;
      case 'submitted':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-wide bg-zinc-900 text-white"><Clock className="w-3 h-3 mr-1" /> PENDING</span>;
      case 'synced':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-wide bg-emerald-100 text-emerald-900 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> SYNCED</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-wide bg-red-100 text-red-900 border border-red-200"><FileWarning className="w-3 h-3 mr-1" /> REJECTED</span>;
      default:
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-wide bg-zinc-100 text-zinc-800 border border-zinc-200">DRAFT</span>;
    }
  };

  return (
    <motion.div 
      variants={containerParams} 
      initial="hidden" 
      animate="show" 
      className="space-y-6 max-w-6xl mx-auto"
    >
      <motion.div variants={itemParams} className="flex justify-between items-end pb-4 border-b border-zinc-200/60">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900 leading-tight">Financial Command Center</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Overview of petty cash and pending approvals</p>
        </div>
      </motion.div>
      
      <motion.div variants={itemParams} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5 group flex hover:border-black transition-colors cursor-default magic-border hover-float">
          <div className="flex-1">
            <h3 className="text-[12px] font-bold tracking-wider text-zinc-400 uppercase mb-1 drop-shadow-sm">Imprest Balance</h3>
            <p className="mt-2 text-[28px] font-bold tracking-tight text-black">{formatCurrency(stats.imprestBalance)}</p>
          </div>
        </div>
        <div className="card p-5 hover-float">
          <h3 className="text-[12px] font-bold tracking-wider text-zinc-400 uppercase mb-1">Pending Approvals</h3>
          <p className="mt-2 text-[28px] font-bold tracking-tight text-zinc-900">{stats.pendingApprovals}</p>
        </div>
        <div className="card p-5 hover-float">
          <h3 className="text-[12px] font-bold tracking-wider text-zinc-400 uppercase mb-1">D365 Sync Status</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <p className="text-[22px] font-bold tracking-tight text-zinc-900">{stats.syncedClaims} Synced</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemParams} className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4">
        <div className="lg:col-span-2 card">
          <div className="px-5 py-3 border-b border-zinc-200/60 flex justify-between items-center bg-[#fafafa]">
            <h2 className="text-[13px] font-bold tracking-wide text-zinc-900 flex items-center gap-2 uppercase">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              Expense Trend
            </h2>
          </div>
          <div className="p-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { date: format(subDays(new Date(), 6), 'MMM dd'), amount: 120 },
                { date: format(subDays(new Date(), 5), 'MMM dd'), amount: 300 },
                { date: format(subDays(new Date(), 4), 'MMM dd'), amount: 150 },
                { date: format(subDays(new Date(), 3), 'MMM dd'), amount: 480 },
                { date: format(subDays(new Date(), 2), 'MMM dd'), amount: 200 },
                { date: format(subDays(new Date(), 1), 'MMM dd'), amount: 800 },
                { date: format(new Date(), 'MMM dd'), amount: 1450 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 500 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{ stroke: '#e4e4e7', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '13px', fontWeight: 600, color: '#18181b' }}
                  formatter={(value: any) => [`$${value}`, 'Expenses']}
                />
                <Line type="monotone" dataKey="amount" stroke="#18181b" strokeWidth={2} dot={{ r: 3, fill: '#18181b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, fill: '#000' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card flex flex-col">
          <div className="px-5 py-3 border-b border-zinc-200/60 bg-[#fafafa]">
            <h2 className="text-[13px] font-bold tracking-wide text-zinc-900 uppercase">Recent Activity</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-zinc-100">
              {recentClaims.map((claim) => (
                <div key={claim.id} className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between group">
                  <div className="min-w-0 pr-4">
                    <p className="text-[13px] font-semibold text-zinc-900 truncate">{claim.description || 'Petty Cash Claim'}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">{format(new Date(claim.created_at), 'MMM dd, yyyy')} • {claim.voucher_reference || 'No Ref'}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-[14px] font-bold text-black mb-1">{formatCurrency(claim.total_amount)}</p>
                    {getStatusBadge(claim.status)}
                  </div>
                </div>
              ))}
              {recentClaims.length === 0 && (
                <div className="p-8 text-center text-[13px] font-medium text-zinc-400">
                  No recent activity found.
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
