import { repository, type ApplicationStatus, type Fixture, type TeamRegistration, type VendorRegistration } from '@/lib/storage';
import { toast } from '@/components/shared/Toast';

export function reviewApplication(kind: 'team' | 'vendor', id: string, changes: { status: ApplicationStatus; reviewNote: string; paymentStatus: NonNullable<TeamRegistration['paymentStatus']> }) {
  if (kind === 'vendor') {
    repository.saveVendorRegistrations(repository.getVendorRegistrations().map(r => r.id === id ? { ...r, ...changes } : r));
  } else {
    const applications = repository.getTeamRegistrations(); const item = applications.find(r => r.id === id); if (!item) throw new Error('Application no longer exists. Refresh the list.');
    let teams = repository.getTeams(); let officialTeamId = item.officialTeamId;
    if (changes.status !== 'Approved' && officialTeamId) {
      if (repository.getFixtures().some(f => f.homeId === officialTeamId || f.awayId === officialTeamId)) throw new Error('Remove this team from its fixtures before changing approval. Existing match records must be resolved first.');
      teams = teams.filter(t => t.id !== officialTeamId); officialTeamId = undefined;
    }
    if (changes.status === 'Approved' && !teams.some(t => t.id === officialTeamId)) {
      officialTeamId = crypto.randomUUID();
      teams.push({ id: officialTeamId, name: item.teamName, short: item.teamName.split(/\s+/).map(n => n[0]).join('').slice(0,3), captain: item.captain, city: item.city, group: 'Unassigned', logo: item.logo || '', players: item.players.map((name,i) => ({ id: `${officialTeamId}-${i}`, name, number: i+1, position: i === 0 ? 'GK' : 'FW' })) });
    }
    const previousTeams = repository.getTeams();
    repository.saveTeams(teams);
    try { repository.saveTeamRegistrations(applications.map(r => r.id === id ? { ...r, ...changes, officialTeamId } : r)); }
    catch (error) { repository.saveTeams(previousTeams); throw error; }
  }
  toast.success('Application updated', changes.status);
}

export function removeOfficialTeam(id: string) {
  if (repository.getFixtures().some(f => f.homeId === id || f.awayId === id)) throw new Error('This team is assigned to fixtures. Update those fixtures before removing it.');
  repository.saveTeams(repository.getTeams().filter(t => t.id !== id));
  repository.saveTeamRegistrations(repository.getTeamRegistrations().map(r => r.officialTeamId === id ? { ...r, officialTeamId: undefined, status: 'Pending' } : r));
  toast.success('Team removed', 'Any linked application is pending review again.');
}

export function saveFixture(fixture: Fixture) {
  const teams = repository.getTeams();
  if (!teams.some(t => t.id === fixture.homeId) || !teams.some(t => t.id === fixture.awayId)) throw new Error('Choose two official teams.');
  if (fixture.homeId === fixture.awayId) throw new Error('Home and away teams must be different.');
  if (!fixture.date || !fixture.time || !fixture.pitch.trim()) throw new Error('Date, kick-off time and pitch are required.');
  if (!Number.isFinite(new Date(fixture.date).getTime())) throw new Error('Choose a valid match date.');
  if (fixture.stage === 'Group Stage' && teams.some(t => [fixture.homeId,fixture.awayId].includes(t.id) && t.group !== fixture.group)) throw new Error('Both teams must belong to the selected group. Assign their groups before scheduling this match.');
  if (fixture.stage !== 'Group Stage' && fixture.group !== 'Knockout') throw new Error('Knockout matches must use the Knockout group.');
  if ([fixture.homeScore, fixture.awayScore].some(score => score !== undefined && (!Number.isInteger(score) || score < 0))) throw new Error('Scores must be whole numbers of zero or more.');
  const all = repository.getFixtures();
  if (fixture.status !== 'Cancelled' && all.some(f => f.id !== fixture.id && f.status !== 'Cancelled' && new Date(f.date).toDateString() === new Date(fixture.date).toDateString() && f.time === fixture.time && (f.pitch.trim().toLowerCase() === fixture.pitch.trim().toLowerCase() || [f.homeId,f.awayId].some(id => id === fixture.homeId || id === fixture.awayId)))) throw new Error('A team or pitch already has a match at this date and time.');
  const next = fixture.status === 'Upcoming' ? { ...fixture, homeScore: undefined, awayScore: undefined } : fixture;
  repository.saveFixtures(all.some(f => f.id === next.id) ? all.map(f => f.id === next.id ? next : f) : [...all,next]);
  toast.success('Match saved', next.status);
}

export function applicationName(item: TeamRegistration | VendorRegistration) { return 'teamName' in item ? item.teamName : item.business; }
