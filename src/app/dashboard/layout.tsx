"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  User,
  MessageSquare,
  CreditCard,
  ShieldCheck,
  StarIcon,
  LogOut,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { signOut } from "next-auth/react";
import { UserRole } from "@prisma/client";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  badge?: string;
}

const NavItem = ({ href, icon, label, active, badge }: NavItemProps) => (
  <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
    {icon}
    <span className="flex-1">{label}</span>
    {badge && <Badge variant="outline">{badge}</Badge>}
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending transactions count
  useEffect(() => {
    if (session?.user?.id) {
      // This would be implemented to fetch actual counts from API
      // For now, just use a mock count
      setPendingCount(3);
    }
  }, [session]);

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold">You need to be signed in to access this page</h1>
        <p className="text-muted-foreground">Please sign in to view your dashboard</p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  const isSeller = session?.user?.role === UserRole.SELLER || session?.user?.role === UserRole.ADMIN;
  const isEscrow = session?.user?.role === UserRole.ESCROW || session?.user?.role === UserRole.ADMIN;

  const navItems = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Overview",
      active: pathname === "/dashboard",
    },
    ...(isSeller ? [
      {
        href: "/dashboard/seller",
        icon: <ShoppingBag size={20} />,
        label: "My Listings",
        active: pathname === "/dashboard/seller",
      }
    ] : []),
    {
      href: "/dashboard/transactions",
      icon: <CreditCard size={20} />,
      label: "Transactions",
      active: pathname === "/dashboard/transactions",
      badge: pendingCount > 0 ? pendingCount.toString() : undefined,
    },
    {
      href: "/dashboard/buyer",
      icon: <Package size={20} />,
      label: "Purchased Items",
      active: pathname === "/dashboard/buyer",
    },
    {
      href: "/chat",
      icon: <MessageSquare size={20} />,
      label: "Messages",
      active: pathname?.startsWith("/chat"),
    },
    {
      href: "/dashboard/profile",
      icon: <User size={20} />,
      label: "Profile",
      active: pathname === "/dashboard/profile",
    },
    ...(isEscrow ? [
      {
        href: "/dashboard/escrow",
        icon: <ShieldCheck size={20} />,
        label: "Escrow Admin",
        active: pathname === "/dashboard/escrow",
      }
    ] : []),
  ];

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 flex-col bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">Fortnite Market</span>
          </Link>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{session?.user?.name}</span>
              <span className="text-sm text-muted-foreground">{session?.user?.email}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-950"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut size={20} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 z-10 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between px-4 h-full">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">Fortnite Market</span>
          </Link>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-gray-800 border-r border-gray-700">
                <div className="h-16 p-4 border-b border-gray-700">
                  <Link href="/" className="flex items-center gap-2">
                    <span className="font-bold text-xl">Fortnite Market</span>
                  </Link>
                </div>
                <nav className="p-4 space-y-1">
                  {navItems.map((item) => (
                    <NavItem
                      key={item.href}
                      {...item}
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-16 lg:pt-0">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
