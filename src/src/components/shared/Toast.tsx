/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastKind = 'success'|'error'|'info';
interface ToastMessage { id:string; message:string; detail?:string; kind:ToastKind; }
const EVENT='best5:toast';
export const toast = {
  show(message:string,kind:ToastKind='info',detail?:string){window.dispatchEvent(new CustomEvent<ToastMessage>(EVENT,{detail:{id:crypto.randomUUID(),message,detail,kind}}));},
  success(message:string,detail?:string){this.show(message,'success',detail)},
  error(message:string,detail?:string){this.show(message,'error',detail)},
  info(message:string,detail?:string){this.show(message,'info',detail)},
};

export function ToastViewport(){const [items,setItems]=useState<ToastMessage[]>([]);useEffect(()=>{const receive=(event:Event)=>{const item=(event as CustomEvent<ToastMessage>).detail;setItems(current=>[...current.slice(-3),item]);window.setTimeout(()=>setItems(current=>current.filter(x=>x.id!==item.id)),4500)};window.addEventListener(EVENT,receive);return()=>window.removeEventListener(EVENT,receive)},[]);const remove=(id:string)=>setItems(current=>current.filter(x=>x.id!==id));return <div className="pointer-events-none fixed inset-x-4 top-5 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:w-[390px]">{items.map(item=>{const Icon=item.kind==='success'?CheckCircle2:item.kind==='error'?AlertCircle:Info;return <div key={item.id} role="status" className={`toast-card pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${item.kind==='error'?'border-red-400/30 bg-[#271311]/95':item.kind==='success'?'border-[#c8ff4b]/30 bg-[#102318]/95':'border-[#d8b852]/30 bg-[#171b13]/95'}`}><div className={`mt-0.5 rounded-full p-2 ${item.kind==='error'?'bg-red-400/10 text-red-300':item.kind==='success'?'bg-[#c8ff4b]/10 text-[#c8ff4b]':'bg-[#d8b852]/10 text-[#d8b852]'}`}><Icon size={18}/></div><div className="min-w-0 flex-1"><b className="display block text-lg uppercase tracking-wide text-white">{item.message}</b>{item.detail&&<p className="mt-1 text-xs leading-5 text-white/55">{item.detail}</p>}</div><button onClick={()=>remove(item.id)} className="text-white/35 hover:text-white" aria-label="Dismiss notification"><X size={16}/></button></div>})}</div>}
