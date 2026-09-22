import { useEffect, useRef, useState } from 'react';

export function useDataRevision() {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setRevision(n => n + 1);
    ['storage', 'best5:data', 'best5:landing'].forEach(name => window.addEventListener(name, refresh));
    return () => ['storage', 'best5:data', 'best5:landing'].forEach(name => window.removeEventListener(name, refresh));
  }, []);
  return revision;
}

export function useUnsavedChanges(dirty: boolean) {
  const current = useRef(dirty);
  current.current = dirty;
  useEffect(() => {
    if (!dirty) return;
    const unload = (e: BeforeUnloadEvent) => { if (current.current) { e.preventDefault(); e.returnValue = ''; } };
    const guard = (e: Event) => { if (current.current) { if (!window.confirm('Discard unsaved changes?')) e.preventDefault(); else current.current = false; } };
    window.addEventListener('beforeunload', unload);
    window.addEventListener('best5:navigate', guard);
    return () => { window.removeEventListener('beforeunload', unload); window.removeEventListener('best5:navigate', guard); };
  }, [dirty]);
  return () => { current.current = false; };
}

export const canNavigate = () => window.dispatchEvent(new Event('best5:navigate', { cancelable: true }));
export const money = (value: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(value);
export const eventDate = (value: string) => new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
export function safeUrl(value: string) {
  if (!value) return '';
  try { const url = new URL(value.startsWith('http') ? value : `https://${value}`); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
export function whatsappUrl(value: string, message = '') {
  const base = value.startsWith('http') ? safeUrl(value) : `https://wa.me/${value.replace(/\D/g, '')}`;
  if (!base) return '';
  const url = new URL(base); if (message) url.searchParams.set('text', message); return url.href;
}

/** Keep only the formatting supported by the editor when displaying saved HTML. */
export function articleHtml(value: string) {
  const doc = new DOMParser().parseFromString(value, 'text/html');
  const allowed = new Set(['P', 'BR', 'DIV', 'H2', 'H3', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'FIGURE', 'IMG', 'FIGCAPTION']);
  for (const node of Array.from(doc.body.querySelectorAll('*'))) {
    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'MATH'].includes(node.tagName)) { node.remove(); continue; }
    if (!allowed.has(node.tagName)) { node.replaceWith(...node.childNodes); continue; }
    for (const attr of Array.from(node.attributes)) {
      const image = node.tagName === 'IMG' && ['src', 'alt'].includes(attr.name);
      const link = node.tagName === 'A' && attr.name === 'href';
      if (!image && !link) node.removeAttribute(attr.name);
    }
    if (node.tagName === 'A') { const href = node.getAttribute('href') || ''; if (!/^(https?:|mailto:|\/[^/])/i.test(href)) node.removeAttribute('href'); node.setAttribute('rel', 'noopener noreferrer'); }
    if (node.tagName === 'IMG') { const src = node.getAttribute('src') || ''; if (!/^(https?:|\/[^/]|data:image\/(png|jpeg|webp|gif|avif);base64,)/i.test(src)) node.removeAttribute('src'); }
  }
  return doc.body.innerHTML;
}
