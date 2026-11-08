import { useRef, useState } from 'react';
import { FormField } from '@/components/admin/AdminUi';
import { uploadPolicy } from '@/lib/api';

export interface RegistrationLogo { name: string; type: string; data: string; }
export default function TeamLogoUpload({ value, onChange, onBusyChange }: {
  value?: RegistrationLogo; onChange: (value?: RegistrationLogo) => void; onBusyChange: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const policy = uploadPolicy().image;
  const limit = policy.maxSizeBytes / (1024 * 1024);
  const read = async (file?: File) => {
    setError('');
    if (!file) return;
    if (!policy.types.includes(file.type) || !file.size || file.size > policy.maxSizeBytes) {
      setError(`Choose an enabled image up to ${limit} MB.`);
      if (input.current) input.current.value = '';
      return;
    }
    setBusy(true); onBusyChange(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read this image.'));
        reader.readAsDataURL(file);
      });
      const image = new Image(); image.src = data;
      await image.decode();
      if (image.naturalWidth * image.naturalHeight > 40_000_000) throw new Error('Image dimensions are too large.');
      onChange({ name: file.name, type: file.type, data });
    } catch { setError('Could not read this image. Choose another logo.'); }
    finally { setBusy(false); onBusyChange(false); }
  };
  return <section className="space-y-3 rounded-xl border border-white/10 p-4">
    <FormField label="Team logo (optional)"><input ref={input} className="field" type="file" accept={policy.types.join(',')} disabled={busy} onChange={e => void read(e.target.files?.[0])}/></FormField>
    <p className="text-xs leading-6 text-white/60">Your logo will appear in Teams and match fixtures after approval. Use a square image with a clear background. Accepted: {policy.types.map(type => type.split('/')[1].toUpperCase()).join(', ')}. Maximum {limit} MB. Reselect the file if you reload this draft.</p>
    {busy && <p role="status" className="text-sm text-white/70">Reading logo…</p>}
    {error && <p role="alert" className="form-error">{error}</p>}
    {value && <div className="flex items-center gap-4"><img src={value.data} alt="Selected team logo preview" className="h-20 w-20 rounded-xl bg-white/5 p-2 object-contain"/><div><p className="break-all text-sm">{value.name}</p><button type="button" className="btn-secondary mt-2" disabled={busy} onClick={() => { onChange(undefined); setError(''); if (input.current) input.current.value = ''; }}>Remove logo</button></div></div>}
  </section>;
}
