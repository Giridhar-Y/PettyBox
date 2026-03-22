import { useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { ArrowRight, CheckCircle2, Clock, FileWarning, TrendingUp, Wallet } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getClaims, getDashboardStats } from '../lib/mockData';
import type { Claim, ClaimStatus } from '../lib/mockData';

const containerParams: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemParams: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
};

const statusStyles: Record<ClaimStatus, string> = {
  approved: 'bg-zinc-100 text-zinc-900 border border-zinc-200',
  draft: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
  rejected: 'bg-red-100 text-red-900 border border-red-200',
  submitted: 'bg-zinc-900 text-white',
  synced: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    imprestBalance: 0,
    pendingApprovals: 0,
    syncedClaims: 0,
    baseCurrency: 'USD',
  });
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);

  useEffect(() => {
    void Promise.all([getDashboardStats(), getClaims()]).then(([nextStats, claims]) => {
      setStats(nextStats);
      setRecentClaims(claims.slice(0, 6));
    });
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: stats.baseCurrency }).format(amount);

  const chartData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = subDays(new Date(), 6 - index);
        const amount = recentClaims
          .filter((claim) => format(new Date(claim.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
          .reduce((sum, claim) => sum + claim.total_amount, 0);

        return {
          date: format(date, 'MMM dd'),
          amount,
        };
      }),
    [recentClaims],
  );

  const approvedClaims = recentClaims.filter((claim) => claim.status === 'approved' || claim.status === 'synced').length;

  return (
    <motion.div variants={containerParams} initial="hidden" animate="show" className="space-y-6">
      <motion.section variants={itemParams} className="card dashboard-mesh p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="section-eyebrow">Finance command center</span>
            <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-zinc-950 md:text-4xl">
              Keep petty cash moving without losing review context.
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-zinc-600">
              The workspace now keeps local progress stable, surfaces what needs attention first, and makes approvals easier to act on.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/claims"
                className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-950/10 transition-transform hover:-translate-y-0.5"
              >
                Review claims
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/85 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-white"
              >
                Adjust workspace
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Available balance</span>
                <Wallet className="h-5 w-5 text-[color:var(--page-accent)]" />
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-950">{formatCurrency(stats.imprestBalance)}</p>
              <p className="mt-2 text-[13px] text-zinc-500">Updated from approved and synced requests in this workspace.</p>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-zinc-950 p-5 text-white shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Attention needed</p>
              <p className="mt-4 text-3xl font-bold tracking-tight">{stats.pendingApprovals}</p>
              <p className="mt-2 text-[13px] text-zinc-400">Claims are waiting for review right now.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={itemParams} className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Pending approvals</p>
          <p className="mt-3 text-[30px] font-bold tracking-tight text-zinc-950">{stats.pendingApprovals}</p>
          <p className="mt-2 text-[13px] text-zinc-500">Focused queue for the next finance pass.</p>
        </div>
        <div className="card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Approved or synced</p>
          <p className="mt-3 text-[30px] font-bold tracking-tight text-zinc-950">{approvedClaims}</p>
          <p className="mt-2 text-[13px] text-zinc-500">Requests already moving through reconciliation.</p>
        </div>
        <div className="card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Synced to ledger</p>
          <p className="mt-3 text-[30px] font-bold tracking-tight text-zinc-950">{stats.syncedClaims}</p>
          <p className="mt-2 text-[13px] text-zinc-500">Claims fully pushed through the local finance workflow.</p>
        </div>
      </motion.section>

      <motion.section variants={itemParams} className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="card">
          <div className="flex items-center justify-between border-b border-zinc-200/60 px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Spend trend</p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-950">Last 7 days</h2>
            </div>
            <div className="rounded-full bg-[rgba(201,115,66,0.12)] p-2 text-[color:var(--page-accent)]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="h-[340px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#ece7e3" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a817c', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a817c', fontWeight: 500 }} tickFormatter={(val: number) => `$${val}`} />
                <Tooltip
                  cursor={{ stroke: '#d9d1ca', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    borderRadius: '18px',
                    border: '1px solid rgba(24,24,27,0.08)',
                    boxShadow: '0 14px 30px rgba(15,23,42,0.08)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#18181b',
                  }}
                  formatter={(value) => [`$${value ?? 0}`, 'Expenses']}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#c97342"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#c97342', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 5, fill: '#9a4f28' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card flex flex-col">
          <div className="border-b border-zinc-200/60 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Recent activity</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">Newest requests</h2>
          </div>
          <div className="flex-1 divide-y divide-zinc-100/80">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/55">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-zinc-900">{claim.description}</p>
                  <p className="mt-1 text-[12px] text-zinc-500">
                    {format(new Date(claim.created_at), 'MMM dd, yyyy')} | {claim.voucher_reference || 'Awaiting voucher'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-zinc-950">{formatCurrency(claim.total_amount)}</p>
                  <span className={`mt-2 inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${statusStyles[claim.status]}`}>
                    {claim.status === 'approved' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {claim.status === 'submitted' && <Clock className="mr-1 h-3 w-3" />}
                    {claim.status === 'rejected' && <FileWarning className="mr-1 h-3 w-3" />}
                    {claim.status === 'synced' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {claim.status}
                  </span>
                </div>
              </div>
            ))}
            {recentClaims.length === 0 && <div className="p-8 text-center text-[13px] font-medium text-zinc-400">No recent activity found.</div>}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
