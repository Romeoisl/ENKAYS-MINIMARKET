import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-ink-100">
      <Sidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
