export type Lifecycle = 'Pre Tournament' | 'Matchday' | 'Completed';
export type FixtureStatus = 'Upcoming' | 'Live' | 'Half Time' | 'Full Time' | 'Cancelled';
export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Player { id: string; name: string; number: number; position: string; }
export interface Team { id: string; name: string; short: string; captain: string; city: string; group: string; logo: string; players: Player[]; }
export interface Fixture { id: string; stage: string; group: string; homeId: string; awayId: string; date: string; time: string; pitch: string; status: FixtureStatus; homeScore?: number; awayScore?: number; }
export interface Post { id: string; title: string; slug: string; category: string; excerpt: string; content: string; image: string; date: string; featured: boolean; status: 'Draft' | 'Published'; updatedAt?: string; }
export interface TeamRegistration { id: string; teamName: string; captain: string; email: string; city: string; players: string[]; status: ApplicationStatus; submitted: string; logo?: string; officialTeamId?: string; reviewNote?: string; paymentStatus?: 'Awaiting payment' | 'Under review' | 'Verified'; }
export interface VendorRegistration { id: string; business: string; contact: string; category: string; email: string; description?: string; status: ApplicationStatus; submitted: string; reviewNote?: string; paymentStatus?: 'Awaiting payment' | 'Under review' | 'Verified'; }
export type ModuleKey = 'news' | 'tournament' | 'fixtures' | 'results' | 'standings' | 'knockout' | 'teams' | 'teamRegistration' | 'vendorRegistration' | 'vendors' | 'gallery' | 'sponsors' | 'countdown' | 'liveScores' | 'homepageNews' | 'homepageTeams' | 'homepageSponsors';
export interface Settings { lifecycle: Lifecycle; tournamentName: string; eventDate: string; venue: string; city: string; prize: number; numberOfTeams: number; affiliationFee: number; spotBookingFee: number; vendorStallFee: number; contactEmail: string; contactPhone: string; whatsapp: string; instagram: string; facebook: string; twitter: string; youtube: string; tiktok: string; branding: { mainLogo: string; lightLogo: string; favicon: string }; modules: Record<ModuleKey, boolean>; }

const keys = {
  teams: 'best5_teams', fixtures: 'best5_fixtures', posts: 'best5_posts', teamRegs: 'best5_team_registrations', vendorRegs: 'best5_vendor_registrations', settings: 'best5_settings',
} as const;

function crest(short: string, color: string): string {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
    + '<rect width="100" height="100" rx="24" fill="#101914"/>'
    + '<path d="M50 8 84 22v25c0 23-14 38-34 45C30 85 16 70 16 47V22Z" fill="' + color + '"/>'
    + '<text x="50" y="59" text-anchor="middle" font-family="Arial" font-size="27" font-weight="900" fill="white">' + short + '</text>'
    + '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

const teamSeeds: [string, string, string, string, string, string, string][] = [
  ['T1', 'Polokwane City', 'PC', 'Thabo Mokoena', 'Polokwane', 'Group A', '#1d8b54'], ['T2', 'Mankweng Stars', 'MS', 'Kabelo Sekwati', 'Mankweng', 'Group A', '#d4a72c'], ['T3', 'Seshego United', 'SU', 'Mpho Maseko', 'Seshego', 'Group A', '#2785c4'], ['T4', 'Bendor Ballers', 'BB', 'Lehlohonolo Radebe', 'Bendor', 'Group A', '#c45b37'],
  ['T5', 'Ga-Mashashane FC', 'GM', 'Reneiloe Matlou', 'Ga-Mashashane', 'Group B', '#e7e8e5'], ['T6', 'CBD Rovers', 'CR', 'Tshepo Malatji', 'Polokwane CBD', 'Group B', '#a5445e'], ['T7', 'Limpopo Legends', 'LL', 'Mokgadi Mphahlele', 'Polokwane', 'Group B', '#518b45'], ['T8', 'The Vultures', 'TV', 'Musa Mthembu', 'Flora Park', 'Group B', '#d86d2b'],
  ['T9', 'University Lions', 'UL', 'Bongani Ndlovu', 'Mankweng', 'Group C', '#7f4ba5'], ['T10', 'Mokopane Elite', 'ME', 'Tumisang Moagi', 'Mokopane', 'Group C', '#247b93'], ['T11', 'Westenburg XI', 'WX', 'Masego Phala', 'Westenburg', 'Group C', '#e4bd36'], ['T12', 'Seshego Social', 'SS', 'Kgaugelo Molefe', 'Seshego', 'Group C', '#d94b4b'],
  ['T13', 'Riverside Athletic', 'RA', 'Katlego Nkosi', 'Polokwane', 'Group D', '#3c8b68'], ['T14', 'The Green Machine', 'TG', 'Olebogeng Mabuela', 'Bendor', 'Group D', '#7a9a32'], ['T15', 'Platinum City', 'PT', 'Karabo Ndlovu', 'Polokwane', 'Group D', '#9c9c9c'], ['T16', 'Rise & Shine', 'RS', 'Paballo Molefe', 'Mankweng', 'Group D', '#d69c47'],
];
const firstNames = ['Thabiso', 'Mpho', 'Kabelo', 'Lebo', 'Bongani'];
const lastNames = ['Molefe', 'Maseko', 'Nkosi', 'Mokoena', 'Phala'];

function buildPlayers(teamId: string): Player[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: teamId + '-p' + i,
    name: firstNames[i] + ' ' + lastNames[i],
    number: i + 1,
    position: i === 0 ? 'GK' : 'FW',
  }));
}

const teams: Team[] = teamSeeds.map(([id, name, short, captain, city, group, color]) => ({
  id, name, short, captain, city, group, logo: crest(short, color), players: buildPlayers(id),
}));

const fixtures: Fixture[] = [
  { id: 'F1', stage: 'Group Stage', group: 'Group A', homeId: 'T1', awayId: 'T2', date: '12 Dec 2026', time: '09:00', pitch: 'Pitch 1', status: 'Upcoming' },
  { id: 'F2', stage: 'Group Stage', group: 'Group A', homeId: 'T3', awayId: 'T4', date: '12 Dec 2026', time: '09:00', pitch: 'Pitch 2', status: 'Upcoming' },
  { id: 'F3', stage: 'Group Stage', group: 'Group B', homeId: 'T5', awayId: 'T6', date: '12 Dec 2026', time: '10:00', pitch: 'Pitch 1', status: 'Upcoming' },
  { id: 'F4', stage: 'Group Stage', group: 'Group B', homeId: 'T7', awayId: 'T8', date: '12 Dec 2026', time: '10:00', pitch: 'Pitch 2', status: 'Upcoming' },
  { id: 'F5', stage: 'Group Stage', group: 'Group C', homeId: 'T9', awayId: 'T10', date: '12 Dec 2026', time: '11:00', pitch: 'Pitch 1', status: 'Upcoming' },
  { id: 'F6', stage: 'Group Stage', group: 'Group D', homeId: 'T13', awayId: 'T14', date: '12 Dec 2026', time: '12:00', pitch: 'Pitch 1', status: 'Upcoming' },
  { id: 'F7', stage: 'Quarter Final', group: 'Knockout', homeId: 'T1', awayId: 'T6', date: '12 Dec 2026', time: '15:00', pitch: 'Main Arena', status: 'Upcoming' },
];
const posts: Post[] = [
  { id: 'P1', title: 'The road to BEST5 begins now', slug: 'road-to-best5', category: 'Tournament', excerpt: 'Sixteen teams. One electric day. The countdown to Polokwane is officially on.', content: 'BEST5 is where local football energy meets a world-class tournament stage. With 16 teams entering the arena, every touch will matter.', image: '/assets/images/background-posters/WhatsApp_Image_2026-09-10_at_5.10.05_PM_(1).jpeg', date: '18 Aug 2026', featured: true, status: 'Published' },
  { id: 'P2', title: 'Affiliations are open', slug: 'affiliations-open', category: 'Announcements', excerpt: 'Secure your spot, build your squad and get ready to play for the R10,000 winner-takes-all prize.', content: 'Team affiliations are now open. Bring your best five and make your mark.', image: '/assets/images/background-posters/WhatsApp_Image_2026-09-10_at_5.10.05_PM.jpeg', date: '13 Aug 2026', featured: false, status: 'Published' },
  { id: 'P3', title: 'Meet the BEST5 mascot', slug: 'meet-the-mascot', category: 'Culture', excerpt: 'Meet the character bringing energy, style and a little mischief to matchday.', content: 'The BEST5 mascot is ready for the whistle. Find him pitch-side on 12 December.', image: '/assets/images/background-posters/WhatsApp_Image_2026-09-10_at_5.08.28_PM_(2).jpeg', date: '08 Aug 2026', featured: false, status: 'Published' },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T): T {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event('best5:data'));
  return value;
}

export const defaultSettings: Settings = { lifecycle: 'Pre Tournament', tournamentName: 'BEST5 Football Exhibition', eventDate: '2026-12-12T09:00:00', venue: 'Northern Muslim School', city: 'Polokwane', prize: 10000, numberOfTeams: 16, affiliationFee: 1500, spotBookingFee: 250, vendorStallFee: 350, contactEmail: 'admin@best5.co.za', contactPhone: '+27 72 000 5505', whatsapp: '+27 72 000 5505', instagram: 'https://instagram.com/bestfivefootball_exhibition', facebook: '', twitter: '', youtube: '', tiktok: '', branding: { mainLogo: '/assets/images/logo/smt_logo.png', lightLogo: '/assets/images/logo/smt_logo.png', favicon: '/assets/images/logo/smt_logo.png' }, modules: { news: true, tournament: true, fixtures: true, results: true, standings: true, knockout: true, teams: true, teamRegistration: true, vendorRegistration: true, vendors: true, gallery: true, sponsors: true, countdown: true, liveScores: true, homepageNews: true, homepageTeams: true, homepageSponsors: true } };

export const repository = {
  seed() {
    if (!localStorage.getItem(keys.teams)) write(keys.teams, teams);
    if (!localStorage.getItem(keys.fixtures)) write(keys.fixtures, fixtures);
    if (!localStorage.getItem(keys.posts)) write(keys.posts, posts);
    if (!localStorage.getItem(keys.teamRegs)) write(keys.teamRegs, []);
    if (!localStorage.getItem(keys.vendorRegs)) write(keys.vendorRegs, []);
    if (!localStorage.getItem(keys.settings)) write(keys.settings, defaultSettings);
  },
  getTeams: () => read<Team[]>(keys.teams, teams),
  getFixtures: () => read<Fixture[]>(keys.fixtures, fixtures),
  getPosts: () => read<Post[]>(keys.posts, posts),
  getTeamRegistrations: () => read<TeamRegistration[]>(keys.teamRegs, []),
  getVendorRegistrations: () => read<VendorRegistration[]>(keys.vendorRegs, []),
  getSettings: () => { const saved = read<Partial<Settings>>(keys.settings, defaultSettings); return { ...defaultSettings, ...saved, branding: { ...defaultSettings.branding, ...saved.branding }, modules: { ...defaultSettings.modules, ...saved.modules } }; },
  saveTeams: (value: Team[]) => write(keys.teams, value),
  saveFixtures: (value: Fixture[]) => write(keys.fixtures, value),
  savePosts: (value: Post[]) => write(keys.posts, value),
  saveTeamRegistrations: (value: TeamRegistration[]) => write(keys.teamRegs, value),
  saveVendorRegistrations: (value: VendorRegistration[]) => write(keys.vendorRegs, value),
  saveSettings: (value: Settings) => write(keys.settings, value),
};
