import { defaultSettings, repository, type ApplicationStatus, type Post, type Settings } from '@/lib/storage';
import { articleHtml } from '@/lib/ux';
import { reviewApplication } from './workflowService';
import { defaultLandingPage } from './landingPageService';
import { toast } from '@/components/shared/Toast';

export interface MediaItem { id: string; name: string; src: string; type: string; category: string; createdAt: string; }
export interface GalleryItem extends MediaItem { caption: string; featured: boolean; visible: boolean; order: number; }
export interface Activity { id: string; message: string; createdAt: string; }
export interface VendorProfile { id: string; name: string; category: string; description: string; image: string; website: string; visible: boolean; updatedAt: string; }

const MEDIA = 'best5_media', GALLERY = 'best5_gallery', ACTIVITY = 'best5_activity', VENDORS = 'best5_vendors';
const defaultGallery: GalleryItem[] = [...defaultLandingPage.heroImages, '/assets/images/background-posters/gal1.jpeg'].map((src,index) => ({ id:`default-gallery-${index}`,src,name:`BEST5 highlight ${index+1}`,caption:'BEST5 event artwork',category:'Gallery',type:'image/jpeg',createdAt:'2026-09-01T00:00:00Z',featured:index===0,visible:true,order:index }));
const read = <T,>(key: string, fallback: T): T => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } };
const write = <T,>(key: string, value: T) => { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event('best5:data')); return value; };
const activity = (message: string) => write(ACTIVITY, [{ id: crypto.randomUUID(), message, createdAt: new Date().toISOString() }, ...read<Activity[]>(ACTIVITY, [])].slice(0, 50));

export const postService = {
  getAll: repository.getPosts,
  getPublished: () => repository.getPosts().filter(post => post.status === 'Published'),
  getById: (id: string) => repository.getPosts().find(post => post.id === id),
  save(post: Post) {
    if (post.status === 'Published') {
      const plain = new DOMParser().parseFromString(articleHtml(post.content), 'text/html').body.textContent?.trim();
      if (!post.title.trim() || !post.slug.trim() || !post.excerpt.trim() || !plain) throw new Error('Add a title, slug, excerpt and article text before publishing.');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) throw new Error('Use a slug containing lowercase letters, numbers and hyphens.');
      if (!post.date || !Number.isFinite(new Date(post.date).getTime())) throw new Error('Choose a valid publication date.');
    }
    if (post.slug && repository.getPosts().some(p => p.id !== post.id && p.slug === post.slug)) throw new Error('This slug is already in use. Choose a unique article URL.');
    post = { ...post, content:articleHtml(post.content) };
    const all = repository.getPosts(); const value = { ...post, updatedAt: new Date().toISOString() }; repository.savePosts(all.some(p => p.id === post.id) ? all.map(p => p.id === post.id ? value : p) : [value, ...all]); activity(`${post.title} ${post.status === 'Published' ? 'published' : 'saved as draft'}`); toast.success(post.status === 'Published' ? 'Post published' : 'Draft saved', post.title); return value; },
  delete(id: string) { const post = this.getById(id); repository.savePosts(repository.getPosts().filter(item => item.id !== id)); if (post) { activity(`${post.title} deleted`); toast.success('Post deleted',post.title); } },
  setStatus(id: string, status: Post['status']) { const post = this.getById(id); if (post) this.save({ ...post, status }); },
};

export const settingsService = {
  get: repository.getSettings,
  update(value: Partial<Settings>) { const next = { ...repository.getSettings(), ...value }; repository.saveSettings(next); activity('Tournament settings updated'); window.dispatchEvent(new Event('best5:data')); toast.success('Settings updated'); return next; },
  isModuleEnabled(key: keyof Settings['modules']) { return repository.getSettings().modules[key] !== false; },
  resetBranding() { return this.update({ branding: defaultSettings.branding }); },
};

export const mediaService = {
  getAll: () => read<MediaItem[]>(MEDIA, []),
  add(item: MediaItem) { activity(`${item.name} uploaded`); return write(MEDIA, [item, ...this.getAll()]); },
  delete(id: string) { return write(MEDIA, this.getAll().filter(item => item.id !== id)); },
};
export const galleryService = {
  getAll: () => read<GalleryItem[]>(GALLERY, defaultGallery),
  save(items: GalleryItem[]) { return write(GALLERY, items); },
  add(item: GalleryItem) { activity('Gallery image uploaded'); return this.save([...this.getAll(), item]); },
  delete(id: string) { return this.save(this.getAll().filter(item => item.id !== id)); },
};
export const teamService = {
  getOfficialTeams: repository.getTeams,
  approveRegistration(id: string) { const item=repository.getTeamRegistrations().find(r=>r.id===id); if(item) reviewApplication('team',id,{status:'Approved',reviewNote:item.reviewNote||'',paymentStatus:item.paymentStatus||'Awaiting payment'}); },
  updateRegistration(id: string, status: ApplicationStatus) { const item = repository.getTeamRegistrations().find(r => r.id === id); if (item) reviewApplication('team',id,{ status,reviewNote:item.reviewNote || '',paymentStatus:item.paymentStatus || 'Awaiting payment' }); },
  saveTeams: repository.saveTeams,
};
export const activityService = { getAll: () => read<Activity[]>(ACTIVITY, []) };
export const vendorService = {
  getAll: () => read<VendorProfile[]>(VENDORS, []),
  save(item: VendorProfile) { const all=this.getAll(); write(VENDORS,all.some(x=>x.id===item.id)?all.map(x=>x.id===item.id?item:x):[item,...all]); activity(`${item.name} vendor profile saved`); toast.success('Vendor saved',item.name); },
  delete(id:string) { write(VENDORS,this.getAll().filter(x=>x.id!==id)); toast.success('Vendor deleted'); },
  getVisible() { return this.getAll().filter(x=>x.visible); },
};
