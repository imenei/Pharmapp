// src/app/pharmacist/layout.tsx
import PharmacistSidebar from '@/components/pharmacist/Sidebar';

export default function PharmacistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <PharmacistSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
