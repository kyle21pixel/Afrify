import Providers from '../providers';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <AdminHeader />
        <main className="ml-64 pt-16">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </Providers>
  );
}
