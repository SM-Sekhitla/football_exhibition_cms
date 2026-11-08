import { useState } from 'react';
import type { SponsorLogo } from '@/services/landingPageService';
import { FormField } from './AdminUi';
import { ImagePicker } from './ImagePicker';

export default function SponsorEditor({ logos, onChange }: { logos: SponsorLogo[]; onChange: (logos: SponsorLogo[]) => void }) {
  const [target,setTarget]=useState<string|null>(null);
  const update=(id:string,changes:Partial<SponsorLogo>)=>onChange(logos.map(logo=>logo.id===id?{...logo,...changes}:logo));
  const move=(index:number,offset:number)=>{const next=[...logos];[next[index],next[index+offset]]=[next[index+offset],next[index]];onChange(next);};
  return <section className="panel space-y-5">
    <h2 className="display text-3xl font-black uppercase">Sponsor logos</h2>
    <p className="text-sm leading-6 text-white/65">These logos appear in the moving “Proudly backed by” strip. Upload PNG, JPG or WebP artwork through the image picker. Full logos stay on white panels; adjust size while keeping all lettering visible. Save changes at the top when finished.</p>
    {logos.map((logo,index)=><div className="space-y-4 rounded-xl border border-white/10 p-4" key={logo.id}>
      <div className="sponsor-card mx-auto"><img src={logo.image} alt={`${logo.name} preview`} style={{transform:`scale(${logo.scale || 1})`}}/></div>
      <FormField label={`Sponsor ${index+1} name`}><input required maxLength={150} className="field" value={logo.name} onChange={e=>update(logo.id,{name:e.target.value})}/></FormField>
      <FormField label={`Sponsor ${index+1} display size`}><input className="w-full accent-[#c8ff4b]" type="range" min="1" max="2" step=".05" value={logo.scale || 1} onChange={e=>update(logo.id,{scale:Number(e.target.value)})}/></FormField>
      <div className="flex flex-wrap gap-2"><button type="button" className="btn-secondary" onClick={()=>setTarget(logo.id)}>Replace logo</button><button type="button" className="btn-secondary" aria-label={`Move ${logo.name} earlier`} disabled={index===0} onClick={()=>move(index,-1)}>Move earlier</button><button type="button" className="btn-secondary" aria-label={`Move ${logo.name} later`} disabled={index===logos.length-1} onClick={()=>move(index,1)}>Move later</button><button type="button" className="btn-secondary" aria-label={`Remove ${logo.name}`} onClick={()=>onChange(logos.filter(item=>item.id!==logo.id))}>Remove</button></div>
    </div>)}
    <button type="button" className="btn-primary" disabled={logos.length>=50} onClick={()=>setTarget('new')}>Add sponsor logo</button>
    <ImagePicker open={target!==null} onClose={()=>setTarget(null)} onSelect={image=>{if(target==='new')onChange([...logos,{id:crypto.randomUUID(),name:'New sponsor',image,scale:1}]);else if(target)update(target,{image});setTarget(null);}}/>
  </section>;
}
