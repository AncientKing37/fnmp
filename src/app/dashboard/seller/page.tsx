"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash,
  MoreHorizontal,
  Eye,
  Check,
  X,
  AlertCircle,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getImagePlaceholder, getRarityColor } from "@/lib/utils";
import { Category, Rarity, ListingStatus, UserRole } from "@prisma/client";

// Mock data
const mockListings = [
  {
    id: "1",
    title: "Renegade Raider Account",
    description: "Rare Fortnite account with Season 1 Renegade Raider skin",
    price: 2.5,
    cryptoCurrency: "ETH",
    images: ["/renegade-raider.png"],
    category: Category.ACCOUNT,
    rarity: Rarity.LEGENDARY,
    status: ListingStatus.AVAILABLE,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    views: 78,
    interested: 12
  },
  {
    id: "2",
    title: "Black Knight Account",
    description: "Season 2 Black Knight account with many other rare cosmetics",
    price: 1.8,
    cryptoCurrency: "ETH",
    images: ["/black-knight.png"],
    category: Category.ACCOUNT,
    rarity: Rarity.EPIC,
    status: ListingStatus.AVAILABLE,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    views: 45,
    interested: 8
  },
  {
    id: "3",
    title: "Skull Trooper OG",
    description: "Account with OG Skull Trooper (purple glow variant)",
    price: 1.5,
    cryptoCurrency: "ETH",
    images: ["/skull-trooper.png"],
    category: Category.ACCOUNT,
    rarity: Rarity.EPIC,
    status: ListingStatus.PENDING,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    views: 32,
    interested: 4
  },
  {
    id: "4",
    title: "Wonder Skin Code",
    description: "Unused code for the Wonder skin",
    price: 0.7,
    cryptoCurrency: "ETH",
    images: ["/wonder-skin.png"],
    category: Category.CODE,
    rarity: Rarity.RARE,
    status: ListingStatus.SOLD,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
    views: 21,
    interested: 3
  }
];

// Mock seller stats
const mockSellerStats = {
  totalListings: 12,
  activeListings: 3,
  pendingListings: 1,
  soldListings: 8,
  totalViews: 576,
  totalSales: 9.8, // ETH
  conversionRate: 8.3, // %
  positiveFeedback: 96 // %
};

// Helper function to get status badge
const getStatusBadge = (status: ListingStatus) => {
  switch (status) {
    case ListingStatus.AVAILABLE:
      return <Badge className="bg-green-600">Available</Badge>;
    case ListingStatus.PENDING:
      return <Badge className="bg-yellow-600">Pending Sale</Badge>;
    case ListingStatus.SOLD:
      return <Badge className="bg-blue-600">Sold</Badge>;
    case ListingStatus.INACTIVE:
      return <Badge variant="outline">Inactive</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export default function SellerDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [listings, setListings] = useState(mockListings);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [sellerStats, setSellerStats] = useState(mockSellerStats);
  const [searchQuery, setSearchQuery] = useState("");

  // Confirm user is a seller
  useEffect(() => {
    if (sessionStatus === "authenticated" &&
        session?.user?.role !== UserRole.SELLER &&
        session?.user?.role !== UserRole.ADMIN) {
      router.push("/dashboard/become-seller");
    }
  }, [session, sessionStatus, router]);

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // In a real app, would fetch from API with filters
      const filteredListings = [...mockListings];

      // Apply tab filter
      if (activeTab === "active") {
        filteredListings.filter(listing => listing.status === ListingStatus.AVAILABLE);
      } else if (activeTab === "pending") {
        filteredListings.filter(listing => listing.status === ListingStatus.PENDING);
      } else if (activeTab === "sold") {
        filteredListings.filter(listing => listing.status === ListingStatus.SOLD);
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredListings.filter(
          listing =>
            listing.title.toLowerCase().includes(query) ||
            listing.description.toLowerCase().includes(query)
        );
      }

      setListings(filteredListings);
      setIsLoading(false);
    };

    fetchListings();
  }, [activeTab, searchQuery]);

  // Handle listing deletion
  const handleDeleteListing = async () => {
    if (!listingToDelete) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Filter out the deleted listing
      setListings(prev => prev.filter(listing => listing.id !== listingToDelete));

      toast.success("Listing deleted successfully");
      setListingToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete listing");
    }
  };

  // Delete dialog
  const DeleteListingDialog = () => (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent className="bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Listing</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this listing? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteListing}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your listings and track your seller performance
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/seller/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Listing
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{sellerStats.totalListings}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {sellerStats.activeListings} active, {sellerStats.pendingListings} pending, {sellerStats.soldListings} sold
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{sellerStats.totalViews}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {(sellerStats.totalViews / sellerStats.totalListings).toFixed(1)} per listing
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{sellerStats.totalSales} ETH</div>
            <div className="text-xs text-muted-foreground mt-1">
              {sellerStats.soldListings} items sold
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{sellerStats.conversionRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {sellerStats.positiveFeedback}% positive feedback
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="all">All Listings</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="sold">Sold</TabsTrigger>
              </TabsList>

              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  className="pl-8 bg-gray-800 border-gray-700 w-full md:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <TabsContent value={activeTab} className="m-0">
                {listings.length === 0 ? (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                      <div className="rounded-full bg-gray-700 p-3 mb-4">
                        <AlertCircle className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No listings found</h3>
                      <p className="text-muted-foreground max-w-sm mb-4">
                        You have no listings in this category. Create your first listing to start selling!
                      </p>
                      <Button asChild>
                        <Link href="/dashboard/seller/new">
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Listing
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {listings.map(listing => (
                      <Card key={listing.id} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4">
                            <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                src={listing.images[0] || getImagePlaceholder(listing.category === Category.SKIN ? "skin" : "item")}
                                alt={listing.title}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div>
                                  <Link
                                    href={`/marketplace/${listing.id}`}
                                    className="text-lg font-medium text-white hover:text-primary transition-colors line-clamp-1"
                                  >
                                    {listing.title}
                                  </Link>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <Badge variant="outline">{listing.category}</Badge>
                                    <Badge className={`${getRarityColor(listing.rarity)}`}>
                                      {listing.rarity}
                                    </Badge>
                                    {getStatusBadge(listing.status)}
                                  </div>
                                </div>

                                <div className="text-right mt-2 md:mt-0">
                                  <div className="text-xl font-bold text-white">
                                    {listing.price} {listing.cryptoCurrency}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Listed on {format(listing.createdAt, "MMM d, yyyy")}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap justify-between items-center mt-4">
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center">
                                    <Eye className="mr-1 h-4 w-4 text-muted-foreground" />
                                    <span>{listing.views} views</span>
                                  </div>
                                  <div className="flex items-center">
                                    <User className="mr-1 h-4 w-4 text-muted-foreground" />
                                    <span>{listing.interested} interested</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mt-2 md:mt-0">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/marketplace/${listing.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </Link>
                                  </Button>

                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/seller/edit/${listing.id}`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </Link>
                                  </Button>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator className="bg-gray-700" />
                                      <DropdownMenuItem
                                        className="cursor-pointer flex items-center text-destructive focus:text-destructive"
                                        onClick={() => {
                                          setListingToDelete(listing.id);
                                          setDeleteDialogOpen(true);
                                        }}
                                      >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <DeleteListingDialog />
    </div>
  );
}
