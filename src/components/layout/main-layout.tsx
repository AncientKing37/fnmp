"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
}

export function MainLayout({
  children,
  showFooter = true,
  className,
}: MainLayoutProps) {
  return (
    <>
      <Navbar />
      <main className={cn("pt-16", className)}>
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
}
