import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Alliance 4DX Tracker",
  description: "4DX Metrics Dashboard for Alliance College-Ready Public Schools",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <html lang="en" className="h-full">
      <body className="h-full flex bg-slate-50 antialiased">
        {isAuthenticated && <Sidebar user={session.user} />}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
