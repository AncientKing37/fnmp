"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, Package, LayoutDashboard, UserPlus, ShoppingCart } from "lucide-react";
import { generateAvatar, getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled || pathname !== "/"
        ? "bg-gray-900/95 backdrop-blur-md border-b border-gray-800"
        : "bg-transparent"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-white">Fortnite Marketplace</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/marketplace" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Marketplace
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {categories.map((category) => (
                        <li key={category.title}>
                          <Link href={category.href} legacyBehavior passHref>
                            <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">{category.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {category.description}
                              </p>
                            </NavigationMenuLink>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/how-it-works" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      How It Works
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/about" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      About
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "authenticated" && session ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/listings/new">
                  <Button variant="outline" size="sm">
                    <Package className="h-4 w-4 mr-2" />
                    Sell Item
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={session.user.image || generateAvatar(session.user.name || "User")}
                          alt={session.user.name || "User"}
                        />
                        <AvatarFallback>{getInitials(session.user.name || "User")}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/transactions">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Transactions</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col space-y-4 py-4">
                  {status === "authenticated" && session ? (
                    <div className="flex items-center space-x-2 mb-6 pb-6 border-b">
                      <Avatar>
                        <AvatarImage
                          src={session.user.image || generateAvatar(session.user.name || "User")}
                          alt={session.user.name || "User"}
                        />
                        <AvatarFallback>{getInitials(session.user.name || "User")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                      </div>
                    </div>
                  ) : null}
                  <Link href="/" className="py-2 px-3 hover:bg-accent rounded-md">
                    Home
                  </Link>
                  <Link href="/marketplace" className="py-2 px-3 hover:bg-accent rounded-md">
                    Marketplace
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.title}
                      href={category.href}
                      className="py-2 px-3 pl-6 hover:bg-accent rounded-md text-sm text-muted-foreground"
                    >
                      {category.title}
                    </Link>
                  ))}
                  <Link href="/how-it-works" className="py-2 px-3 hover:bg-accent rounded-md">
                    How It Works
                  </Link>
                  <Link href="/about" className="py-2 px-3 hover:bg-accent rounded-md">
                    About
                  </Link>

                  <div className="pt-4 mt-4 border-t">
                    {status === "authenticated" && session ? (
                      <>
                        <Link href="/dashboard" className="flex items-center py-2 px-3 hover:bg-accent rounded-md">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link href="/dashboard/listings/new" className="flex items-center py-2 px-3 hover:bg-accent rounded-md">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Sell Item</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full text-left py-2 px-3 hover:bg-accent rounded-md"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log Out</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <Link href="/login">
                          <Button className="w-full" variant="outline">Sign In</Button>
                        </Link>
                        <Link href="/register">
                          <Button className="w-full">Register</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

const categories = [
  {
    title: "Skins",
    description: "Browse rare and popular Fortnite character skins",
    href: "/marketplace/category/skin",
  },
  {
    title: "Accounts",
    description: "Complete Fortnite accounts with rare skins and items",
    href: "/marketplace/category/account",
  },
  {
    title: "V-Bucks",
    description: "Purchase V-Bucks at competitive prices",
    href: "/marketplace/category/vbucks",
  },
  {
    title: "Emotes",
    description: "Express yourself with rare and popular emotes",
    href: "/marketplace/category/emote",
  },
  {
    title: "Pickaxes",
    description: "Stand out with unique harvesting tools",
    href: "/marketplace/category/pickaxe",
  },
  {
    title: "Gliders",
    description: "Make an entrance with exclusive gliders",
    href: "/marketplace/category/glider",
  },
];
