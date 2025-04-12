"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Twitter, MessageCircle, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Fortnite Marketplace</h3>
            <p className="text-sm">
              The safest place to buy, sell and trade Fortnite items with secure escrow and crypto payments.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://twitter.com" target="_blank" rel="noreferrer">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://discord.com" target="_blank" rel="noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  <span className="sr-only">Discord</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://instagram.com" target="_blank" rel="noreferrer">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Browse All
                </Link>
              </li>
              <li>
                <Link href="/marketplace/category/skin" className="hover:text-white transition-colors">
                  Skins
                </Link>
              </li>
              <li>
                <Link href="/marketplace/category/account" className="hover:text-white transition-colors">
                  Accounts
                </Link>
              </li>
              <li>
                <Link href="/marketplace/category/vbucks" className="hover:text-white transition-colors">
                  V-Bucks
                </Link>
              </li>
              <li>
                <Link href="/marketplace/category/bundle" className="hover:text-white transition-colors">
                  Bundles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors">
                  Cookies Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-white transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          <p className="mb-4">Fortnite Marketplace is not endorsed by, affiliated with, or a product of Epic Games, Inc.</p>
          <p>&copy; {new Date().getFullYear()} Fortnite Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
