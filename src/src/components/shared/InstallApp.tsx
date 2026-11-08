import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { clearInstallPrompt, installPrompt } from '@/lib/pwa';
import { Dialog } from './Dialog';

export default function InstallApp() {
  const [prompt,setPrompt]=useState(installPrompt);
  const [instructions,setInstructions]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [installed,setInstalled]=useState(() => matchMedia('(display-mode: standalone)').matches);
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  useEffect(()=>{
    const ready=()=>setPrompt(installPrompt());
    const complete=()=>{setInstalled(true);setInstructions(false);};
    window.addEventListener('best5:install-ready',ready);
    window.addEventListener('appinstalled',complete);
    return ()=>{window.removeEventListener('best5:install-ready',ready);window.removeEventListener('appinstalled',complete);};
  },[]);
  if(installed || (!prompt && !ios)) return null;
  const install=async()=>{
    if(!prompt){setInstructions(true);return;}
    setBusy(true);setMessage('');
    try {await prompt.prompt();await prompt.userChoice;clearInstallPrompt();}
    catch {setMessage('Use your browser’s menu to install BEST5 or add it to your home screen.');}
    finally {setBusy(false);}
  };
  return <div className="mt-5">
    <button type="button" className="btn-secondary" disabled={busy} onClick={()=>void install()}><Download size={15}/>Install BEST5 app</button>
    {message && <p role="status" className="mt-3 text-xs text-white/65">{message}</p>}
    {instructions && <Dialog label="Install BEST5" onClose={()=>setInstructions(false)}><section className="panel max-w-md"><div className="flex items-center justify-between gap-4"><h2 className="display text-3xl">Install BEST5</h2><button type="button" aria-label="Close installation instructions" className="btn-secondary" onClick={()=>setInstructions(false)}><X size={16}/></button></div><p className="mt-5 leading-7 text-white/75">In Safari, tap Share, then Add to Home Screen and confirm Add. BEST5 will open from your home screen as an app.</p></section></Dialog>}
  </div>;
}
