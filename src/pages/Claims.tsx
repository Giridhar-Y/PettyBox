import { useEffect, useState, useCallback } from 'react';
import { getClaims, updateClaimStatus, addClaim } from '../lib/mockData';
import type { Claim } from '../lib/mockData';
import { format } from 'date-fns';
import { useDropzone } from 'react-dropzone';
import { Button } from '../components/ui/Button';
import { FileUp, FileText, CheckCircle2, XCircle, Search, Download, Paperclip } from 'lucide-react';
import * as xlsx from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../components/layout/Sidebar';

export default function Claims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadClaims = async () => {
    const data = await getClaims();
    setClaims([...data]);
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true);
      const newClaim: Claim = {
        id: `cl-${Math.floor(Math.random() * 10000)}`,
        user_id: 'u-1',
        status: 'submitted',
        total_amount: Math.floor(Math.random() * 500) + 50,
        created_at: new Date().toISOString(),
        description: `Receipt: ${acceptedFiles[0].name}`
      };
      await addClaim(newClaim);
      await loadClaims();
      setIsUploading(false);
      toast.success(`File ${acceptedFiles[0].name} uploaded and claim submitted!`);
      setSelectedClaim(newClaim);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] }
  });

  const exportToExcel = () => {
    const ws = xlsx.utils.json_to_sheet(claims.map(c => ({
      ID: c.id,
      Date: format(new Date(c.created_at), 'yyyy-MM-dd'),
      Description: c.description,
      Amount: c.total_amount,
      Status: c.status,
      Voucher: c.voucher_reference || ''
    })));
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Claims");
    xlsx.writeFile(wb, "petty_cash_claims.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Petty Cash Claims", 14, 15);
    const tableData = claims.map(c => [
      c.id, format(new Date(c.created_at), 'yyyy-MM-dd'), c.description, `$${c.total_amount.toFixed(2)}`, c.status
    ]);
    (doc as any).autoTable({
      head: [['ID', 'Date', 'Description', 'Amount', 'Status']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [24, 24, 27] } // zinc-900
    });
    doc.save("petty_cash_claims.pdf");
  };

  const handleStatusChange = async (status: 'approved' | 'rejected') => {
    if (!selectedClaim) return;
    const promise = updateClaimStatus(selectedClaim.id, status).then(() => {
      setSelectedClaim(prev => prev ? { ...prev, status } : prev);
      loadClaims();
    });
    
    toast.promise(promise, {
      loading: 'Updating status...',
      success: `Claim has been ${status}`,
      error: 'Failed to update claim'
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex justify-between items-end pb-4 border-b border-zinc-200/60">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900 leading-tight">Claims Management</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Upload and approve petty cash invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToExcel}><Download className="w-3.5 h-3.5 mr-2" /> Export Excel</Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}><Download className="w-3.5 h-3.5 mr-2" /> Export PDF</Button>
          <Button onClick={() => setSelectedClaim(null)} size="sm" variant="magic" className="hidden md:flex ml-2"><FileUp className="w-3.5 h-3.5 mr-2" /> New Claim</Button>
        </div>
      </div>

      <div className="flex flex-1 gap-5 h-[calc(100vh-14rem)] min-h-[500px]">
        {/* Left List */}
        <div className="w-[320px] flex flex-col card bg-[#fafafa]">
          <div className="p-3 border-b border-zinc-200/60 bg-white">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 group-focus-within:text-black transition-colors" />
              <input 
                type="text" 
                placeholder="Search requests..." 
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-transparent rounded-md text-[13px] font-medium focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 transition-all outline-none placeholder:text-zinc-400 placeholder:font-normal"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
            {claims.map(claim => (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                key={claim.id} 
                onClick={() => setSelectedClaim(claim)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all border",
                  selectedClaim?.id === claim.id 
                    ? "bg-white border-zinc-300 shadow-sm" 
                    : "bg-transparent border-transparent hover:bg-zinc-100"
                )}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="font-bold text-[13px] text-zinc-900 truncate pr-2">{claim.description || 'Petty Cash'}</span>
                  <span className="font-bold text-[13px]">${claim.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-medium text-zinc-500">
                  <span className="uppercase tracking-wide">{format(new Date(claim.created_at), 'MMM dd')}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold border",
                    claim.status === 'approved' ? "bg-zinc-100 text-zinc-900 border-zinc-200" :
                    claim.status === 'synced' ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                    claim.status === 'rejected' ? "bg-red-50 border-red-200 text-red-700" :
                    "bg-zinc-900 text-white border-transparent"
                  )}>
                    {claim.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Detail/Upload */}
        <div className="flex-1 card bg-white flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedClaim ? (
              <motion.div 
                key={selectedClaim.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="flex-1 flex flex-col absolute inset-0 bg-white"
              >
                <div className="p-6 border-b border-zinc-200/60 bg-[#fafafa]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-[20px] font-bold tracking-tight text-zinc-900">{selectedClaim.description}</h2>
                      <p className="text-[13px] font-medium text-zinc-500 mt-1">ID: <span className="text-zinc-700">{selectedClaim.id}</span> &middot; Submitted on {format(new Date(selectedClaim.created_at), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[28px] font-bold tracking-tight text-black">${selectedClaim.total_amount.toFixed(2)}</p>
                      <p className="text-[11px] font-bold tracking-widest text-zinc-400 mt-1 uppercase">{selectedClaim.status}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 flex p-6 gap-6 overflow-hidden">
                  <div className="w-5/12 space-y-6 overflow-y-auto pr-2">
                    <div>
                      <h3 className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase mb-3">Actions</h3>
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => handleStatusChange('approved')} className="w-full justify-between px-4" disabled={selectedClaim.status === 'approved'}>
                          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Approved</span>
                          <span className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">Enter</span>
                        </Button>
                        <Button variant="danger" onClick={() => handleStatusChange('rejected')} className="w-full justify-between px-4" disabled={selectedClaim.status === 'rejected'}>
                          <span className="flex items-center"><XCircle className="w-4 h-4 mr-2" /> Reject Claim</span>
                          <span className="text-red-300 text-[10px] font-bold tracking-widest uppercase">Del</span>
                        </Button>
                      </div>
                    </div>
                    <div className="card p-4 bg-zinc-50/50">
                      <h3 className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase mb-4">Metadata</h3>
                      <div className="space-y-4 text-[13px]">
                        <div>
                          <p className="text-zinc-500 font-medium mb-1">Employee ID</p>
                          <p className="font-bold text-zinc-900">{selectedClaim.user_id}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 font-medium mb-1">Legal Entity Scope</p>
                          <p className="font-bold text-zinc-900 inline-flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-black rounded-full"></div> USMF (Mock)</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 font-medium mb-1">Voucher Reference</p>
                          <p className="font-mono text-zinc-900 font-bold bg-zinc-100 p-1 rounded inline-block text-xs border border-zinc-200">
                            {selectedClaim.voucher_reference || 'PENDING_SYNC'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 border border-zinc-200/60 rounded-xl bg-[#fafafa] flex flex-col p-2">
                     <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200/50 mb-2">
                       <span className="text-[12px] font-bold text-zinc-500 flex items-center gap-2"><Paperclip className="w-3.5 h-3.5"/> Attached Document</span>
                       <Button variant="ghost" size="sm" className="h-7 text-[12px]">View Original</Button>
                     </div>
                     <div className="flex-1 border border-dashed border-zinc-300 rounded-lg flex items-center justify-center m-2 bg-white">
                        <div className="text-center p-6">
                           <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <FileText className="w-5 h-5 text-zinc-400" />
                           </div>
                           <p className="text-[13px] font-bold text-zinc-900">No Image Preview Available</p>
                           <p className="text-[12px] text-zinc-500 mt-1 max-w-[200px] mx-auto">This is a mock implementation without cloud storage buckets configured.</p>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-12 absolute inset-0 bg-white"
              >
                <div className="text-center mb-8">
                  <h2 className="text-[24px] font-bold tracking-tight text-zinc-900">Drop an invoice</h2>
                  <p className="text-[14px] text-zinc-500 mt-2 max-w-sm mx-auto font-medium leading-relaxed">Our AI will automatically extract the amount, date, and description from the receipt.</p>
                </div>
                
                <div 
                  {...getRootProps()} 
                  className={cn(
                    "w-full max-w-lg p-16 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer",
                    isDragActive ? "border-black bg-zinc-50 scale-[1.02]" : "border-zinc-300 hover:border-black hover:bg-[#fafafa] bg-white"
                  )}
                >
                  <input {...getInputProps()} />
                  <FileUp className={cn("w-10 h-10 mb-6 transition-colors", isDragActive ? "text-black" : "text-zinc-300")} strokeWidth={1.5} />
                  {isUploading ? (
                    <p className="text-[15px] font-bold text-zinc-900 animate-pulse">Running OCR analysis...</p>
                  ) : isDragActive ? (
                    <p className="text-[15px] font-bold text-black">Release to extract data</p>
                  ) : (
                    <>
                      <p className="text-[15px] font-bold text-zinc-900">Click or drag receipt here</p>
                      <p className="text-[13px] font-medium text-zinc-500 mt-2">JPG, PNG or PDF (max 10MB)</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
