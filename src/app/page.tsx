"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { getImagePlaceholder, getRarityColor } from "@/lib/utils";
import { useSession } from "next-auth/react";

const mockFeaturedItems = [
  {
    id: "1",
    title: "Renegade Raider",
    description: "Rare Fortnite skin from Season 1",
    price: 1.5,
    cryptoCurrency: "ETH",
    images: ["/renegade-raider.png"],
    category: "SKIN",
    rarity: "RARE"
  },
  {
    id: "2",
    title: "Black Knight",
    description: "Tier 70 Season 2 Battle Pass Reward",
    price: 2.0,
    cryptoCurrency: "ETH",
    images: ["/black-knight.png"],
    category: "SKIN",
    rarity: "LEGENDARY"
  },
  {
    id: "3",
    title: "Galaxy Skin Account",
    description: "Account with rare Galaxy skin and many other cosmetics",
    price: 3.5,
    cryptoCurrency: "ETH",
    images: ["/galaxy-skin.png"],
    category: "ACCOUNT",
    rarity: "EPIC"
  },
  {
    id: "4",
    title: "Travis Scott Skin",
    description: "Rare skin from the Travis Scott event",
    price: 1.2,
    cryptoCurrency: "ETH",
    images: ["/travis-scott.png"],
    category: "SKIN",
    rarity: "EPIC"
  }
];

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-blue-900 z-0">
          <div className="absolute inset-0 bg-[url('/hero-bg.png')] opacity-30 bg-cover bg-center mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-white [text-shadow:_0_2px_10px_rgb(0_0_0_/_20%)]">
            Fortnite Marketplace
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            The safest way to buy, sell, and trade Fortnite items, skins, and accounts with crypto and escrow protection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/marketplace">
                Browse Marketplace
              </Link>
            </Button>
            {!session ? (
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">
                  Sign In to Trade
                </Link>
              </Button>
            ) : (
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-black/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Why Use Our Marketplace?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-900/60">
              <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Secure Escrow</h3>
              <p className="text-gray-300">Our escrow system guarantees secure transactions between buyers and sellers.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-900/60">
              <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Crypto Payments</h3>
              <p className="text-gray-300">Fast and anonymous transactions with various cryptocurrencies.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-900/60">
              <div className="w-16 h-16 bg-green-700 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Live Chat Support</h3>
              <p className="text-gray-300">Get help at any time with our built-in messaging system.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-white">Featured Items</h2>
          <p className="text-center text-gray-400 mb-12">Check out these popular items in our marketplace</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockFeaturedItems.map((item) => (
              <Card key={item.id} className="bg-gray-800 border-gray-700 overflow-hidden">
                <div className="relative h-64 w-full">
                  <Image
                    src={item.images[0] || getImagePlaceholder(item.category === "SKIN" ? "skin" : "item")}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getRarityColor(item.rarity)}`}>
                      {item.rarity}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-white">{item.title}</CardTitle>
                  <CardDescription className="text-gray-400">{item.category}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-300 text-sm">{item.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t border-gray-700 pt-4">
                  <span className="text-lg font-bold text-white">{item.price} {item.cryptoCurrency}</span>
                  <Button asChild>
                    <Link href={`/marketplace/${item.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/marketplace">
                View All Items
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold text-white">1</div>
              <div className="bg-gray-800 p-6 rounded-lg h-full">
                <h3 className="text-xl font-semibold mb-3 text-white mt-4">Browse & Select</h3>
                <p className="text-gray-300">Browse through thousands of Fortnite items, find what you like, and add it to your cart.</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold text-white">2</div>
              <div className="bg-gray-800 p-6 rounded-lg h-full">
                <h3 className="text-xl font-semibold mb-3 text-white mt-4">Secure Payment</h3>
                <p className="text-gray-300">Pay with cryptocurrency through our secure escrow system that protects both buyers and sellers.</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold text-white">3</div>
              <div className="bg-gray-800 p-6 rounded-lg h-full">
                <h3 className="text-xl font-semibold mb-3 text-white mt-4">Get Your Items</h3>
                <p className="text-gray-300">Receive your purchased items directly in your Fortnite account or through account credentials.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to trade Fortnite items?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of players who buy and sell safely on our marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-purple-900 hover:bg-gray-100">
              <Link href="/register">
                Create Account
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
              <Link href="/marketplace">
                Start Browsing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
