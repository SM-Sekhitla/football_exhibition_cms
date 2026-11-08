import { readCache, saveResource } from '@/lib/api';
import { toast } from '@/components/shared/Toast';

export interface SponsorLogo { id: string; name: string; image: string; scale: number; }
export interface LandingPageContent {
  sponsorLogos: SponsorLogo[];
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

const KEY = 'landing';
export const defaultLandingPage: LandingPageContent = {
  sponsorLogos: [
    {id:'silverdrop',name:'Silverdrop Water',image:'/assets/images/sponsors/silverdrop.png',scale:1.25},
    {id:'aquelle',name:'aQuellé',image:'/assets/images/sponsors/aquelle.png',scale:1.15},
    {id:'mall-of-the-north',name:'Mall of the North',image:'/assets/images/sponsors/mall-of-the-north.jpeg',scale:1.6},
  ],
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
  get: () => ({ ...defaultLandingPage, ...readCache<Partial<LandingPageContent>>(KEY, {}) }),
  async save(value: LandingPageContent) { await saveResource(KEY,value); toast.success('Landing page updated'); return value; },
  async reset() { await saveResource(KEY,defaultLandingPage); toast.info('Landing page reset'); return defaultLandingPage; },
};
