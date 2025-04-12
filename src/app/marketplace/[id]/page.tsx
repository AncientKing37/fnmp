"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Shield,
  Star,
  User,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getImagePlaceholder, getRarityColor } from "@/lib/utils";
import { Category, Rarity, UserRole } from "@prisma/client";

// Mock listing data
const mockListing = {
  id: "123",
  title: "Renegade Raider + Black Knight Account",
  description: "Rare Fortnite account with Season 1 Renegade Raider skin and Season 2 Black Knight. This account includes multiple rare items from early seasons including Mako Glider, Aerial Assault Trooper, and various emotes.\n\nAccount has over 100 skins in total with many Battle Pass exclusives across all seasons.\n\nNote: Full email access will be provided after purchase through escrow system.",
  price: 2.5,
  cryptoCurrency: "ETH",
  images: ["/renegade-raider.png", "/black-knight.png", "/aerial-assault-trooper.png"],
  category: Category.ACCOUNT,
  rarity: Rarity.LEGENDARY,
  sellerId: "seller-1",
  seller: {
    id: "seller-1",
    name: "OGSeller",
    username: "og_seller",
    verifiedSeller: true,
    rating: 4.9,
    totalSales: 57,
    memberSince: new Date(2022, 5, 15), // June 15, 2022
    image: null,
  },
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) // 1 day ago
};

// Similar items
const mockSimilarItems = [
  {
    id: "1",
    title: "Galaxy Skin Account",
    price: 1.2,
    cryptoCurrency: "ETH",
    images: ["/galaxy-skin.png"],
    category: Category.ACCOUNT,
    rarity: Rarity.EPIC,
    sellerId: "seller-3",
    seller: {
      name: "EpicCollector",
      verifiedSeller: false
    }
  },
  {
    id: "2",
    title: "OG Black Knight",
    price: 1.8,
    cryptoCurrency: "ETH",
    images: ["/black-knight.png"],
    category: Category.ACCOUNT,
    rarity: Rarity.LEGENDARY,
    sellerId: "seller-2",
    seller: {
      name: "FortniteDealer",
      verifiedSeller: true
    }
  },
  {
    id: "3",
    title: "Season 1 Account Bundle",
    price: 3.2,
    cryptoCurrency: "ETH",
    images: ["/renegade-raider.png"],
    category: Category.ACCOUNT,
    rarity: Rarity.LEGENDARY,
    sellerId: "seller-4",
    seller: {
      name: "OGSkins",
      verifiedSeller: true
    }
  }
];

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [listing, setListing] = useState(mockListing);
  const [isLoading, setIsLoading] = useState(true);
  const [similarItems, setSimilarItems] = useState(mockSimilarItems);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, would fetch from API
      setListing(mockListing);
      setSimilarItems(mockSimilarItems);
      setIsLoading(false);
    };

    fetchListing();
  }, [id]);

  // Checks if the user can purchase this item (they are logged in and not the seller)
  const canPurchase = status === "authenticated" && session?.user?.id !== listing.sellerId;

  // Handle image navigation
  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  // Handle purchase
  const handlePurchase = async () => {
    setIsPurchasing(true);

    try {
      // In a real app, would make API call to create transaction
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate transaction creation
      const transactionId = "tx-" + Math.random().toString(36).substring(2, 9);

      toast.success("Purchase initiated successfully!");
      setPurchaseDialogOpen(false);

      // Redirect to transaction page
      setTimeout(() => {
        router.push(`/dashboard/transactions/${transactionId}`);
      }, 1000);
    } catch (error) {
      toast.error("Failed to initiate purchase. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  // Purchase confirmation dialog
  const PurchaseDialog = () => (
    <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          onClick={() => setPurchaseDialogOpen(true)}
          disabled={!canPurchase}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Purchase Now
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Confirm Purchase</DialogTitle>
          <DialogDescription>
            You are about to purchase this item through our secure escrow system.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-gray-900 rounded-md mb-4">
            <div className="relative h-16 w-16 rounded-md overflow-hidden">
              <Image
                src={listing.images[0] || getImagePlaceholder(listing.category === Category.SKIN ? "skin" : "item")}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-medium text-white">{listing.title}</h3>
              <p className="text-sm text-gray-400">{listing.category}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-white">{listing.price} {listing.cryptoCurrency}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-white">Secure Escrow Protection</h4>
                <p className="text-sm text-gray-400">Payment is held in escrow until you confirm receipt</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-white">Important Notice</h4>
                <p className="text-sm text-gray-400">By proceeding, you agree to our marketplace terms and conditions</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="sm:flex-1"
            onClick={() => setPurchaseDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="sm:flex-1"
            onClick={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Confirm Purchase</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
      <div className="container mx-auto px-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-800">
              <Image
                src={listing.images[selectedImage] || getImagePlaceholder(listing.category === Category.SKIN ? "skin" : "item")}
                alt={`${listing.title} - Image ${selectedImage + 1}`}
                fill
                className="object-contain"
              />

              {listing.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {listing.images.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full cursor-pointer transition-all ${
                          selectedImage === index
                            ? "w-6 bg-primary"
                            : "w-1.5 bg-gray-500 hover:bg-gray-400"
                        }`}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {listing.images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative h-16 w-16 rounded-md cursor-pointer overflow-hidden flex-shrink-0 border-2 ${
                      selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      src={image || getImagePlaceholder(listing.category === Category.SKIN ? "skin" : "item")}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Listing Description */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line text-gray-300">
                  {listing.description}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Info and Purchase */}
          <div className="space-y-6">
            {/* Listing Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${getRarityColor(listing.rarity)}`}>
                    {listing.rarity}
                  </Badge>
                  <Badge variant="outline">
                    {listing.category}
                  </Badge>
                </div>
                <CardTitle className="text-white text-2xl font-bold">
                  {listing.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  Listed {format(listing.createdAt, "MMMM d, yyyy")}
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-400">Price</div>
                  <div className="text-2xl font-bold text-white">
                    {listing.price} {listing.cryptoCurrency}
                  </div>
                </div>

                <Separator className="my-4 bg-gray-700" />

                {/* Seller Info */}
                <div>
                  <div className="text-sm font-medium text-gray-400 mb-2">Seller</div>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={listing.seller.image || ""} />
                      <AvatarFallback>
                        {listing.seller.name?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-white">{listing.seller.name}</span>
                        {listing.seller.verifiedSeller && (
                          <Badge variant="outline" className="text-blue-500 border-blue-500 text-xs py-0 h-5">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span>{listing.seller.rating}/5</span>
                        <span className="mx-1">•</span>
                        <span>{listing.seller.totalSales} sales</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Member since {format(listing.seller.memberSince, "MMMM yyyy")}
                  </div>
                </div>

                <Separator className="my-4 bg-gray-700" />

                {/* Purchase Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <div className="text-sm text-gray-300">Secure purchase with escrow protection</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <div className="text-sm text-gray-300">Trusted seller with verified history</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                {!canPurchase && status === "authenticated" ? (
                  <Button className="w-full" disabled>
                    You can't buy your own listing
                  </Button>
                ) : status === "unauthenticated" ? (
                  <Button className="w-full" asChild>
                    <Link href={`/login?callbackUrl=/marketplace/${id}`}>
                      Sign In to Purchase
                    </Link>
                  </Button>
                ) : (
                  <PurchaseDialog />
                )}
              </CardFooter>
            </Card>

            {/* Similar Items */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white">Similar Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {similarItems.map(item => (
                  <Link key={item.id} href={`/marketplace/${item.id}`} className="block">
                    <div className="flex gap-3 group">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.images[0] || getImagePlaceholder(item.category === Category.SKIN ? "skin" : "item")}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-medium text-white truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-gray-400">by {item.seller.name}</span>
                          {item.seller.verifiedSeller && (
                            <span className="text-blue-500">✓</span>
                          )}
                        </div>
                        <div className="font-medium text-primary">
                          {item.price} {item.cryptoCurrency}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
