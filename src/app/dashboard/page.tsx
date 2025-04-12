"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Package,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  ChevronRight,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole, TransactionStatus } from "@prisma/client";

// Mocked data
const mockRecentTransactions = [
  {
    id: "1",
    status: TransactionStatus.PENDING,
    amount: 2.5,
    cryptoCurrency: "ETH",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    listing: {
      title: "Renegade Raider Account",
      id: "listing-1"
    },
    seller: {
      name: "ProSeller",
      id: "seller-1"
    },
    buyer: {
      name: "FortniteFan",
      id: "buyer-1"
    }
  },
  {
    id: "2",
    status: TransactionStatus.COMPLETED,
    amount: 1.2,
    cryptoCurrency: "ETH",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    listing: {
      title: "Black Knight Bundle",
      id: "listing-2"
    },
    seller: {
      name: "OGSkins",
      id: "seller-2"
    },
    buyer: {
      name: "CollectorXYZ",
      id: "buyer-2"
    }
  },
  {
    id: "3",
    status: TransactionStatus.COMPLETED,
    amount: 0.8,
    cryptoCurrency: "ETH",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    listing: {
      title: "Galaxy Skin Account",
      id: "listing-3"
    },
    seller: {
      name: "RareSkins",
      id: "seller-3"
    },
    buyer: {
      name: "SkinBuyer",
      id: "buyer-3"
    }
  }
];

const mockRecentListings = [
  {
    id: "listing-1",
    title: "Renegade Raider + Black Knight",
    price: 3.5,
    cryptoCurrency: "ETH",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    category: "ACCOUNT",
    status: "AVAILABLE"
  },
  {
    id: "listing-2",
    title: "OG Skull Trooper",
    price: 1.8,
    cryptoCurrency: "ETH",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    category: "SKIN",
    status: "AVAILABLE"
  }
];

// Helper function to get transaction status badge
const getStatusBadge = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.PENDING:
      return <Badge className="bg-yellow-600">Pending</Badge>;
    case TransactionStatus.IN_PROGRESS:
      return <Badge className="bg-blue-600">In Progress</Badge>;
    case TransactionStatus.COMPLETED:
      return <Badge className="bg-green-600">Completed</Badge>;
    case TransactionStatus.CANCELLED:
      return <Badge className="bg-red-600">Cancelled</Badge>;
    case TransactionStatus.DISPUTED:
      return <Badge className="bg-purple-600">Disputed</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalTransactions: 0,
    pendingTransactions: 0,
    totalSpent: 0,
    totalEarned: 0,
    activeListings: 0,
  });

  // Calculate stats based on user role
  useEffect(() => {
    if (session?.user?.id) {
      // In a real implementation, we would fetch this data from the API
      // For now, we'll use mocked data
      const isSeller = session.user.role === UserRole.SELLER || session.user.role === UserRole.ADMIN;

      setStats({
        totalTransactions: 12,
        pendingTransactions: 3,
        totalSpent: isSeller ? 0 : 15.8,
        totalEarned: isSeller ? 28.5 : 0,
        activeListings: isSeller ? 5 : 0,
      });
    }
  }, [session]);

  const isSeller = session?.user?.role === UserRole.SELLER || session?.user?.role === UserRole.ADMIN;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session?.user?.name}. Here's an overview of your marketplace activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-white text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingTransactions} pending
            </p>
          </CardContent>
        </Card>

        {isSeller ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-white text-sm font-medium">Active Listings</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeListings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Items for sale
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-white text-sm font-medium">Purchased Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalTransactions - stats.pendingTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed purchases
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-white text-sm font-medium">
              {isSeller ? "Total Earned" : "Total Spent"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isSeller ? stats.totalEarned : stats.totalSpent} ETH
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isSeller ? "From sales" : "On purchases"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-white text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">7</div>
            <p className="text-xs text-muted-foreground mt-1">
              3 unread
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab content for Recent Activity */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          {isSeller && <TabsTrigger value="listings">My Listings</TabsTrigger>}
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription>
                Your most recent marketplace transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-2">
                {mockRecentTransactions.map(transaction => {
                  const isCurrentUserSeller = transaction.seller.id === session?.user?.id;
                  const otherParty = isCurrentUserSeller ? transaction.buyer.name : transaction.seller.name;

                  return (
                    <div key={transaction.id} className="flex items-center p-4 hover:bg-gray-700/50">
                      <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{transaction.listing.title}</span>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isCurrentUserSeller ? "Sold to" : "Bought from"}: {otherParty} • {format(transaction.createdAt, "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-semibold text-white">{transaction.amount} {transaction.cryptoCurrency}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/transactions/${transaction.id}`}>
                            <span className="flex items-center gap-1">
                              Details <ChevronRight className="h-4 w-4" />
                            </span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/transactions">
                  View All Transactions
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {isSeller && (
          <TabsContent value="listings" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">My Listings</CardTitle>
                <CardDescription>
                  Manage your active listings
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-2">
                  {mockRecentListings.map(listing => (
                    <div key={listing.id} className="flex items-center p-4 hover:bg-gray-700/50">
                      <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{listing.title}</span>
                          <Badge className="bg-green-600">Available</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {listing.category} • Listed {format(listing.createdAt, "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-semibold text-white">{listing.price} {listing.cryptoCurrency}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/marketplace/${listing.id}`}>
                            <span className="flex items-center gap-1">
                              View <ChevronRight className="h-4 w-4" />
                            </span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/seller">
                    Manage All Listings
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        {isSeller ? (
          <Button asChild>
            <Link href="/dashboard/seller/new">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Create New Listing
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/marketplace">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Marketplace
            </Link>
          </Button>
        )}

        <Button asChild variant="outline">
          <Link href="/dashboard/profile">
            Update Profile
          </Link>
        </Button>

        {!isSeller && (
          <Button asChild variant="secondary">
            <Link href="/dashboard/become-seller">
              <TrendingUp className="mr-2 h-4 w-4" />
              Become a Seller
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
