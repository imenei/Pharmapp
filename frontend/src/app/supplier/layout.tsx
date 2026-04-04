// src/app/supplier/layout.tsx
import SupplierSidebar from '@/components/supplier/Sidebar';
export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SupplierSidebar />
      <main className="flex-1 overflow-auto"><div className="max-w-7xl mx-auto p-6">{children}</div></main>
    </div>
  );
}
