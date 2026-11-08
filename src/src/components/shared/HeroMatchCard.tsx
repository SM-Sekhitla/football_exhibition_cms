import { useId } from 'react';
import { ArrowUpRight, MapPin, Pause, Play } from 'lucide-react';
import type { Settings } from '@/lib/storage';
import { eventDate, money } from '@/lib/ux';
import { Countdown } from './PublicUi';

function PrizeTrophy() {
  const id=useId().replace(/:/g,'');
  return <svg viewBox="0 0 180 220" className="hero-card__trophy" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-gold`} x1="0" x2="1"><stop stopColor="#795122"/><stop offset=".23" stopColor="#e8b95f"/><stop offset=".46" stopColor="#fff1b4"/><stop offset=".65" stopColor="#d69b37"/><stop offset=".84" stopColor="#f2cd7c"/><stop offset="1" stopColor="#98702c"/></linearGradient>
      <linearGradient id={`${id}-rim`} x2="0" y2="1"><stop stopColor="#fff7d3"/><stop offset=".5" stopColor="#d2a04c"/><stop offset="1" stopColor="#69471c"/></linearGradient>
    </defs>
    <ellipse cx="92" cy="205" rx="65" ry="9" fill="#000" opacity=".28"/>
    <path d="M49 45H25v20c0 28 13 43 40 45M131 45h24v20c0 28-13 43-40 45" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="11"/>
    <path d="M48 36h84l-5 46c-3 30-17 46-37 46S56 112 53 82Z" fill={`url(#${id}-gold)`} stroke="#e9c478" strokeWidth="1.5"/>
    <path d="M62 44h8l4 56c-8-8-11-24-12-56Z" fill="#fff8dc" opacity=".5"/>
    <path d="M110 44h12l-5 48c-1 10-5 18-11 23 9-28 7-49 4-71Z" fill="#6c4319" opacity=".26"/>
    <ellipse cx="90" cy="36" rx="43" ry="7" fill={`url(#${id}-rim)`}/>
    <ellipse cx="90" cy="35" rx="35" ry="3" fill="#725220"/>
    <path d="m90 59 5 10 11 2-8 8 2 12-10-6-10 6 2-12-8-8 11-2Z" fill="#a2762e" stroke="#fff0b4" strokeWidth="1"/>
    <path d="M85 127h10v32h-10Z" fill={`url(#${id}-gold)`}/>
    <path d="M88 148c-3 14-10 18-26 21h56c-16-3-23-7-26-21Z" fill={`url(#${id}-gold)`}/>
    <rect x="57" y="167" width="66" height="10" rx="3" fill={`url(#${id}-rim)`}/>
    <path d="M51 178h78l7 24H44Z" fill="#16231c" stroke="#627044"/>
    <rect x="69" y="182" width="42" height="13" rx="1.5" fill={`url(#${id}-gold)`}/>
    <path d="M79 188h22" stroke="#735120" strokeWidth="1.5"/>
  </svg>;
}

export default function HeroMatchCard({settings,slide,paused,onSelect,onToggle,go}: {
  settings:Settings;slide:number;paused:boolean;onSelect:(slide:number)=>void;onToggle:()=>void;go:(page:string)=>void;
}) {
  return <section className="hero-card" aria-label="Tournament highlights">
    <div className="hero-card__pitch" aria-hidden="true"><span/></div>
    <header className="hero-card__header"><span className="hero-card__status"><i/>{settings.lifecycle}</span><span className="hero-card__counter"><b>{String(slide+1).padStart(2,'0')}</b><span>/</span>03</span></header>
    <div className="hero-card__slide" key={slide}>
      {slide===0 ? <><p className="hero-card__eyebrow">Your matchday starts here</p><h2 className="display hero-card__date">{eventDate(settings.eventDate)}</h2><p className="hero-card__venue"><MapPin size={14}/><span>{settings.venue} · {settings.city}</span></p>{settings.modules.countdown && settings.lifecycle==='Pre Tournament' && <div className="hero-card__countdown"><Countdown date={settings.eventDate}/></div>}</> : slide===1 ? <>
        <div className="hero-card__prize-copy"><p className="hero-card__eyebrow">Tournament prize</p><h2 className="display hero-card__amount">{money(settings.prize)}</h2><p className="hero-card__prize-note">{settings.numberOfTeams} teams.<br/><strong>One champion.</strong></p></div><PrizeTrophy/>
      </> : <><p className="hero-card__eyebrow">Beyond the touchline</p><h2 className="display hero-card__culture">Make<br/><span>your mark.</span></h2><p className="hero-card__venue">Football, food and local culture in one arena.</p>{settings.modules.vendors && <button type="button" className="hero-card__link" onClick={()=>go('vendors')}>Explore the village<ArrowUpRight size={16}/></button>}</>}
    </div>
    <footer className="hero-card__footer"><div className="hero-card__pagination" aria-label="Highlight slides">{[0,1,2].map(index=><button type="button" key={index} aria-label={`Show slide ${index+1}`} aria-pressed={slide===index} onClick={()=>onSelect(index)}><span/></button>)}</div><span className="hero-card__edition">BEST5 / 5-A-SIDE</span><button type="button" className="hero-card__play" onClick={onToggle}>{paused?<Play size={12}/>:<Pause size={12}/>}<span>{paused?'Play slides':'Pause slides'}</span></button></footer>
  </section>;
}
