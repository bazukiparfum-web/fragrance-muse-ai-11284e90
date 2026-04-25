import { Outlet, useLocation, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/dashboard': 'Dashboard',
  '/admin/notes': 'Fragrance Notes',
  '/admin/ingredients': 'Ingredient Mappings',
  '/admin/rules': 'Formulation Rules',
  '/admin/scents': 'Scent Tags',
  '/admin/questions': 'Quiz Questions',
  '/admin/orders': 'Orders',
  '/admin/production-queue': 'Production Queue',
  '/admin/consultations': 'Consultations',
  '/admin/reviews': 'Reviews',
  '/admin/users': 'Users & Roles',
  '/admin/testing': 'Manual Testing',
};

const AdminLayout = () => {
  const location = useLocation();
  const title = titles[location.pathname] ?? 'Admin';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 sticky top-0 bg-background/95 backdrop-blur z-10">
            <SidebarTrigger />
            <div className="flex items-center gap-2 text-sm">
              <Link to="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
                Admin
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium text-foreground">{title}</span>
            </div>
            <div className="ml-auto">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to site
              </Link>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
