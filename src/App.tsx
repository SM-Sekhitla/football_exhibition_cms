import AdminApp from '@/pages/admin/AdminApp';
import PublicApp from '@/pages/PublicApp';
import { repository } from '@/lib/storage';

repository.seed();
export default function App() { return location.pathname.startsWith('/admin') ? <AdminApp /> : <PublicApp />; }
