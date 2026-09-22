import { useEffect, useRef, type ReactNode } from 'react';

let openDialogs = 0;
let originalOverflow = '';

/** Native modal behavior provides focus containment, Escape and focus restoration. */
export function Dialog({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    if (openDialogs === 0) originalOverflow = document.body.style.overflow;
    openDialogs++;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); openDialogs--; if (openDialogs === 0) document.body.style.overflow = originalOverflow; if (previous?.isConnected) previous.focus(); };
  }, []);
  return <dialog ref={ref} aria-label={label} className="app-dialog" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>{children}</dialog>;
}
