import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { readAll } from "@/lib/store";
import { smtpConfigured } from "@/lib/mailer";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin configured={adminConfigured()} />;
  }
  const [orders, inquiries] = await Promise.all([readAll("orders"), readAll("inquiries")]);
  return <AdminDashboard orders={orders} inquiries={inquiries} smtp={smtpConfigured()} />;
}
