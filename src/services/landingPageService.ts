import { toast } from '@/components/shared/Toast';

export interface LandingPageContent {
  heroEyebrow: string;
  heroLineOne: string;
  heroHighlight: string;
  heroLineThree: string;
  heroDescription: string;
  heroImages: string[];
  primaryButton: string;
  secondaryButton: string;
  cultureEyebrow: string;
  cultureTitle: string;
  cultureDescription: string;
  cultureImage: string;
  cultureButton: string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaButton: string;
}

const KEY = 'best5_landing_page';
export const defaultLandingPage: LandingPageContent = {
  heroEyebrow: 'SM Organisation presents',
  heroLineOne: 'Best5',
  heroHighlight: 'Football',
  heroLineThree: 'Exhibition',
  heroDescription: "A one-day 5-a-side football showcase where Polokwane's best meet under the lights. Five players. One champion. No excuses.",
  heroImages: ['/assets/images/background-posters/IMG_3720.JPG','/assets/images/background-posters/IMG_3715.JPG','/assets/images/background-posters/WhatsApp Image 2026-09-10 at 5.20.54 PM.jpeg'],
  primaryButton: 'Register your team', secondaryButton: 'View tournament',
  cultureEyebrow: 'More than a match', cultureTitle: 'Bring the whole culture.',
  cultureDescription: 'From food and drinks to streetwear and brand activations, the BEST5 village is where the community comes to play.',
  cultureImage: '/assets/images/background-posters/WhatsApp Image 2026-09-10 at 5.20.54 PM.jpeg', cultureButton: 'Become a vendor',
  ctaEyebrow: 'The whistle is coming', ctaTitle: 'Are you in?', ctaButton: 'Register your team',
};

export const landingPageService = {
  get(): LandingPageContent { try { const saved=localStorage.getItem(KEY); return saved ? { ...defaultLandingPage, ...JSON.parse(saved) } : defaultLandingPage; } catch { return defaultLandingPage; } },
  save(value: LandingPageContent) { localStorage.setItem(KEY,JSON.stringify(value)); window.dispatchEvent(new Event('best5:landing')); toast.success('Landing page updated'); return value; },
  reset() { localStorage.removeItem(KEY); window.dispatchEvent(new Event('best5:landing')); toast.info('Landing page reset'); return defaultLandingPage; },
};
