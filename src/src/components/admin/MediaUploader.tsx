import { uploadPolicy } from '@/lib/api';
import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from '@/components/shared/Toast';

async function optimise(file: File, outputType: string): Promise<string> {
  if (file.type === 'image/gif') return new Promise((resolve,reject) => { const reader=new FileReader(); reader.onload=()=>resolve(String(reader.result)); reader.onerror=()=>reject(reader.error); reader.readAsDataURL(file); });
  const bitmap = await createImageBitmap(file); const scale = Math.min(1,1920/Math.max(bitmap.width,bitmap.height));
  const canvas = document.createElement('canvas'); canvas.width=Math.round(bitmap.width*scale); canvas.height=Math.round(bitmap.height*scale); canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height); bitmap.close(); return canvas.toDataURL(outputType,.82);
}
export function MediaUploader({ category='General',onUpload }: { category?:string; onUpload:(file:{name:string;type:string;src:string;category:string})=>unknown | Promise<unknown> }) {
  const policy=uploadPolicy().image;
  const input=useRef<HTMLInputElement>(null); const busy=useRef(false);
  const [progress,setProgress]=useState<{done:number;total:number}|null>(null); const [errors,setErrors]=useState<string[]>([]); const [summary,setSummary]=useState('');
  const change=async(files:FileList|null)=>{
    const selected=Array.from(files||[]); if(!selected.length||busy.current)return; busy.current=true; setErrors([]); setSummary(''); let uploaded=0;
    for(const [index,file] of selected.entries()) {
      setProgress({done:index+1,total:selected.length});
      if(!policy.types.includes(file.type)){setErrors(items=>[...items,`${file.name}: use an enabled image format (${policy.types.join(', ')}).`]);continue;}
      if(file.size>policy.maxSizeBytes){setErrors(items=>[...items,`${file.name}: images must be smaller than ${policy.maxSizeBytes / (1024 * 1024)} MB.`]);continue;}
      try{const src=await optimise(file, policy.types.includes('image/webp') ? 'image/webp' : policy.types.includes('image/png') ? 'image/png' : 'image/jpeg');if (!policy.types.includes(src.split(';')[0].slice(5))) throw new Error('Optimised format is not enabled');await onUpload({name:file.name,type:src.split(';')[0].slice(5),src,category});uploaded++;}
      catch(error){const quota=error instanceof DOMException&&['QuotaExceededError','NS_ERROR_DOM_QUOTA_REACHED'].includes(error.name);setErrors(items=>[...items,quota?'Storage is full. Delete unused images and try again.':`${file.name} could not be saved. Please try another image.`]);}
    }
    busy.current=false;setProgress(null);if(input.current)input.current.value='';
    if(uploaded){const message=`${uploaded} image${uploaded===1?'':'s'} uploaded`;setSummary(message);toast.success(message);}
  };
  return <div className="min-w-0"><input ref={input} className="hidden" type="file" accept={policy.types.join(',')} multiple onChange={e=>void change(e.target.files)}/><button type="button" className="btn-primary" disabled={!!progress} aria-busy={!!progress} onClick={()=>input.current?.click()}><Upload size={15}/>{progress?`Processing ${progress.done} of ${progress.total}…`:'Upload images'}</button>{summary&&<p role="status" className="mt-2 text-xs text-[#c8ff4b]">{summary}</p>}{errors.length>0&&<div role="alert" className="form-error mt-3 text-sm">{errors.map((error,i)=><p key={i}>{error}</p>)}</div>}</div>;
}
