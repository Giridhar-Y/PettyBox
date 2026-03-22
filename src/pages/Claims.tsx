import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useDropzone } from 'react-dropzone';
import {
  CheckCircle2,
  Download,
  FileText,
  FileUp,
  Paperclip,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import * as xlsx from 'xlsx';
import { addClaim, getClaims, getEntities, getTeams, updateClaimStatus } from '../lib/mockData';
import type { Claim, LegalEntity, Team } from '../lib/mockData';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

interface ClaimFormState {
  description: string;
  total_amount: string;
  legal_entity_id: string;
  team_id: string;
  notes: string;
}

const emptyForm: ClaimFormState = {
  description: '',
  total_amount: '',
  legal_entity_id: '',
  team_id: '',
  notes: '',
};

export default function Claims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [entities, setEntities] = useState<LegalEntity[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<ClaimFormState>(emptyForm);
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [showComposer, setShowComposer] = useState(false);

  const loadData = async () => {
    const [nextClaims, nextEntities, nextTeams] = await Promise.all([getClaims(), getEntities(), getTeams()]);
    setClaims(nextClaims);
    setEntities(nextEntities);
    setTeams(nextTeams);
    setSelectedClaimId((current) => current ?? nextClaims[0]?.id ?? null);
    setForm((current) => ({
      ...current,
      legal_entity_id: current.legal_entity_id || nextEntities[0]?.id || '',
      team_id: current.team_id || nextTeams[0]?.id || '',
    }));
  };

  useEffect(() => {
    void Promise.all([getClaims(), getEntities(), getTeams()]).then(([nextClaims, nextEntities, nextTeams]) => {
      setClaims(nextClaims);
      setEntities(nextEntities);
      setTeams(nextTeams);
      setSelectedClaimId(nextClaims[0]?.id ?? null);
      setForm((current) => ({
        ...current,
        legal_entity_id: current.legal_entity_id || nextEntities[0]?.id || '',
        team_id: current.team_id || nextTeams[0]?.id || '',
      }));
    });
  }, []);

  const filteredClaims = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return claims;
    }

    return claims.filter((claim) =>
      [claim.description, claim.id, claim.status, claim.voucher_reference, claim.notes]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized)),
    );
  }, [claims, query]);

  const pendingCount = filteredClaims.filter((claim) => claim.status === 'submitted').length;
  const selectedClaim = filteredClaims.find((claim) => claim.id === selectedClaimId) ?? claims.find((claim) => claim.id === selectedClaimId) ?? null;
  const selectedEntity = entities.find((entity) => entity.id === selectedClaim?.legal_entity_id) ?? null;
  const selectedTeam = teams.find((team) => team.id === selectedClaim?.team_id) ?? null;

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setQueuedFiles((current) => [...current, ...acceptedFiles]);
      if (!form.description) {
        setForm((current) => ({ ...current, description: acceptedFiles[0].name.replace(/\.[^.]+$/, '') }));
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
  });

  const exportToExcel = () => {
    const ws = xlsx.utils.json_to_sheet(
      filteredClaims.map((claim) => ({
        ID: claim.id,
        Date: format(new Date(claim.created_at), 'yyyy-MM-dd'),
        Description: claim.description,
        Amount: claim.total_amount,
        Status: claim.status,
        Voucher: claim.voucher_reference || '',
      })),
    );
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Claims');
    xlsx.writeFile(wb, 'petty_cash_claims.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Petty Cash Claims', 14, 15);
    autoTable(doc, {
      head: [['ID', 'Date', 'Description', 'Amount', 'Status']],
      body: filteredClaims.map((claim) => [
        claim.id,
        format(new Date(claim.created_at), 'yyyy-MM-dd'),
        claim.description,
        `$${claim.total_amount.toFixed(2)}`,
        claim.status,
      ]),
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [24, 24, 27] },
    });
    doc.save('petty_cash_claims.pdf');
  };

  const resetComposer = () => {
    setQueuedFiles([]);
    setForm((current) => ({
      ...emptyForm,
      legal_entity_id: current.legal_entity_id,
      team_id: current.team_id,
    }));
  };

  const handleCreateClaim = async () => {
    if (!form.description || !form.total_amount || !form.legal_entity_id || !form.team_id) {
      toast.error('Fill in description, amount, entity, and team before submitting.');
      return;
    }

    setIsUploading(true);
    const createdClaim = await addClaim({
      user_id: 'u-1',
      team_id: form.team_id,
      legal_entity_id: form.legal_entity_id,
      status: 'submitted',
      total_amount: Number(form.total_amount),
      description: form.description,
      notes: form.notes,
      attachmentFiles: queuedFiles.map((file) => ({ name: file.name, type: file.type || 'application/octet-stream' })),
    });

    await loadData();
    setSelectedClaimId(createdClaim.id);
    resetComposer();
    setIsUploading(false);
    setShowComposer(false);
    toast.success('Claim submitted and saved locally.');
  };

  const handleStatusChange = async (status: 'approved' | 'rejected' | 'synced') => {
    if (!selectedClaim) {
      return;
    }

    const promise = updateClaimStatus(selectedClaim.id, status).then(async (updated) => {
      await loadData();
      if (updated) {
        setSelectedClaimId(updated.id);
      }
    });

    toast.promise(promise, {
      loading: 'Updating claim status...',
      success: `Claim marked ${status}.`,
      error: 'Failed to update claim status.',
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <section className="card dashboard-mesh p-6 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="section-eyebrow">Claims workflow</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950">Review requests and create new claims without leaving context.</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-zinc-600">
              Search faster, keep attachments visible, and switch between approval and submission without losing your place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <Download className="mr-2 h-3.5 w-3.5" /> Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <Download className="mr-2 h-3.5 w-3.5" /> Export PDF
            </Button>
            <Button
              size="sm"
              variant="magic"
              onClick={() => {
                setSelectedClaimId(null);
                setShowComposer(true);
              }}
            >
              <Plus className="mr-2 h-3.5 w-3.5" /> New Claim
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-white/70 bg-white/78 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Visible claims</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">{filteredClaims.length}</p>
          </div>
          <div className="rounded-[22px] border border-white/70 bg-white/78 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Pending review</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">{pendingCount}</p>
          </div>
          <div className="rounded-[22px] border border-white/70 bg-white/78 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Selected state</p>
            <p className="mt-2 text-lg font-bold tracking-tight text-zinc-950">{selectedClaim ? selectedClaim.status : 'Creating new claim'}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="card bg-[rgba(255,255,255,0.65)]">
          <div className="border-b border-zinc-200/60 bg-white/75 p-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-black" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by description, status, voucher, or notes"
                className="w-full rounded-2xl border border-transparent bg-zinc-50 py-3 pl-10 pr-4 text-[13px] font-medium outline-none transition-all placeholder:text-zinc-400 focus:border-[rgba(201,115,66,0.65)] focus:bg-white focus:ring-4 focus:ring-[rgba(201,115,66,0.12)]"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px] font-medium text-zinc-500">
              <span>{filteredClaims.length} claim(s)</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedClaimId(null);
                  setShowComposer(true);
                }}
                className="text-[color:var(--page-accent)] hover:text-zinc-900"
              >
                Create new
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100vh-21rem)] space-y-1 overflow-y-auto p-3">
            {filteredClaims.map((claim) => (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                key={claim.id}
                type="button"
                onClick={() => {
                  setSelectedClaimId(claim.id);
                  setShowComposer(false);
                }}
                className={cn(
                  'w-full rounded-[22px] border p-4 text-left transition-all',
                  selectedClaim?.id === claim.id
                    ? 'border-zinc-900/10 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.08)]'
                    : 'border-transparent bg-transparent hover:bg-white/70',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-zinc-900">{claim.description}</p>
                    <p className="mt-1 text-[12px] text-zinc-500">{claim.id} | {format(new Date(claim.created_at), 'MMM dd')}</p>
                  </div>
                  <p className="whitespace-nowrap text-[13px] font-bold text-zinc-950">${claim.total_amount.toFixed(2)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={cn(
                      'rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em]',
                      claim.status === 'approved' && 'bg-zinc-100 text-zinc-900 border-zinc-200',
                      claim.status === 'synced' && 'bg-emerald-50 border-emerald-200 text-emerald-800',
                      claim.status === 'rejected' && 'bg-red-50 border-red-200 text-red-700',
                      claim.status === 'submitted' && 'bg-zinc-900 text-white border-transparent',
                      claim.status === 'draft' && 'bg-zinc-100 text-zinc-800 border-zinc-200',
                    )}
                  >
                    {claim.status}
                  </span>
                  <span className="text-[11px] text-zinc-400">{claim.voucher_reference || 'Pending voucher'}</span>
                </div>
              </motion.button>
            ))}

            {filteredClaims.length === 0 && (
              <div className="rounded-[22px] border border-dashed border-zinc-300 bg-white/60 p-8 text-center">
                <p className="text-sm font-semibold text-zinc-900">No claims matched that search</p>
                <p className="mt-2 text-[13px] text-zinc-500">Try a broader query or create a new request from this screen.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card min-h-[640px] bg-white/80">
          {selectedClaim && !showComposer ? (
            <motion.div key={selectedClaim.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col">
              <div className="border-b border-zinc-200/60 bg-white/72 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <span className="section-eyebrow">Claim details</span>
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-950">{selectedClaim.description}</h2>
                    <p className="mt-2 text-[13px] font-medium text-zinc-500">
                      ID: <span className="text-zinc-700">{selectedClaim.id}</span> | Submitted on {format(new Date(selectedClaim.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-zinc-200/70 bg-zinc-50/80 px-4 py-3 text-right">
                    <p className="text-[28px] font-bold tracking-tight text-black">${selectedClaim.total_amount.toFixed(2)}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">{selectedClaim.status}</p>
                  </div>
                </div>
              </div>

              <div className="grid flex-1 gap-6 p-6 lg:grid-cols-[340px_minmax(0,1fr)]">
                <div className="space-y-5">
                  <div className="rounded-[24px] border border-zinc-200/70 bg-zinc-50/65 p-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">Quick actions</h3>
                    <div className="mt-4 grid gap-2">
                      <Button onClick={() => void handleStatusChange('approved')} className="justify-between" disabled={selectedClaim.status === 'approved'}>
                        <span className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4" /> Mark approved</span>
                      </Button>
                      <Button variant="danger" onClick={() => void handleStatusChange('rejected')} className="justify-between" disabled={selectedClaim.status === 'rejected'}>
                        <span className="flex items-center"><XCircle className="mr-2 h-4 w-4" /> Reject claim</span>
                      </Button>
                      <Button variant="outline" onClick={() => void handleStatusChange('synced')} className="justify-between" disabled={selectedClaim.status === 'synced'}>
                        <span className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4" /> Mark synced</span>
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-zinc-200/70 bg-white/75 p-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">Metadata</h3>
                    <div className="mt-4 space-y-4 text-[13px]">
                      <div>
                        <p className="font-medium text-zinc-500">Employee ID</p>
                        <p className="mt-1 font-semibold text-zinc-900">{selectedClaim.user_id}</p>
                      </div>
                      <div>
                        <p className="font-medium text-zinc-500">Legal entity</p>
                        <p className="mt-1 font-semibold text-zinc-900">{selectedEntity?.name || selectedClaim.legal_entity_id}</p>
                      </div>
                      <div>
                        <p className="font-medium text-zinc-500">Assigned team</p>
                        <p className="mt-1 font-semibold text-zinc-900">{selectedTeam?.name || selectedClaim.team_id}</p>
                      </div>
                      <div>
                        <p className="font-medium text-zinc-500">Voucher reference</p>
                        <p className="mt-1 inline-flex rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-xs font-bold text-zinc-900">
                          {selectedClaim.voucher_reference || 'PENDING_SYNC'}
                        </p>
                      </div>
                      {selectedClaim.notes && (
                        <div>
                          <p className="font-medium text-zinc-500">Notes</p>
                          <p className="mt-1 leading-6 text-zinc-700">{selectedClaim.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-zinc-200/70 bg-zinc-50/55 p-3">
                  <div className="flex items-center justify-between border-b border-zinc-200/60 px-3 py-3">
                    <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-zinc-500">Attachments</span>
                    <span className="inline-flex items-center gap-2 text-[12px] text-zinc-500">
                      <Paperclip className="h-3.5 w-3.5" />
                      {selectedClaim.attachments.length}
                    </span>
                  </div>
                  <div className="space-y-3 p-3">
                    {selectedClaim.attachments.length > 0 ? (
                      selectedClaim.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between rounded-[20px] border border-zinc-200 bg-white px-4 py-3">
                          <div>
                            <p className="text-[13px] font-semibold text-zinc-900">{attachment.file_name}</p>
                            <p className="mt-1 text-[12px] text-zinc-500">{attachment.file_type || 'Unknown type'}</p>
                          </div>
                          <FileText className="h-4 w-4 text-zinc-400" />
                        </div>
                      ))
                    ) : (
                      <div className="flex min-h-[280px] items-center justify-center rounded-[22px] border border-dashed border-zinc-300 bg-white">
                        <div className="text-center">
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                            <FileText className="h-5 w-5 text-zinc-400" />
                          </div>
                          <p className="text-[13px] font-bold text-zinc-900">No attachments on this claim</p>
                          <p className="mt-1 max-w-[220px] text-[12px] text-zinc-500">New claims can include invoice images or PDF receipts.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="composer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-8">
              <div className="flex flex-col gap-3 border-b border-zinc-200/60 pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="section-eyebrow">New submission</span>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-950">Create a new petty cash claim</h2>
                  <p className="mt-2 max-w-2xl text-[14px] leading-7 text-zinc-500">
                    Add the basics, attach supporting files, and submit without leaving the workspace flow.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    resetComposer();
                    setShowComposer(false);
                    setSelectedClaimId(claims[0]?.id ?? null);
                  }}
                >
                  Back to list
                </Button>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-500">Description</span>
                      <input className="input-field" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Office supplies" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-500">Amount</span>
                      <input className="input-field" value={form.total_amount} type="number" min="0" step="0.01" onChange={(event) => setForm({ ...form, total_amount: event.target.value })} placeholder="125.00" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-500">Legal Entity</span>
                      <select className="input-field" value={form.legal_entity_id} onChange={(event) => setForm({ ...form, legal_entity_id: event.target.value })}>
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name} ({entity.d365_data_area_id})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-500">Team</span>
                      <select className="input-field" value={form.team_id} onChange={(event) => setForm({ ...form, team_id: event.target.value })}>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-500">Notes</span>
                    <textarea className="input-field min-h-32" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Add context for approvers..." />
                  </label>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button variant="ghost" onClick={resetComposer}>
                      Clear
                    </Button>
                    <Button onClick={() => void handleCreateClaim()} isLoading={isUploading}>
                      Submit Claim
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div
                    {...getRootProps()}
                    className={cn(
                      'flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed p-10 text-center transition-all',
                      isDragActive
                        ? 'border-[color:var(--page-accent)] bg-[rgba(201,115,66,0.07)] scale-[1.01]'
                        : 'border-zinc-300 bg-white hover:border-[color:var(--page-accent)] hover:bg-[rgba(255,255,255,0.92)]',
                    )}
                  >
                    <input {...getInputProps()} />
                    <FileUp className={cn('mb-5 h-10 w-10 transition-colors', isDragActive ? 'text-[color:var(--page-accent)]' : 'text-zinc-300')} strokeWidth={1.5} />
                    <p className="text-[16px] font-bold text-zinc-900">{isDragActive ? 'Release to attach files' : 'Click or drag receipt here'}</p>
                    <p className="mt-2 text-[13px] text-zinc-500">JPG, PNG or PDF</p>
                  </div>

                  <div className="rounded-[24px] border border-zinc-200/70 bg-zinc-50/65">
                    <div className="border-b border-zinc-200/60 px-4 py-3">
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.18em] text-zinc-500">Queued attachments</h3>
                    </div>
                    <div className="space-y-2 p-4">
                      {queuedFiles.length > 0 ? (
                        queuedFiles.map((file) => (
                          <div key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-3 py-2.5">
                            <span className="text-[13px] font-medium text-zinc-800">{file.name}</span>
                            <button type="button" onClick={() => setQueuedFiles((current) => current.filter((item) => item !== file))} className="text-[12px] font-semibold text-zinc-500 hover:text-black">
                              Remove
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[13px] text-zinc-400">No files attached yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
