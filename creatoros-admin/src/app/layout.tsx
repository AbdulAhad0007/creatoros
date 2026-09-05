import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Key,
  Activity,
  Server,
  Settings,
  FileText,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CreatorOS Admin",
  description: "Admin panel for CreatorOS AI",
};

const sidebarNavItems = [
  {
    title: "Admin Dashboard",
    href: "/",
    icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
  },
  { title: "MANAGEMENT", heading: true },
  {
    title: "Users",
    href: "/users",
    icon: <Users className="w-4 h-4 mr-2" />,
  },
  {
    title: "API Management",
    href: "/api-management",
    icon: <Key className="w-4 h-4 mr-2" />,
  },
  {
    title: "API Usage",
    href: "/api-usage",
    icon: <Activity className="w-4 h-4 mr-2" />,
  },
  { title: "SYSTEM", heading: true },
  {
    title: "Jobs Queue",
    href: "/jobs",
    icon: <Server className="w-4 h-4 mr-2" />,
  },
  {
    title: "System Logs",
    href: "/logs",
    icon: <FileText className="w-4 h-4 mr-2" />,
  },
  {
    title: "Configuration",
    href: "/system",
    icon: <Settings className="w-4 h-4 mr-2" />,
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
          {/* Admin Sidebar */}
          <aside className="hidden w-64 glass md:flex flex-col z-10">
            <div className="flex h-14 items-center border-b border-border/50 px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
                <span className="text-xl">CreatorOS <span className="text-muted-foreground">Admin</span></span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {sidebarNavItems.map((item, index) => {
                  if (item.heading) {
                    return (
                      <div
                        key={index}
                        className="px-4 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {item.title}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={index}
                      href={item.href!}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="mt-auto p-4 border-t border-border/50">
              <form action="/auth/logout" method="post">
                <Button variant="ghost" type="submit" className="w-full justify-start text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </form>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex flex-1 flex-col overflow-hidden">
            <header className="flex h-14 items-center gap-4 glass z-10 px-4 lg:h-[60px] lg:px-6">
              <div className="md:hidden font-semibold text-primary">CreatorOS Admin</div>
              <div className="ml-auto flex items-center gap-4">
                <ThemeToggle />
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  A
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-auto p-4 lg:p-6">
              {children}
            </div>
          </main>
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
