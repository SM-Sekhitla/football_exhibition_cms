import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { toggleLabel?: string };
export function PasswordInput({ className = 'field', toggleLabel = 'password', ...props }: Props) {
  const [visible,setVisible] = useState(false);
  return <div className="relative"><input {...props} type={visible ? 'text' : 'password'} className={`${className} pr-12`}/><button type="button" disabled={props.disabled} aria-label={`${visible ? 'Hide' : 'Show'} ${toggleLabel}`} aria-pressed={visible} aria-controls={props.id} onClick={() => setVisible(value=>!value)} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-white/65 hover:text-[#c8ff4b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8ff4b]">{visible ? <EyeOff size={18} aria-hidden="true"/> : <Eye size={18} aria-hidden="true"/>}</button></div>;
}
