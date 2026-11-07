/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react';
import { Dialog } from './Dialog';

type Request = { message: string; resolve: (answer: boolean) => void };
export function confirmAction(message: string): Promise<boolean> {
  return new Promise(resolve => window.dispatchEvent(new CustomEvent<Request>('best5:confirm', { detail: { message, resolve } })));
}
export function ConfirmViewport() {
  const [request, setRequest] = useState<Request | null>(null);
  useEffect(() => { const receive = (e: Event) => setRequest((e as CustomEvent<Request>).detail); window.addEventListener('best5:confirm', receive); return () => window.removeEventListener('best5:confirm', receive); }, []);
  if (!request) return null;
  const answer = (value: boolean) => { request.resolve(value); setRequest(null); };
  return <Dialog label="Confirm action" onClose={() => answer(false)}><section className="panel max-w-md"><h2 className="display text-3xl font-bold">Confirm action</h2><p className="my-5 text-white/75">{request.message}</p><div className="flex flex-wrap gap-3"><button autoFocus className="btn-secondary" onClick={() => answer(false)}>Cancel</button><button className="btn-primary" onClick={() => answer(true)}>Confirm</button></div></section></Dialog>;
}
