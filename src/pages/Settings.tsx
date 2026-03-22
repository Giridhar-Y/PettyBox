import { useEffect, useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { getSettings, resetWorkspaceData, updateSettings } from '../lib/mockData';
import type { WorkspaceSettings } from '../lib/mockData';

export default function Settings() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<WorkspaceSettings>({
    defaultValues: {
      workspaceName: 'PettyBox Finance',
      baseCurrency: 'USD',
      approvalThreshold: 500,
      autoSync: true,
      aiExtractionEnabled: false,
    },
  });
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    void getSettings().then((settings) => reset(settings));
  }, [reset]);

  const onSubmit = async (values: WorkspaceSettings) => {
    await updateSettings({
      ...values,
      approvalThreshold: Number(values.approvalThreshold),
    });
    toast.success('Workspace settings saved.');
  };

  const handleResetWorkspace = async () => {
    setIsResetting(true);
    const data = resetWorkspaceData();
    reset(data.settings);
    setIsResetting(false);
    toast.success('Workspace data reset to the seeded state.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-zinc-200/60">
        <h1 className="text-[26px] font-bold tracking-tight text-zinc-900 leading-tight">Workspace Settings</h1>
        <p className="text-[13px] text-zinc-500 mt-1">Control local workspace defaults and reset the demo data when needed.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-[12px] font-bold tracking-wider text-zinc-500 uppercase">Workspace Name</span>
            <input className="input-field" {...register('workspaceName', { required: true })} />
          </label>
          <label className="space-y-2">
            <span className="text-[12px] font-bold tracking-wider text-zinc-500 uppercase">Base Currency</span>
            <input className="input-field" {...register('baseCurrency', { required: true })} />
          </label>
          <label className="space-y-2">
            <span className="text-[12px] font-bold tracking-wider text-zinc-500 uppercase">Approval Threshold</span>
            <input className="input-field" type="number" min="0" {...register('approvalThreshold', { valueAsNumber: true })} />
          </label>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 px-4 py-3">
            <div>
              <p className="text-[14px] font-semibold text-zinc-900">Auto sync approved claims</p>
              <p className="text-[12px] text-zinc-500">Keeps the workspace ready for finance export.</p>
            </div>
            <input type="checkbox" className="h-4 w-4" {...register('autoSync')} />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 px-4 py-3">
            <div>
              <p className="text-[14px] font-semibold text-zinc-900">Enable AI extraction messaging</p>
              <p className="text-[12px] text-zinc-500">Only changes workspace copy for now; no OCR backend is wired in yet.</p>
            </div>
            <input type="checkbox" className="h-4 w-4" {...register('aiExtractionEnabled')} />
          </label>
        </div>

        <div className="flex justify-between gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => void handleResetWorkspace()} isLoading={isResetting}>
            <RotateCcw className="w-4 h-4 mr-2" /> Reset Demo Data
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <Save className="w-4 h-4 mr-2" /> Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
