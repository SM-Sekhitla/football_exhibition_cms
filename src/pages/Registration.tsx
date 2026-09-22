import { useEffect, useRef, useState, type FormEvent } from 'react';
import { repository, type TeamRegistration, type VendorRegistration } from '@/lib/storage';
import { PageShell } from '@/components/shared/PublicUi';
import { FormField } from '@/components/admin/AdminUi';
import { money, whatsappUrl } from '@/lib/ux';

type Draft = { name: string; contact: string; email: string; city: string; players: string[]; category: string; description: string };
const blank: Draft = { name: '', contact: '', email: '', city: '', players: ['', '', '', '', ''], category: 'Food & Drinks', description: '' };
export default function Registration({ type, go }: { type: 'team' | 'vendor'; go: (page: string) => void }) {
  const key = `best5_draft_${type}`;
  const [draft, setDraft] = useState<Draft>(() => { try { return { ...blank, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { return blank; } });
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const [saving, setSaving] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const settings = repository.getSettings();
  const steps = type === 'team' ? ['Team details', 'Squad', 'Review & submit'] : ['Business details', 'Review & submit'];
  useEffect(() => { if (!receipt) { try { localStorage.setItem(key, JSON.stringify(draft)); } catch { setError('Your draft could not be saved. Keep this page open and try freeing device storage.'); } } }, [draft, key, receipt]);
  useEffect(() => { if (step) title.current?.focus(); }, [step]);
  const change = (field: keyof Draft, value: string) => setDraft(d => ({ ...d, [field]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (saving) return;
    if (type === 'vendor' && !draft.description.trim()) { setError('Add a short description of your business.'); return; }
    if (type === 'team' && step === 1) {
      const names = draft.players.map(n => n.trim());
      if (names.length < 5 || names.length > 8 || names.some(n => !n)) { setError('Enter between 5 and 8 player names.'); return; }
      if (new Set(names.map(n => n.toLowerCase())).size !== names.length) { setError('Each player must be listed once.'); return; }
    }
    if (step < steps.length - 1) { setStep(s => s + 1); return; }
    setSaving(true);
    try {
      const id = `B5-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const common = { id, email: draft.email.trim().toLowerCase(), status: 'Pending' as const, submitted: new Date().toISOString(), paymentStatus: 'Awaiting payment' as const };
      if (type === 'team') {
        const items = repository.getTeamRegistrations();
        if (items.some(r => r.email.toLowerCase() === common.email && r.teamName.toLowerCase() === draft.name.trim().toLowerCase() && r.status !== 'Rejected')) throw new Error('An application already exists for this team and email. Check your application status.');
        const item: TeamRegistration = { ...common, teamName: draft.name.trim(), captain: draft.contact.trim(), city: draft.city.trim(), players: draft.players.map(n => n.trim()) };
        repository.saveTeamRegistrations([...items, item]);
      } else {
        const items = repository.getVendorRegistrations();
        if (items.some(r => r.email.toLowerCase() === common.email && r.business.toLowerCase() === draft.name.trim().toLowerCase() && r.status !== 'Rejected')) throw new Error('An application already exists for this business and email. Check your application status.');
        const item: VendorRegistration = { ...common, business: draft.name.trim(), contact: draft.contact.trim(), category: draft.category, description: draft.description.trim() };
        repository.saveVendorRegistrations([...items, item]);
      }
      setReceipt(id); localStorage.removeItem(key);
    } catch (err) { setError(err instanceof Error && !(err instanceof DOMException) ? err.message : 'Could not save your application. Your draft is still here; please try again.'); }
    finally { setSaving(false); }
  };
  if (receipt) return <PageShell title="Application received" eyebrow="Your next steps"><section className="panel max-w-2xl"><p>Your application is pending review.</p><p className="my-5">Your reference: <strong className="text-[#c8ff4b]" data-testid="application-reference">{receipt}</strong></p><p className="text-sm leading-7 text-white/70">Keep this reference and use your email to check your status. Contact the organiser for payment instructions, then send proof of payment with your reference. Submission does not confirm your place.</p><p className="mt-4 text-xs text-white/60">Preview mode: this application is stored on this device only. Contact the organiser to complete a real booking.</p><div className="mt-6 flex flex-wrap gap-3"><a className="btn-primary" href={whatsappUrl(settings.whatsapp, `Hello BEST5, please send payment instructions for ${receipt}.`)} target="_blank" rel="noreferrer">Contact organiser</a><button className="btn-secondary" onClick={() => go('application-status')}>Check application status</button></div></section></PageShell>;
  return <PageShell title={type === 'team' ? 'Register your team' : 'Book a stall'} eyebrow="Join BEST5"><div className="max-w-2xl"><p className="mb-5 text-sm text-white/65">Your draft is saved on this device as you type. <button className="underline text-[#c8ff4b]" onClick={() => go('application-status')}>Already applied?</button></p><ol className="mb-8 flex gap-3">{steps.map((label, i) => <li key={label} aria-current={step === i ? 'step' : undefined} className={`flex-1 border-t-2 pt-3 text-xs ${step >= i ? 'border-[#c8ff4b] text-[#c8ff4b]' : 'border-white/20 text-white/60'}`}>{i + 1}. {label}</li>)}</ol><form onSubmit={submit} className="panel space-y-5"><h2 ref={title} tabIndex={-1} className="display text-3xl font-bold">{steps[step]}</h2>{error && <p role="alert" className="form-error">{error}</p>}
    {step === 0 && <><FormField label={type === 'team' ? 'Team name' : 'Business name'}><input required maxLength={100} className="field" placeholder={type === 'team' ? 'e.g. Polokwane City' : 'Your business'} value={draft.name} onChange={e => change('name', e.target.value)} pattern=".*\S.*"/></FormField><FormField label={type === 'team' ? 'Captain name' : 'Contact person'}><input required className="field" autoComplete="name" value={draft.contact} onChange={e => change('contact', e.target.value)} pattern=".*\S.*"/></FormField><FormField label="Email address"><input type="email" required autoComplete="email" className="field" value={draft.email} onChange={e => change('email', e.target.value)}/></FormField>{type === 'team' ? <FormField label="City"><input required className="field" value={draft.city} onChange={e => change('city', e.target.value)} pattern=".*\S.*"/></FormField> : <><FormField label="Vendor category"><select className="field" value={draft.category} onChange={e => change('category', e.target.value)}>{['Food & Drinks', 'Clothing & Accessories', 'Lifestyle & Services', 'Brand Activations'].map(x => <option key={x}>{x}</option>)}</select></FormField><FormField label="Business description"><textarea required maxLength={2000} rows={4} className="field" value={draft.description} onChange={e => change('description', e.target.value)}/></FormField></>}</>}
    {type === 'team' && step === 1 && <><p className="text-sm text-white/65">Add 5–8 players. Use each player's full name.</p>{draft.players.map((name, i) => <div key={i} className="flex items-end gap-2"><div className="flex-1"><FormField label={`Player ${i + 1}`}><input required pattern=".*\S.*" className="field" value={name} onChange={e => setDraft(d => ({ ...d, players: d.players.map((n, index) => index === i ? e.target.value : n) }))}/></FormField></div>{draft.players.length > 5 && <button type="button" className="btn-secondary" aria-label={`Remove player ${i + 1}`} onClick={() => setDraft(d => ({ ...d, players: d.players.filter((_, index) => index !== i) }))}>Remove</button>}</div>)}<button type="button" className="btn-secondary" disabled={draft.players.length === 8} onClick={() => setDraft(d => ({ ...d, players: [...d.players, ''] }))}>Add player</button></>}
    {step === steps.length - 1 && <><dl className="space-y-3 text-sm"><dt className="text-white/60">{type === 'team' ? 'Team' : 'Business'}</dt><dd>{draft.name}</dd><dt className="text-white/60">Contact</dt><dd>{draft.contact} · {draft.email}</dd><dt className="text-white/60">{type === 'team' ? 'Squad' : 'Description'}</dt><dd>{type === 'team' ? draft.players.join(', ') : draft.description}</dd></dl><div className="rounded-xl bg-white/5 p-4"><p className="font-bold">{type === 'team' ? `Affiliation: ${money(settings.affiliationFee)}` : `Stall fee: ${money(settings.vendorStallFee)}`}</p>{type === 'team' && <p className="mt-2 text-sm">Spot booking fee: {money(settings.spotBookingFee)}. Confirm how this applies with the organiser before paying.</p>}<p className="mt-3 text-sm text-white/65">No payment is collected here. Payment instructions are available after submission.</p></div><label className="flex gap-3 text-sm"><input type="checkbox" required/>I have checked these details and understand my place requires approval.</label></>}
    <div className="flex flex-wrap gap-3">{step > 0 && <button type="button" className="btn-secondary" onClick={() => { setError(''); setStep(s => s - 1); }}>Back</button>}<button disabled={saving} className="btn-primary flex-1">{saving ? 'Submitting…' : step === steps.length - 1 ? 'Submit application' : 'Continue'}</button></div></form></div></PageShell>;
}

export function ApplicationStatus() {
  const [reference, setReference] = useState(''); const [email, setEmail] = useState(''); const [result, setResult] = useState<TeamRegistration | VendorRegistration | null>(null); const [searched, setSearched] = useState(false);
  return <PageShell title="Application status" eyebrow="Your booking"><form className="panel max-w-xl space-y-5" onSubmit={e => { e.preventDefault(); setSearched(true); setResult([...repository.getTeamRegistrations(), ...repository.getVendorRegistrations()].find(r => r.id.toLowerCase() === reference.trim().toLowerCase() && r.email.toLowerCase() === email.trim().toLowerCase()) || null); }}><FormField label="Application reference"><input required className="field" value={reference} onChange={e => setReference(e.target.value)}/></FormField><FormField label="Email address"><input required type="email" className="field" value={email} onChange={e => setEmail(e.target.value)}/></FormField><button className="btn-primary">Check status</button>{searched && (result ? <div role="status" className="space-y-3"><h2 className="display text-3xl">{result.status}</h2><p>{'teamName' in result ? result.teamName : result.business}</p><p>Payment: {result.paymentStatus || 'Awaiting payment'}</p>{result.reviewNote && <p>{result.reviewNote}</p>}<a className="btn-secondary" href={whatsappUrl(repository.getSettings().whatsapp, `Please help with application ${result.id}.`)}>Contact organiser</a></div> : <p role="alert" className="form-error">No matching application on this device. Check your reference and email, or contact the organiser.</p>)}</form></PageShell>;
}
