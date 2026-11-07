import { useState } from 'react';
import { repository } from '@/lib/storage';
import { Empty, MatchCard, PageShell, TeamMark } from '@/components/shared/PublicUi';
import { eventDate, money } from '@/lib/ux';

export default function Tournament() {
  const settings = repository.getSettings(); const teams = repository.getTeams(); const fixtures = repository.getFixtures(); const modules = settings.modules;
  const tabs = ['Overview', ...(['Fixtures', 'Results', 'Standings', 'Knockout', 'Teams'] as const).filter(t => modules[t.toLowerCase() as 'fixtures' | 'results' | 'standings' | 'knockout' | 'teams'])];
  const [selected, setSelected] = useState('Overview'); const tab = tabs.includes(selected) ? selected : 'Overview';
  const [group, setGroup] = useState('All groups');
  const groups = [...new Set(teams.map(t => t.group))];
  const stats = teams.map(team => ({ team, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
  fixtures.filter(f => f.status === 'Full Time' && f.stage === 'Group Stage').forEach(f => {
    const h = stats.find(s => s.team.id === f.homeId), a = stats.find(s => s.team.id === f.awayId); if (!h || !a) return;
    const hs = f.homeScore ?? 0, as = f.awayScore ?? 0; h.p++; a.p++; h.gf += hs; h.ga += as; a.gf += as; a.ga += hs;
    if (hs > as) { h.w++; h.pts += 3; a.l++; } else if (as > hs) { a.w++; a.pts += 3; h.l++; } else { h.d++; a.d++; h.pts++; a.pts++; }
  });
  const shown = fixtures.filter(f => (group === 'All groups' || f.group === group) && (tab === 'Results' ? f.status === 'Full Time' : f.status !== 'Full Time'));
  return <PageShell title="Tournament centre" eyebrow={settings.lifecycle}><div className="mb-8 flex gap-2 overflow-x-auto pb-3" aria-label="Tournament sections">{tabs.map(t => <button key={t} aria-pressed={t === tab} className={`${t === tab ? 'btn-primary' : 'btn-secondary'} shrink-0`} onClick={() => setSelected(t)}>{t}</button>)}</div>
    {tab === 'Overview' && <div className="panel"><p className="text-[#c8ff4b]">{eventDate(settings.eventDate)} · {settings.venue} · {settings.city}</p><h2 className="display my-5 text-5xl font-black uppercase">{settings.numberOfTeams} teams. One champion.</h2><p className="text-white/70">Prize: {money(settings.prize)}. {settings.lifecycle === 'Completed' ? 'The tournament is complete. Explore the final results and standings.' : settings.lifecycle === 'Matchday' ? 'Matchday is here. Follow confirmed scores and fixture updates.' : 'The competition is taking shape. Fixtures are published as they are confirmed.'}</p></div>}
    {['Fixtures', 'Results', 'Standings'].includes(tab) && <label className="mb-5 block max-w-sm text-sm">Filter by group<select className="field mt-2" value={group} onChange={e => setGroup(e.target.value)}><option>All groups</option>{groups.map(g => <option key={g}>{g}</option>)}<option>Knockout</option></select></label>}
    {['Fixtures', 'Results'].includes(tab) && (shown.length ? <div className="grid gap-4 md:grid-cols-2">{shown.map(f => <MatchCard key={f.id} fixture={f} teams={teams}/>)}</div> : <Empty text={tab === 'Results' ? 'No final results for this selection yet.' : 'No fixtures for this selection yet.'}/>)}
    {tab === 'Standings' && <><p className="mb-4 text-sm text-white/65">Group-stage matches only. Win: 3 points; draw: 1. Swipe tables to see all statistics.</p>{groups.filter(g => group === 'All groups' || g === group).map(g => <section key={g} className="mb-8"><h2 className="display mb-3 text-3xl font-bold">{g}</h2><div className="overflow-x-auto rounded-2xl border border-white/10" tabIndex={0} aria-label={`${g} standings`}><table className="w-full min-w-[580px] text-left text-sm"><caption className="sr-only">{g} standings</caption><thead className="bg-white/5"><tr>{['Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map(h => <th key={h} scope="col" className="p-3">{h}</th>)}</tr></thead><tbody>{stats.filter(s => s.team.group === g).sort((a,b) => b.pts - a.pts || (b.gf-b.ga)-(a.gf-a.ga) || b.gf-a.gf || a.team.name.localeCompare(b.team.name)).map(s => <tr key={s.team.id} className="border-t border-white/10"><th scope="row" className="p-3">{s.team.name}</th>{[s.p,s.w,s.d,s.l,s.gf,s.ga,s.gf-s.ga,s.pts].map((n,i) => <td key={i} className="p-3">{n}</td>)}</tr>)}</tbody></table></div></section>)}</>}
    {tab === 'Knockout' && <div className="grid gap-6 lg:grid-cols-3">{['Quarter Final', 'Semi Final', 'Final'].map(stage => <section key={stage}><h2 className="display mb-4 text-3xl font-bold uppercase">{stage}</h2><div className="space-y-4">{fixtures.filter(f => f.stage === stage).map(f => <MatchCard key={f.id} fixture={f} teams={teams}/>)}{!fixtures.some(f => f.stage === stage) && <Empty text="Matchups will appear once confirmed by the organiser."/>}</div></section>)}</div>}
    {tab === 'Teams' && <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{teams.map(t => <div key={t.id} className="panel"><TeamMark team={t}/><b className="mt-3 block">{t.name}</b><p className="mt-2 text-xs text-[#c8ff4b]">{t.group}</p></div>)}</div>}
  </PageShell>;
}
