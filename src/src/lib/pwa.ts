export interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
let pending: InstallPrompt | null = null;
export const installPrompt = () => pending;
export function clearInstallPrompt() {
  pending = null;
  window.dispatchEvent(new Event('best5:install-ready'));
}
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  pending = event as InstallPrompt;
  window.dispatchEvent(new Event('best5:install-ready'));
});
window.addEventListener('appinstalled', clearInstallPrompt);
