import AdminProviders from "@/components/AdminProviders";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
