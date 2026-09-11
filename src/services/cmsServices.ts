import { defaultSettings, repository, type ApplicationStatus, type Post, type Settings, type Team } from '@/lib/storage';

export interface MediaItem { id: string; name: string; src: string; type: string; category: string; createdAt: string; }
export interface GalleryItem extends MediaItem { caption: string; featured: boolean; visible: boolean; order: number; }
export interface Activity { id: string; message: string; createdAt: string; }

const MEDIA = 'best5_media', GALLERY = 'best5_gallery', ACTIVITY = 'best5_activity';
const read = <T,>(key: string, fallback: T): T => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } };
const write = <T,>(key: string, value: T) => { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event('best5:data')); return value; };
const activity = (message: string) => write(ACTIVITY, [{ id: crypto.randomUUID(), message, createdAt: new Date().toISOString() }, ...read<Activity[]>(ACTIVITY, [])].slice(0, 50));

export const postService = {
  getAll: repository.getPosts,
  getPublished: () => repository.getPosts().filter(post => post.status === 'Published'),
  getById: (id: string) => repository.getPosts().find(post => post.id === id),
  save(post: Post) { const all = repository.getPosts(); const value = { ...post, updatedAt: new Date().toISOString() }; repository.savePosts(all.some(p => p.id === post.id) ? all.map(p => p.id === post.id ? value : p) : [value, ...all]); activity(`${post.title} ${post.status === 'Published' ? 'published' : 'saved as draft'}`); return value; },
  delete(id: string) { const post = this.getById(id); repository.savePosts(repository.getPosts().filter(item => item.id !== id)); if (post) activity(`${post.title} deleted`); },
  setStatus(id: string, status: Post['status']) { const post = this.getById(id); if (post) this.save({ ...post, status }); },
};

export const settingsService = {
  get: repository.getSettings,
  update(value: Partial<Settings>) { const next = { ...repository.getSettings(), ...value }; repository.saveSettings(next); activity('Tournament settings updated'); window.dispatchEvent(new Event('best5:data')); return next; },
  isModuleEnabled(key: keyof Settings['modules']) { return repository.getSettings().modules[key] !== false; },
  resetBranding() { return this.update({ branding: defaultSettings.branding }); },
};

export const mediaService = {
  getAll: () => read<MediaItem[]>(MEDIA, []),
  add(item: MediaItem) { activity(`${item.name} uploaded`); return write(MEDIA, [item, ...this.getAll()]); },
  delete(id: string) { return write(MEDIA, this.getAll().filter(item => item.id !== id)); },
};
export const galleryService = {
  getAll: () => read<GalleryItem[]>(GALLERY, []),
  save(items: GalleryItem[]) { return write(GALLERY, items); },
  add(item: GalleryItem) { activity('Gallery image uploaded'); return this.save([...this.getAll(), item]); },
  delete(id: string) { return this.save(this.getAll().filter(item => item.id !== id)); },
};
export const teamService = {
  getOfficialTeams: repository.getTeams,
  approveRegistration(id: string) { const regs = repository.getTeamRegistrations(); const registration = regs.find(r => r.id === id); if (!registration) return; let teams = repository.getTeams(); let officialTeamId = registration.officialTeamId; if (!officialTeamId) { officialTeamId = crypto.randomUUID(); const team: Team = { id: officialTeamId, name: registration.teamName, short: registration.teamName.split(/\s+/).map(x => x[0]).join('').slice(0, 3).toUpperCase(), captain: registration.captain, city: registration.city, group: 'Unassigned', logo: registration.logo ?? '', players: registration.players.map((name, i) => ({ id: `${officialTeamId}-${i}`, name, number: i + 1, position: i === 0 ? 'GK' : 'FW' })) }; teams = [...teams, team]; repository.saveTeams(teams); }
    repository.saveTeamRegistrations(regs.map(r => r.id === id ? { ...r, status: 'Approved', officialTeamId } : r)); activity(`${registration.teamName} registration approved`);
  },
  updateRegistration(id: string, status: ApplicationStatus) { if (status === 'Approved') return this.approveRegistration(id); repository.saveTeamRegistrations(repository.getTeamRegistrations().map(r => r.id === id ? { ...r, status } : r)); },
  saveTeams: repository.saveTeams,
};
export const activityService = { getAll: () => read<Activity[]>(ACTIVITY, []) };
