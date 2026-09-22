import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { repository, type Fixture, type Team } from '@/lib/storage';

export function PageShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-5 pb-24 pt-36 lg:px-8"><div className="mb-14 border-b border-white/10 pb-10"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#c8ff4b]">{eyebrow}</p><h1 className="display text-[clamp(2.5rem,12vw,4.5rem)] font-black uppercase leading-none md:text-7xl">{title}</h1></div>{children}</main>;
}
export function Empty({ text }: { text: string }) { return <p className="panel text-sm text-white/65" role="status">{text}</p>; }
export function TeamMark({ team, large = false }: { team?: Team; large?: boolean }) {
  return team?.logo ? <img src={team.logo} alt={`${team.name} crest`} className={`${large ? 'h-20 w-20' : 'h-10 w-10'} shrink-0 object-contain`} /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-bold">{team?.short || 'TBD'}</span>;
}
export function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#c8ff4b]">{eyebrow}</p><h2 className="display text-5xl font-black uppercase leading-none md:text-6xl">{title}</h2></div>{action && <button onClick={onAction} className="btn-secondary">{action}<ArrowRight size={15}/></button>}</div>;
}
export function Countdown({ date }: { date: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const distance = Math.max(0, new Date(date).getTime() - now);
  if (!Number.isFinite(distance) || distance === 0) return <p className="text-sm text-[#c8ff4b]">The wait is over. Follow the tournament centre.</p>;
  const values = { days: Math.floor(distance / 86400000), hours: Math.floor(distance / 3600000) % 24, minutes: Math.floor(distance / 60000) % 60, seconds: Math.floor(distance / 1000) % 60 };
  return <div className="grid grid-cols-4 gap-2">{Object.entries(values).map(([key, value]) => <div key={key} className="min-w-0 rounded-xl border border-white/15 bg-black/30 px-1 py-3 text-center"><strong className="display block text-3xl">{String(value).padStart(2, '0')}</strong><span className="text-[9px] uppercase text-white/65">{key}</span></div>)}</div>;
}
export function MatchCard({ fixture, teams }: { fixture: Fixture; teams: Team[] }) {
  const live = fixture.status === 'Live' || fixture.status === 'Half Time';
  const hideScore = live && !repository.getSettings().modules.liveScores;
  return <article className="panel"><div className="mb-4 flex flex-wrap justify-between gap-2 text-xs text-white/65"><span>{fixture.group} · {fixture.stage}</span><b className={live ? 'text-[#c8ff4b]' : ''}>{fixture.status}</b></div><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">{[fixture.homeId, fixture.awayId].map((id, index) => <div key={index} className={index ? 'col-start-3 row-start-1' : ''}><div className="flex justify-center"><TeamMark team={teams.find(t => t.id === id)}/></div><b className="mt-2 block break-words text-xs">{teams.find(t => t.id === id)?.name || 'To be confirmed'}</b></div>)}<div className="col-start-2 row-start-1"><strong className="display text-2xl">{fixture.status === 'Cancelled' ? '—' : fixture.status === 'Upcoming' ? fixture.time : hideScore ? 'In play' : `${fixture.homeScore ?? 0} – ${fixture.awayScore ?? 0}`}</strong></div></div><p className="mt-4 text-center text-xs text-white/60">{fixture.date} · {fixture.pitch}</p></article>;
}
