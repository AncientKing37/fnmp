"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ChevronRight,
  Search,
  Filter,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole, TransactionStatus } from "@prisma/client";

// Helper functions
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

// Mock data
const mockTransactions = [
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
      id: "seller-1",
      image: null
    },
    buyer: {
      name: "FortniteFan",
      id: "buyer-1",
      image: null
    },
    escrow: {
      name: "EscrowAdmin",
      id: "escrow-1",
      image: null
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
      id: "seller-2",
      image: null
    },
    buyer: {
      name: "CollectorXYZ",
      id: "buyer-2",
      image: null
    },
    escrow: {
      name: "EscrowAdmin",
      id: "escrow-1",
      image: null
    }
  },
  {
    id: "3",
    status: TransactionStatus.IN_PROGRESS,
    amount: 0.8,
    cryptoCurrency: "ETH",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    listing: {
      title: "Galaxy Skin Account",
      id: "listing-3"
    },
    seller: {
      name: "RareSkins",
      id: "seller-3",
      image: null
    },
    buyer: {
      name: "SkinBuyer",
      id: "buyer-3",
      image: null
    },
    escrow: {
      name: "EscrowAdmin",
      id: "escrow-1",
      image: null
    }
  },
  {
    id: "4",
    status: TransactionStatus.DISPUTED,
    amount: 1.5,
    cryptoCurrency: "ETH",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    listing: {
      title: "OG Ghoul Trooper",
      id: "listing-4"
    },
    seller: {
      name: "EpicTrader",
      id: "seller-4",
      image: null
    },
    buyer: {
      name: "FortCollector",
      id: "buyer-4",
      image: null
    },
    escrow: {
      name: "EscrowAdmin",
      id: "escrow-1",
      image: null
    }
  },
  {
    id: "5",
    status: TransactionStatus.CANCELLED,
    amount: 3.2,
    cryptoCurrency: "ETH",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
    listing: {
      title: "Aerial Assault Trooper",
      id: "listing-5"
    },
    seller: {
      name: "RareSeller",
      id: "seller-5",
      image: null
    },
    buyer: {
      name: "VintageGamer",
      id: "buyer-5",
      image: null
    },
    escrow: {
      name: "EscrowAdmin",
      id: "escrow-1",
      image: null
    }
  }
];

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filters, setFilters] = useState({
    status: "",
    search: ""
  });

  // Simulate fetching transactions based on filters
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter transactions based on tab and filters
      let filteredTransactions = [...mockTransactions];

      // Filter by role (buyer/seller/all)
      if (activeTab === "buying") {
        filteredTransactions = filteredTransactions.filter(
          t => t.buyer.id === session?.user?.id
        );
      } else if (activeTab === "selling") {
        filteredTransactions = filteredTransactions.filter(
          t => t.seller.id === session?.user?.id
        );
      } else if (activeTab === "escrow" &&
                (session?.user?.role === UserRole.ESCROW || session?.user?.role === UserRole.ADMIN)) {
        filteredTransactions = filteredTransactions.filter(
          t => t.escrow.id === session?.user?.id
        );
      }

      // Filter by status
      if (filters.status) {
        filteredTransactions = filteredTransactions.filter(
          t => t.status === filters.status
        );
      }

      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredTransactions = filteredTransactions.filter(
          t =>
            t.listing.title.toLowerCase().includes(searchTerm) ||
            t.buyer.name.toLowerCase().includes(searchTerm) ||
            t.seller.name.toLowerCase().includes(searchTerm)
        );
      }

      setTransactions(filteredTransactions);
      setIsLoading(false);
    };

    fetchTransactions();
  }, [activeTab, filters, session?.user?.id, session?.user?.role]);

  const isSeller = session?.user?.role === UserRole.SELLER || session?.user?.role === UserRole.ADMIN;
  const isEscrow = session?.user?.role === UserRole.ESCROW || session?.user?.role === UserRole.ADMIN;

  // Function to handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Transactions</h1>
        <p className="text-muted-foreground mt-2">
          Manage your marketplace transactions and track your purchases and sales
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value={TransactionStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={TransactionStatus.IN_PROGRESS}>In Progress</SelectItem>
              <SelectItem value={TransactionStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={TransactionStatus.CANCELLED}>Cancelled</SelectItem>
              <SelectItem value={TransactionStatus.DISPUTED}>Disputed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="buying">My Purchases</TabsTrigger>
          {isSeller && <TabsTrigger value="selling">My Sales</TabsTrigger>}
          {isEscrow && <TabsTrigger value="escrow">Escrow Management</TabsTrigger>}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {activeTab === "buying"
                  ? "My Purchases"
                  : activeTab === "selling"
                  ? "My Sales"
                  : activeTab === "escrow"
                  ? "Escrow Management"
                  : "All Transactions"}
              </CardTitle>
              <CardDescription>
                {activeTab === "buying"
                  ? "Items you've purchased or are in the process of buying"
                  : activeTab === "selling"
                  ? "Items you're selling or have sold"
                  : activeTab === "escrow"
                  ? "Transactions you're mediating as an escrow"
                  : "All of your marketplace transactions"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {transactions.map(transaction => {
                    const isCurrentUserSeller = transaction.seller.id === session?.user?.id;
                    const isCurrentUserBuyer = transaction.buyer.id === session?.user?.id;
                    const isCurrentUserEscrow = transaction.escrow.id === session?.user?.id;

                    let roleLabel = "";
                    if (isCurrentUserSeller) roleLabel = "Seller";
                    else if (isCurrentUserBuyer) roleLabel = "Buyer";
                    else if (isCurrentUserEscrow) roleLabel = "Escrow";

                    return (
                      <div key={transaction.id} className="flex items-center p-4 hover:bg-gray-700/50 border-b border-gray-700 last:border-b-0">
                        <div className="flex flex-col flex-1 gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{transaction.listing.title}</span>
                            {getStatusBadge(transaction.status)}
                            {roleLabel && (
                              <Badge variant="outline" className="ml-2">
                                {roleLabel}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {isCurrentUserSeller
                              ? `Buyer: ${transaction.buyer.name}`
                              : isCurrentUserBuyer
                              ? `Seller: ${transaction.seller.name}`
                              : `Buyer: ${transaction.buyer.name} | Seller: ${transaction.seller.name}`}
                            {" • "}
                            {format(transaction.createdAt, "MMM d, yyyy")}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
