import { readCache, saveResource } from './api';
export type Lifecycle = 'Pre Tournament' | 'Matchday' | 'Completed';
export type FixtureStatus = 'Upcoming' | 'Live' | 'Half Time' | 'Full Time' | 'Cancelled';
export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Player { id: string; name: string; number: number; position: string; }
export interface Team { id: string; name: string; short: string; captain: string; city: string; group: string; logo: string; players: Player[]; }
export interface Fixture { id: string; stage: string; group: string; homeId: string; awayId: string; date: string; time: string; pitch: string; status: FixtureStatus; homeScore?: number; awayScore?: number; }
export interface Post { id: string; title: string; slug: string; category: string; excerpt: string; content: string; image: string; date: string; featured: boolean; status: 'Draft' | 'Published'; updatedAt?: string; }
export interface TeamRegistration { id: string; teamName: string; captain: string; email: string; city: string; players: string[]; status: ApplicationStatus; submitted: string; proofOfPayment?: { name: string; data: string; type: string }; logo?: string; officialTeamId?: string; reviewNote?: string; paymentStatus?: 'Awaiting payment' | 'Under review' | 'Verified'; }
export interface VendorRegistration { id: string; business: string; contact: string; category: string; email: string; description?: string; status: ApplicationStatus; submitted: string; reviewNote?: string; paymentStatus?: 'Awaiting payment' | 'Under review' | 'Verified'; }
export type ModuleKey = 'news' | 'tournament' | 'fixtures' | 'results' | 'standings' | 'knockout' | 'teams' | 'teamRegistration' | 'vendorRegistration' | 'vendors' | 'gallery' | 'sponsors' | 'countdown' | 'liveScores' | 'homepageNews' | 'homepageTeams' | 'homepageSponsors';
export interface BankingDetails { bankName: string; accountNumber: string; accountName: string; accountType: string; branchCode: string; reference: string; }
export interface Settings { banking: BankingDetails; registrationPrerequisites: string; lifecycle: Lifecycle; tournamentName: string; eventDate: string; venue: string; city: string; prize: number; numberOfTeams: number; affiliationFee: number; spotBookingFee: number; vendorStallFee: number; contactEmail: string; contactPhone: string; whatsapp: string; instagram: string; facebook: string; twitter: string; youtube: string; tiktok: string; branding: { mainLogo: string; lightLogo: string; favicon: string }; modules: Record<ModuleKey, boolean>; }

const teams: Team[] = [];
const fixtures: Fixture[] = [];
const posts: Post[] = [
  { id: 'P1', title: 'The road to BEST5 begins now', slug: 'road-to-best5', category: 'Tournament', excerpt: 'Sixteen teams. One electric day. The countdown to Polokwane is officially on.', content: 'BEST5 is where local football energy meets a world-class tournament stage. With 16 teams entering the arena, every touch will matter.', image: '/assets/images/background-posters/WhatsApp_Image_2026-09-10_at_5.10.05_PM_(1).jpeg', date: '18 Aug 2026', featured: true, status: 'Published' },
  { id: 'P2', title: 'Affiliations are open', slug: 'affiliations-open', category: 'Announcements', excerpt: 'Secure your spot, build your squad and get ready to play for the R10,000 winner-takes-all prize.', content: 'Team affiliations are now open. Bring your best five and make your mark.', image: '/assets/images/background-posters/WhatsApp_Image_2026-09-10_at_5.10.05_PM.jpeg', date: '13 Aug 2026', featured: false, status: 'Published' },
  { id: 'P3', title: 'Meet the BEST5 mascot', slug: 'meet-the-mascot', category: 'Culture', excerpt: 'Meet the character bringing energy, style and a little mischief to matchday.', content: 'The BEST5 mascot is ready for the whistle. Find him pitch-side on 12 December.', image: '/assets/images/background-posters/WhatsApp_Image_2026-09-10_at_5.08.28_PM_(2).jpeg', date: '08 Aug 2026', featured: false, status: 'Published' },
];

export const defaultSettings: Settings = { banking: { bankName: 'Standard Bank', accountNumber: '10252684352', accountName: 'SMT ORGANISATION', accountType: 'Current Account', branchCode: '000205', reference: 'Use your team name and “SpotBook” as the reference (e.g. TeamName SpotBook).' }, registrationPrerequisites: `BEST FIVE 2026 TEAM REGISTRATION

Welcome to the BEST FIVE 2026 tournament registration! Thank you for choosing to be part of Limpopo’s biggest 5-a-side football tournament.

TEAM COMPOSITION
Participation spots are limited to the first 16 teams. Each team must have 5–8 players. One player will serve as team captain.

TEAM ENTRY FEE BREAKDOWN
Spot booking: R250
Affiliation fee: R1500
The spot booking fee is deducted from the affiliation fee and is not an additional fee.

REQUIRED DOCUMENT
Have your spot booking proof of payment (POP) ready as a PDF, JPG or PNG before starting. You must upload it when completing this form to reserve your spot. NO POP, NO REGISTRATION.
The spot booking fee is not refundable.

PAYMENT DEADLINES
50% (R625) of the remaining affiliation fee must be paid by 30 September 2026 and the balance before 30 November 2026 at 17:00. Late payments will be considered!

CAPTAINS’ GROUP
All team captains must join the captain’s group chat to keep up with important updates. Please send your team logo upon joining the group chat.
https://chat.whatsapp.com/DMNraaTNX3C5sfgd1fq9t?cs=cl&pi=i&lir=0&amv=0

QUESTIONS?
Contact Thato Modiba at 071 413 6394 or BEST5EXHIBITION@GMAIL.COM.`, lifecycle: 'Pre Tournament', tournamentName: 'BEST5 Football Exhibition', eventDate: '2026-12-12T09:00:00', venue: 'Northern Muslim School', city: 'Polokwane', prize: 10000, numberOfTeams: 16, affiliationFee: 1500, spotBookingFee: 250, vendorStallFee: 350, contactEmail: 'admin@best5.co.za', contactPhone: '+27 72 000 5505', whatsapp: '+27 72 000 5505', instagram: 'https://instagram.com/bestfivefootball_exhibition', facebook: '', twitter: '', youtube: '', tiktok: '', branding: { mainLogo: '/assets/images/logo/smt_logo.png', lightLogo: '/assets/images/logo/smt_logo.png', favicon: '/assets/images/logo/smt_logo.png' }, modules: { news: true, tournament: true, fixtures: true, results: true, standings: true, knockout: true, teams: true, teamRegistration: true, vendorRegistration: true, vendors: true, gallery: true, sponsors: true, countdown: true, liveScores: true, homepageNews: true, homepageTeams: true, homepageSponsors: true } };

export const repository = {
  getTeams: () => readCache<Team[]>('teams', teams),
  getFixtures: () => readCache<Fixture[]>('fixtures', fixtures),
  getPosts: () => readCache<Post[]>('posts', posts),
  getTeamRegistrations: () => readCache<TeamRegistration[]>('teamRegs', []),
  getVendorRegistrations: () => readCache<VendorRegistration[]>('vendorRegs', []),
  getSettings: () => readCache<Settings>('settings', defaultSettings),
  saveTeams: (value: Team[]) => saveResource('teams', value),
  saveFixtures: (value: Fixture[]) => saveResource('fixtures', value),
  savePosts: (value: Post[]) => saveResource('posts', value),
  saveSettings: (value: Settings) => saveResource('settings', value),
};
