import AdminApp from '@/pages/admin/AdminApp';
import PublicApp from '@/pages/PublicApp';

export default function App() { return location.pathname.startsWith('/admin') ? <AdminApp /> : <PublicApp />; }
