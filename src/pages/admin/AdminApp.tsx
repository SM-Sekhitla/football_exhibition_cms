import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { authService } from '@/services/authService';
import { settingsService, activityService } from '@/services/cmsServices';
import { repository } from '@/lib/storage';
import { canNavigate, useDataRevision } from '@/lib/ux';
import { Dialog } from '@/components/shared/Dialog';
import { AdminPageHeader, EmptyState, StatCard } from '@/components/admin/AdminUi';
import { AdminLoginPage } from './AdminLoginPage';
import AdminPostEditorPage from './posts/AdminPostEditorPage';
import AdminLandingPage from './landing/AdminLandingPage';
import AdminVendorsPage from './vendors/AdminVendorsPage';
import AdminSocialLinksPage from './settings/AdminSocialLinksPage';
import { ApplicationsPage, FixturesPage } from './OperationsPages';
import { BrandingPage, GalleryPage, MediaPage, ModulesPage, PostsPage, SettingsPage, TeamsPage } from './ManagementPages';

const nav = [['Dashboard','/admin'],['Landing Page','/admin/landing'],['Posts','/admin/posts'],['Fixtures & Results','/admin/fixtures'],['Media','/admin/media'],['Gallery','/admin/media/gallery'],['Vendors','/admin/vendors'],['Vendor Applications','/admin/vendor-registrations'],['Teams','/admin/teams'],['Team Registrations','/admin/team-registrations'],['Settings','/admin/settings'],['Modules','/admin/settings/modules'],['Social Links','/admin/settings/social'],['Branding','/admin/media/branding']];
export default function AdminApp() {
  useDataRevision();
  const [loggedIn,setLoggedIn] = useState(authService.isAuthenticated);
  const [path,setPath] = useState(location.pathname.replace(/\/$/,'') || '/admin'); const [drawer,setDrawer] = useState(false);
  const navigate = (next: string) => { if (!canNavigate()) return; history.pushState({},'',next); setPath(next); setDrawer(false); window.scrollTo(0,0); };
  useEffect(() => { const pop = () => { if (!canNavigate()) { history.pushState({},'',path); return; } setPath(location.pathname.replace(/\/$/,'') || '/admin'); setDrawer(false); }; addEventListener('popstate',pop); return () => removeEventListener('popstate',pop); }, [path]);
  if (!loggedIn) return <AdminLoginPage navigate={next => { setLoggedIn(authService.isAuthenticated()); history.replaceState({},'',next); setPath(next); }}/>;
  const current = path === '/admin/login' ? '/admin' : path;
  const navigation = <><div className="mb-6 flex justify-between"><img src={settingsService.get().branding.mainLogo} className="h-12 w-12 rounded-lg object-cover" alt="BEST5"/>{drawer && <button className="btn-secondary lg:hidden" aria-label="Close admin navigation" onClick={() => setDrawer(false)}><X/></button>}</div><nav aria-label="Admin navigation">{nav.map(([label,url]) => <button key={url} onClick={() => navigate(url)} aria-current={current === url ? 'page' : undefined} className={`mb-1 flex min-h-11 w-full items-center rounded-xl px-4 py-3 text-left text-xs font-bold uppercase ${current === url ? 'bg-[#c8ff4b] text-[#07100c]' : 'text-white/75 hover:bg-white/5'}`}>{label}</button>)}</nav><button className="btn-secondary mt-6 text-red-300" onClick={() => { if (canNavigate()) { authService.logout(); setLoggedIn(false); history.replaceState({},'','/admin/login'); setPath('/admin/login'); } }}>Logout</button></>;
  return <div className="min-h-screen bg-[#0b1410] text-white"><aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto border-r border-white/10 bg-[#07100c] p-5 lg:block">{navigation}</aside>{drawer && <Dialog label="Admin navigation" onClose={() => setDrawer(false)}><div className="panel max-w-md">{navigation}</div></Dialog>}<div className="lg:pl-72"><header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-2 border-b border-white/10 bg-[#0b1410]/95 px-4"><button className="btn-secondary lg:hidden" aria-label="Open admin navigation" aria-expanded={drawer} onClick={() => setDrawer(true)}><Menu size={20}/></button><span className="text-[10px] font-bold uppercase tracking-wider text-[#c8ff4b]">Operations platform</span><a href="/" onClick={e => { if (!canNavigate()) e.preventDefault(); }} className="btn-secondary shrink-0">View site</a></header><main className="min-w-0 p-4 sm:p-5 lg:p-10"><AdminRoutes key={current} path={current} navigate={navigate}/></main></div></div>;
}
function AdminRoutes({ path,navigate }: { path:string; navigate:(path:string)=>void }) {
  if (path === '/admin') return <Dashboard navigate={navigate}/>;
  if (path === '/admin/landing') return <AdminLandingPage/>;
  if (path === '/admin/vendors') return <AdminVendorsPage/>;
  if (path === '/admin/settings/social') return <AdminSocialLinksPage/>;
  if (path === '/admin/posts/new') return <AdminPostEditorPage navigate={navigate}/>;
  const edit = path.match(/^\/admin\/posts\/([^/]+)\/edit$/);
  if (edit) return <AdminPostEditorPage id={edit[1]} navigate={navigate}/>;
  if (path === '/admin/posts') return <PostsPage navigate={navigate}/>;
  if (path === '/admin/fixtures') return <FixturesPage/>;
  if (path === '/admin/media') return <MediaPage/>;
  if (path === '/admin/media/gallery') return <GalleryPage/>;
  if (path === '/admin/media/branding') return <BrandingPage/>;
  if (path === '/admin/teams') return <TeamsPage/>;
  if (path === '/admin/team-registrations') return <ApplicationsPage kind="team"/>;
  if (path === '/admin/vendor-registrations') return <ApplicationsPage kind="vendor"/>;
  if (path === '/admin/settings/modules') return <ModulesPage/>;
  if (path === '/admin/settings') return <SettingsPage/>;
  return <><AdminPageHeader title="Page not found"/><button className="btn-primary" onClick={() => navigate('/admin')}>Back to dashboard</button></>;
}
function Dashboard({ navigate }: { navigate:(p:string)=>void }) {
  const stats = [['Official teams',repository.getTeams().length,'/admin/teams'],['Pending teams',repository.getTeamRegistrations().filter(r => r.status === 'Pending').length,'/admin/team-registrations'],['Pending vendors',repository.getVendorRegistrations().filter(r => r.status === 'Pending').length,'/admin/vendor-registrations'],['Published posts',repository.getPosts().filter(p => p.status === 'Published').length,'/admin/posts'],['Fixtures',repository.getFixtures().length,'/admin/fixtures']] as const;
  return <><AdminPageHeader title="Dashboard"/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{stats.map(([label,value,path]) => <button className="text-left" key={label} onClick={() => navigate(path)}><StatCard label={label} value={value}/></button>)}</div><section className="panel mt-8"><h2 className="display text-3xl font-bold">Recent activity</h2>{activityService.getAll().slice(0,8).map(a => <div key={a.id} className="flex flex-wrap justify-between gap-3 border-b border-white/10 py-4 text-sm"><span>{a.message}</span><time className="text-white/60">{new Date(a.createdAt).toLocaleString()}</time></div>)}{!activityService.getAll().length && <EmptyState text="Activity appears as you use the CMS."/>}</section></>;
}
