import { PasswordInput } from '@/components/shared/PasswordInput';
import { useState } from 'react';
import { repository, type BankingDetails } from '@/lib/storage';
import { api, applySnapshot, type Snapshot } from '@/lib/api';
import { useUnsavedChanges } from '@/lib/ux';
import { AdminPageHeader, FormField } from '@/components/admin/AdminUi';

export default function AdminRegistrationPage() {
  const [banking, setBanking] = useState(repository.getSettings().banking);
  const [text, setText] = useState(repository.getSettings().registrationPrerequisites);
  const [password, setPassword] = useState('');
  const [baseline,setBaseline] = useState(JSON.stringify({ banking, text }));
  const [saving,setSaving] = useState(false);
  useUnsavedChanges(JSON.stringify({ banking, text }) !== baseline);
  const [message, setMessage] = useState('');
  const [bankMessage, setBankMessage] = useState('');
  const fields: [keyof BankingDetails, string][] = [['bankName', 'Bank name'], ['accountNumber', 'Account number'], ['accountName', 'Account name'], ['accountType', 'Account type'], ['branchCode', 'Branch code'], ['reference', 'Payment reference instructions']];
  return <><AdminPageHeader title="Registration & banking"/><div className="max-w-3xl space-y-8"><form className="panel space-y-5" onSubmit={async e => { e.preventDefault(); setSaving(true); try { await repository.saveSettings({ ...repository.getSettings(), registrationPrerequisites: text.trim() }); setBaseline(JSON.stringify({ banking: repository.getSettings().banking, text })); setMessage('Registration prerequisites saved.'); } catch (err) { setMessage(err instanceof Error ? err.message : 'Could not save. Please try again.'); } finally { setSaving(false); } }}><h2 className="display text-3xl font-bold">Registration prerequisites</h2><p className="text-sm text-white/65">Teams read and accept this text before starting their application. Keep fees and deadlines up to date.</p><FormField label="Prerequisites and required documents"><textarea required rows={22} className="field" value={text} onChange={e => setText(e.target.value)}/></FormField>{message && <p role="status">{message}</p>}<button disabled={saving} className="btn-primary">Save prerequisites</button></form><form className="panel space-y-5" onSubmit={async e => { e.preventDefault(); setBankMessage(''); setSaving(true); try { applySnapshot(await api<Snapshot>('/admin/settings/banking', { method: 'PUT', body: JSON.stringify({ banking, password }) })); setBaseline(JSON.stringify({ banking, text: repository.getSettings().registrationPrerequisites })); setBankMessage('Banking details saved.'); } catch (err) { setBankMessage(err instanceof Error ? err.message : 'Could not save banking details.'); } finally { setPassword(''); setSaving(false); } }}><h2 className="display text-3xl font-bold">Banking details</h2><p className="text-sm text-white/65">Enter your admin password to authorise each banking update.</p>{fields.map(([key,label]) => <FormField key={key} label={label}><input required className="field" value={banking[key]} onChange={e => setBanking({ ...banking, [key]: e.target.value })}/></FormField>)}<FormField label="Confirm admin password"><PasswordInput toggleLabel="admin password" required autoComplete="current-password" className="field" value={password} onChange={e => setPassword(e.target.value)}/></FormField>{bankMessage && <p role="status">{bankMessage}</p>}<button disabled={saving} className="btn-primary">Save banking details</button></form></div></>;
}
