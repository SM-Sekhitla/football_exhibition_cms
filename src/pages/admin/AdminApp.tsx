import { InvitationPage, PasswordPage, RecoveryPage, UsersPage } from './AccountPages';
import LogsPage from './LogsPage';
import { hasPendingSaves } from '@/lib/api';
import { toast } from '@/components/shared/Toast';
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

import AdminRegistrationPage from './settings/AdminRegistrationPage';

const nav = [['Dashboard','/admin'],['Backend Logs','/admin/logs'],['Landing Page','/admin/landing'],['Posts','/admin/posts'],['Fixtures & Results','/admin/fixtures'],['Media','/admin/media'],['Gallery','/admin/media/gallery'],['Vendors','/admin/vendors'],['Vendor Applications','/admin/vendor-registrations'],['Teams','/admin/teams'],['Team Registrations','/admin/team-registrations'],['Settings','/admin/settings']];
export default function AdminApp() {
  useDataRevision();
  const [,setAccountRevision] = useState(0);
  const [loggedIn,setLoggedIn] = useState(authService.isAuthenticated);
  const [path,setPath] = useState(canonicalPath(location.pathname.replace(/\/$/,'') || '/admin')); const [drawer,setDrawer] = useState(false);
  const navigate = (next: string) => { if (!canNavigate()) return; next=canonicalPath(next); history.pushState({},'',next); setPath(next); setDrawer(false); window.scrollTo(0,0); };
  useEffect(() => { const pop = () => { if (!canNavigate()) { history.pushState({},'',path); return; } setPath(canonicalPath(location.pathname.replace(/\/$/,'') || '/admin')); setDrawer(false); }; addEventListener('popstate',pop); return () => removeEventListener('popstate',pop); }, [path]);
  useEffect(() => { const expire = () => { setLoggedIn(false); void authService.expire(); }; addEventListener('best5:session-expired',expire); return () => removeEventListener('best5:session-expired',expire); }, []);
  if (path === '/admin/accept-invitation') return <InvitationPage/>;
  if (path === '/admin/forgot-password' || path === '/admin/reset-password') return <RecoveryPage reset={path === '/admin/reset-password'}/>;
  if (!loggedIn) return <AdminLoginPage navigate={next => { setLoggedIn(authService.isAuthenticated()); history.replaceState({},'',next); setPath(next); }}/>;
  if (authService.currentUser()?.mustChangePassword) return <main className="flex min-h-screen items-center justify-center bg-[#07100c] p-5 text-white sm:p-8"><PasswordPage required onChanged={() => setAccountRevision(n=>n+1)}/></main>;
  const current = path === '/admin/login' ? '/admin' : path;
  const navigation = <><div className="mb-6 flex justify-between"><img src={settingsService.get().branding.mainLogo} className="h-12 w-12 rounded-lg object-cover" alt="BEST5"/>{drawer && <button className="btn-secondary lg:hidden" aria-label="Close admin navigation" onClick={() => setDrawer(false)}><X/></button>}</div><nav aria-label="Admin navigation">{nav.filter(([,url]) => allowed(url)).map(([label,url]) => <button key={url} onClick={() => navigate(url)} aria-current={navigationSelected(current,url) ? 'page' : undefined} className={`mb-1 flex min-h-11 w-full items-center rounded-xl px-4 py-3 text-left text-xs font-bold uppercase ${navigationSelected(current,url) ? 'bg-[#c8ff4b] text-[#07100c]' : 'text-white/75 hover:bg-white/5'}`}>{label}</button>)}</nav><button className="btn-secondary mt-6 text-red-300" onClick={async () => { if (hasPendingSaves()) { toast.info('Wait for your changes to finish saving.'); return; } if (canNavigate()) { try { await authService.logout(); setLoggedIn(false); history.replaceState({},'','/admin/login'); setPath('/admin/login'); } catch (err) { toast.error('Could not sign out', err instanceof Error ? err.message : 'Please try again.'); } } }}>Logout</button></>;
  return <div className="min-h-screen bg-[#0b1410] text-white"><aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto border-r border-white/10 bg-[#07100c] p-5 lg:block">{navigation}</aside>{drawer && <Dialog label="Admin navigation" onClose={() => setDrawer(false)}><div className="panel max-w-md">{navigation}</div></Dialog>}<div className="lg:pl-72"><header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-2 border-b border-white/10 bg-[#0b1410]/95 px-4"><button className="btn-secondary lg:hidden" aria-label="Open admin navigation" aria-expanded={drawer} onClick={() => setDrawer(true)}><Menu size={20}/></button><span className="text-[10px] font-bold uppercase tracking-wider text-[#c8ff4b]">Operations platform</span><span data-testid="admin-role" className="text-xs text-white/65">{roleLabel(authService.currentUser()?.role || '')}</span><a href="/" onClick={e => { if (!canNavigate()) e.preventDefault(); }} className="btn-secondary shrink-0">View site</a></header><main className="min-w-0 p-4 sm:p-5 lg:p-10">{(current.startsWith('/admin/settings') || current === '/admin/media/branding') && <SettingsNavigation current={current} navigate={navigate}/>}<AdminRoutes key={current} path={current} navigate={navigate}/></main></div></div>;
}
function navigationSelected(path:string,url:string) {
  return path===url || (url==='/admin/settings' && (path.startsWith('/admin/settings/') || path==='/admin/media/branding'));
}
function canonicalPath(path:string) {
  return path === '/admin/account' ? '/admin/settings/account' : path === '/admin/users' ? '/admin/settings/users' : path;
}
function roleLabel(role:string) { return role === 'super_admin' ? 'Super admin' : role.charAt(0).toUpperCase()+role.slice(1); }
function allowed(path: string) {
  path=canonicalPath(path);
  if (['/admin','/admin/settings','/admin/settings/account'].includes(path)) return true;
  const permission = path === '/admin/settings/users' ? 'users:manage' : path.startsWith('/admin/logs') ? 'logs:read' : /^\/admin\/(teams|fixtures|team-registrations|vendor-registrations)/.test(path) ? 'operations:write' : (path.startsWith('/admin/settings') || path === '/admin/media/branding') ? 'settings:write' : 'content:write';
  return authService.can(permission);
}
function SettingsNavigation({current,navigate}:{current:string;navigate:(path:string)=>void}) {
  const pages=[['My Account','/admin/settings/account'],['Staff & Roles','/admin/settings/users'],['Tournament','/admin/settings'],['Registration & Banking','/admin/settings/registration'],['Modules','/admin/settings/modules'],['Social Links','/admin/settings/social'],['Branding','/admin/media/branding']];
  return <nav aria-label="Settings pages" className="mb-8 flex flex-wrap gap-2">{pages.filter(([,url])=>url !== '/admin/settings' ? allowed(url) : authService.can('settings:write')).map(([label,url])=><button key={url} aria-current={current===url?'page':undefined} className={current===url?'btn-primary':'btn-secondary'} onClick={()=>navigate(url)}>{label}</button>)}</nav>;
}
function AdminRoutes({ path,navigate }: { path:string; navigate:(path:string)=>void }) {
  if (!allowed(path)) return <AdminPageHeader title="You do not have access to this page"/>;
  if (path === '/admin/settings/account') return <PasswordPage/>;
  if (path === '/admin/settings/users') return <UsersPage/>;
  if (path === '/admin/logs') return <LogsPage/>;
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
  if (path === '/admin/settings/registration') return <AdminRegistrationPage/>;
  if (path === '/admin/settings') return authService.can('settings:write') ? <SettingsPage/> : <PasswordPage/>;
  return <><AdminPageHeader title="Page not found"/><button className="btn-primary" onClick={() => navigate('/admin')}>Back to dashboard</button></>;
}
function Dashboard({ navigate }: { navigate:(p:string)=>void }) {
  const stats = [['Official teams',repository.getTeams().length,'/admin/teams'],['Pending teams',repository.getTeamRegistrations().filter(r => r.status === 'Pending').length,'/admin/team-registrations'],['Pending vendors',repository.getVendorRegistrations().filter(r => r.status === 'Pending').length,'/admin/vendor-registrations'],['Published posts',repository.getPosts().filter(p => p.status === 'Published').length,'/admin/posts'],['Fixtures',repository.getFixtures().length,'/admin/fixtures']] as const;
  return <><AdminPageHeader title="Dashboard"/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{stats.filter(([, ,path]) => allowed(path)).map(([label,value,path]) => <button className="text-left" key={label} onClick={() => navigate(path)}><StatCard label={label} value={value}/></button>)}</div>{authService.can('logs:read') && <section className="panel mt-8"><h2 className="display text-3xl font-bold">Recent activity</h2>{activityService.getAll().slice(0,8).map(a => <div key={a.id} className="flex flex-wrap justify-between gap-3 border-b border-white/10 py-4 text-sm"><span>{a.message}</span><time className="text-white/60">{new Date(a.createdAt).toLocaleString()}</time></div>)}{!activityService.getAll().length && <EmptyState text="Activity appears as you use the CMS."/>}</section>}</>;
}
