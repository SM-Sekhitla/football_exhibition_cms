import { api, applySnapshot, type Snapshot } from '@/lib/api';
import { repository, type ApplicationStatus, type Fixture, type TeamRegistration, type VendorRegistration } from '@/lib/storage';
import { toast } from '@/components/shared/Toast';

export async function reviewApplication(kind: 'team' | 'vendor', id: string, changes: { status: ApplicationStatus; reviewNote: string; paymentStatus: NonNullable<TeamRegistration['paymentStatus']> }) {
  applySnapshot(await api<Snapshot>(`/admin/registrations/${kind}/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }));
  toast.success('Application updated', changes.status);
}
export async function removeOfficialTeam(id: string) {
  applySnapshot(await api<Snapshot>(`/admin/teams/${id}`, { method: 'DELETE', body: '{}' }));
  toast.success('Team removed', 'Any linked application is pending review again.');
}
export async function saveFixture(fixture: Fixture) {
  const teams = repository.getTeams();
  if (!teams.some(t => t.id === fixture.homeId) || !teams.some(t => t.id === fixture.awayId)) throw new Error('Choose two official teams.');
  if (fixture.homeId === fixture.awayId) throw new Error('Home and away teams must be different.');
  if (!fixture.date || !fixture.time || !fixture.pitch.trim()) throw new Error('Date, kick-off time and pitch are required.');
  if (!Number.isFinite(new Date(fixture.date).getTime())) throw new Error('Choose a valid match date.');
  const all = repository.getFixtures();
  await repository.saveFixtures(all.some(f => f.id === fixture.id) ? all.map(f => f.id === fixture.id ? fixture : f) : [...all,fixture]);
  toast.success('Match saved', fixture.status);
}
export function applicationName(item: TeamRegistration | VendorRegistration) { return 'teamName' in item ? item.teamName : item.business; }
