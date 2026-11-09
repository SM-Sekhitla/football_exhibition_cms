import type { Settings } from './storage';

export function vendorStallFee(category: string, settings: Pick<Settings,'vendorStallFee'|'vendorFoodStallFee'>) {
  return category.trim().toLowerCase() === 'food & drinks' ? settings.vendorFoodStallFee ?? 1000 : settings.vendorStallFee ?? 350;
}
