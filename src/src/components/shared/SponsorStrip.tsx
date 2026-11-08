import { useEffect, useState, type CSSProperties } from 'react';
import type { SponsorLogo } from '@/services/landingPageService';

export default function SponsorStrip({ logos }: { logos: SponsorLogo[] }) {
  const [paused, setPaused] = useState(false);
  const [viewport, setViewport] = useState(() => window.innerWidth);
  useEffect(() => { const resize = () => setViewport(window.innerWidth); window.addEventListener('resize',resize); return () => window.removeEventListener('resize',resize); }, []);
  if (!logos.length) return null;
  // A complete group is wider than the viewport, so the duplicated group loops seamlessly.
  const repeat = Math.max(1, Math.ceil(Math.max(8, Math.ceil(viewport / (viewport < 640 ? 172 : 238)) + 1) / logos.length));
  const group = Array.from({ length: repeat }, () => logos).flat();
  return <section className="sponsor-section" aria-label="Our sponsors">
    <div className="mx-auto mb-8 flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5">
      <h2 className="text-xs font-bold uppercase tracking-[.22em] text-white/70">Proudly backed by</h2>
      <button type="button" className="btn-secondary" aria-pressed={paused} onClick={() => setPaused(v => !v)}>{paused ? 'Play sponsor logos' : 'Pause sponsor logos'}</button>
    </div>
    <ul className="sr-only">{logos.map(logo => <li key={logo.id}>{logo.name}</li>)}</ul>
    <div className={`sponsor-marquee${paused ? ' sponsor-marquee--paused' : ''}`} aria-hidden="true">
      <div className="sponsor-track" style={{ '--sponsor-duration': `${Math.max(30,group.length * 6)}s` } as CSSProperties}>
        {[0,1].map(copy => <div className="sponsor-group" key={copy}>{group.map((logo,index) => <div className={`sponsor-card${index >= logos.length ? ' sponsor-card--repeat' : ''}`} key={`${logo.id}-${index}`}><img src={logo.image} alt="" loading="eager" decoding="async" style={{ transform:`scale(${logo.scale || 1})` }}/></div>)}</div>)}
      </div>
    </div>
  </section>;
}
