import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { galleryService, mediaService, type MediaItem } from '@/services/cmsServices';
import { MediaUploader } from './MediaUploader';

export function ImagePicker({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (src: string) => void }) {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'All' | 'Gallery' | 'Media'>('All');
  const [revision, setRevision] = useState(0);
  void revision;
  const images = [...galleryService.getAll().map(x => ({ ...x, source: 'Gallery', label: x.caption || x.name })), ...mediaService.getAll().map(x => ({ ...x, source: 'Media', label: x.name }))].filter(x => (source === 'All' || x.source === source) && x.label.toLowerCase().includes(query.toLowerCase()));
  if (!open) return null;
  const upload = (file: Omit<MediaItem, 'id' | 'createdAt'>) => { mediaService.add({ ...file, category: 'Posts', id: crypto.randomUUID(), createdAt: new Date().toISOString() }); setRevision(x => x + 1); };
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 backdrop-blur-sm md:items-center md:p-6" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="flex max-h-[88vh] w-full max-w-5xl flex-col rounded-t-3xl border border-white/10 bg-[#0d1d14] p-5 md:rounded-3xl md:p-7"><header className="flex justify-between"><div><p className="text-xs font-black uppercase tracking-[.25em] text-[#c8ff4b]">Gallery & media</p><h2 className="display text-4xl font-black uppercase">Choose an image</h2></div><button type="button" onClick={onClose}><X/></button></header><div className="mt-5 flex flex-wrap gap-3"><label className="relative min-w-56 flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search images" className="field pl-11"/></label><div className="flex rounded-xl bg-white/5 p-1">{(['All','Gallery','Media'] as const).map(x=><button type="button" key={x} onClick={()=>setSource(x)} className={`rounded-lg px-4 py-2 text-xs font-bold ${source===x?'bg-[#c8ff4b] text-[#07100c]':'text-white/55'}`}>{x}</button>)}</div><MediaUploader category="Posts" onUpload={upload}/></div><div className="mt-5 grid flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">{images.map(x=><button type="button" key={`${x.source}-${x.id}`} onClick={()=>onSelect(x.src)} className="overflow-hidden rounded-xl border border-white/10 bg-white/[.04] text-left hover:border-[#c8ff4b]"><img src={x.src} className="aspect-square w-full object-cover"/><span className="block truncate p-3 text-xs font-bold">{x.label}</span></button>)}</div>{!images.length&&<p className="py-14 text-center text-sm text-white/40">No images found. Upload one here or add it to Gallery.</p>}</section></div>;
}
