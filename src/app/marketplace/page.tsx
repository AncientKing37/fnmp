"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  X,
  Loader2,
  SortAsc,
  SortDesc
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { getImagePlaceholder, getRarityColor } from "@/lib/utils";
import { Category, Rarity, ListingStatus } from "@prisma/client";

// Mock listings data
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
    sellerId: "seller-1",
    seller: {
      name: "OGSeller",
      username: "og_seller",
      verifiedSeller: true,
      rating: 4.9
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
  },
  {
    id: "2",
    title: "Black Knight Bundle",
    description: "Account with Black Knight and other Season 2 Battle Pass items",
    price: 1.8,
    cryptoCurrency: "ETH",
    images: ["/black-knight.png"],
    category: Category.ACCOUNT,
    rarity: Rarity.EPIC,
    sellerId: "seller-2",
    seller: {
      name: "FortniteDealer",
      username: "fortnite_dealer",
      verifiedSeller: true,
      rating: 4.7
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
  },
  {
    id: "3",
    title: "Galaxy Skin",
    description: "Rare Galaxy skin obtained from Samsung promotion",
    price: 1.2,
    cryptoCurrency: "ETH",
    images: ["/galaxy-skin.png"],
    category: Category.SKIN,
    rarity: Rarity.EPIC,
    sellerId: "seller-3",
    seller: {
      name: "EpicCollector",
      username: "epic_collector",
      verifiedSeller: false,
      rating: 4.5
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
  },
  {
    id: "4",
    title: "Skull Trooper (Purple Glow)",
    description: "OG Skull Trooper with purple glow variant",
    price: 1.5,
    cryptoCurrency: "ETH",
    images: ["/skull-trooper.png"],
    category: Category.SKIN,
    rarity: Rarity.EPIC,
    sellerId: "seller-1",
    seller: {
      name: "OGSeller",
      username: "og_seller",
      verifiedSeller: true,
      rating: 4.9
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) // 1 day ago
  },
  {
    id: "5",
    title: "Travis Scott Skin",
    description: "Limited edition Travis Scott skin from Astronomical event",
    price: 0.9,
    cryptoCurrency: "ETH",
    images: ["/travis-scott.png"],
    category: Category.SKIN,
    rarity: Rarity.RARE,
    sellerId: "seller-4",
    seller: {
      name: "SkinVendor",
      username: "skin_vendor",
      verifiedSeller: false,
      rating: 4.2
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
  },
  {
    id: "6",
    title: "Wonder Skin Code",
    description: "Unused code for the Wonder skin from Honor promotion",
    price: 0.7,
    cryptoCurrency: "ETH",
    images: ["/wonder-skin.png"],
    category: Category.CODE,
    rarity: Rarity.RARE,
    sellerId: "seller-5",
    seller: {
      name: "CodeMaster",
      username: "code_master",
      verifiedSeller: true,
      rating: 4.8
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) // 10 days ago
  }
];

// Helper component for the Sort menu
const SortOptions = ({ currentSort, onSortChange }: {
  currentSort: string;
  onSortChange: (sort: string) => void;
}) => {
  const options = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "rarity", label: "Rarity" }
  ];

  return (
    <Select value={currentSort} onValueChange={onSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Filter options for mobile/desktop
const FilterOptions = ({
  filters,
  setFilters,
  minMaxPrice,
  onApply
}: {
  filters: any;
  setFilters: (filters: any) => void;
  minMaxPrice: [number, number];
  onApply: () => void;
}) => {
  const categories = Object.values(Category);
  const rarities = Object.values(Rarity);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3">Category</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.category === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters({ ...filters, category: "" })}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={filters.category === category ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, category })}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Rarity</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.rarity === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters({ ...filters, rarity: "" })}
          >
            All
          </Button>
          {rarities.map(rarity => (
            <Button
              key={rarity}
              variant={filters.rarity === rarity ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, rarity })}
              className={filters.rarity === rarity ? "" : "border-gray-700"}
            >
              {rarity}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-3">
          <h4 className="text-sm font-medium">Price Range (ETH)</h4>
          <div className="text-sm">
            {filters.minPrice} - {filters.maxPrice}
          </div>
        </div>

        <Slider
          min={minMaxPrice[0]}
          max={minMaxPrice[1]}
          step={0.1}
          value={[filters.minPrice, filters.maxPrice]}
          onValueChange={(value) => setFilters({
            ...filters,
            minPrice: value[0],
            maxPrice: value[1]
          })}
          className="my-6"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setFilters({
            category: "",
            rarity: "",
            minPrice: minMaxPrice[0],
            maxPrice: minMaxPrice[1],
            search: filters.search,
            sort: filters.sort
          })}
        >
          Reset
        </Button>
        <Button
          className="flex-1"
          onClick={onApply}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default function MarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial filters from URL
  const initialFilters = {
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    rarity: searchParams.get("rarity") || "",
    minPrice: parseFloat(searchParams.get("minPrice") || "0"),
    maxPrice: parseFloat(searchParams.get("maxPrice") || "5"),
    sort: searchParams.get("sort") || "newest"
  };

  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(filters); // For the filter sheet
  const [isLoading, setIsLoading] = useState(false);
  const [listings, setListings] = useState(mockListings);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Calculate min/max price for the range slider
  const minMaxPrice: [number, number] = [0, 5]; // Hardcoded for demo, would be calculated from data

  // Apply filters and update URL
  const applyFilters = () => {
    setIsLoading(true);

    // Build query string
    const params = new URLSearchParams();
    if (tempFilters.search) params.set("search", tempFilters.search);
    if (tempFilters.category) params.set("category", tempFilters.category);
    if (tempFilters.rarity) params.set("rarity", tempFilters.rarity);
    if (tempFilters.minPrice > minMaxPrice[0]) params.set("minPrice", tempFilters.minPrice.toString());
    if (tempFilters.maxPrice < minMaxPrice[1]) params.set("maxPrice", tempFilters.maxPrice.toString());
    if (tempFilters.sort) params.set("sort", tempFilters.sort);

    // Update URL
    router.push(`/marketplace?${params.toString()}`, { scroll: false });

    // Apply filters
    setFilters(tempFilters);
    setIsFilterOpen(false);

    // Simulate API call
    setTimeout(() => {
      let filtered = [...mockListings];

      // Apply category filter
      if (tempFilters.category) {
        filtered = filtered.filter(item => item.category === tempFilters.category);
      }

      // Apply rarity filter
      if (tempFilters.rarity) {
        filtered = filtered.filter(item => item.rarity === tempFilters.rarity);
      }

      // Apply price filter
      filtered = filtered.filter(
        item => item.price >= tempFilters.minPrice && item.price <= tempFilters.maxPrice
      );

      // Apply search filter
      if (tempFilters.search) {
        const searchLower = tempFilters.search.toLowerCase();
        filtered = filtered.filter(
          item =>
            item.title.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      switch (tempFilters.sort) {
        case "newest":
          filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          break;
        case "oldest":
          filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
          break;
        case "price_low":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price_high":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "rarity":
          const rarityOrder: Record<Rarity, number> = {
            [Rarity.COMMON]: 1,
            [Rarity.UNCOMMON]: 2,
            [Rarity.RARE]: 3,
            [Rarity.EPIC]: 4,
            [Rarity.LEGENDARY]: 5,
            [Rarity.MYTHIC]: 6
          };
          filtered.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
          break;
        default:
          break;
      }

      setListings(filtered);
      setIsLoading(false);
    }, 500);
  };

  // Search handler
  const handleSearch = (searchTerm: string) => {
    setTempFilters({ ...tempFilters, search: searchTerm });
  };

  // Handle sort change
  const handleSortChange = (sortValue: string) => {
    setTempFilters({ ...tempFilters, sort: sortValue });
    setTimeout(() => applyFilters(), 0);
  };

  // Apply filters on initial load
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset filters handler
  const resetFilters = () => {
    setTempFilters({
      ...tempFilters,
      category: "",
      rarity: "",
      minPrice: minMaxPrice[0],
      maxPrice: minMaxPrice[1]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Fortnite Marketplace</h1>
          <p className="text-gray-400">
            Browse and buy Fortnite items, skins, and accounts from verified sellers
          </p>
        </div>

        {/* Search and Filters - Desktop */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for items, skins, accounts..."
              className="pl-10 bg-gray-800 border-gray-700"
              value={tempFilters.search}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <div className="flex gap-2">
            {/* Desktop Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="hidden md:flex">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[320px] sm:w-[540px] bg-gray-800 border-gray-700">
                <SheetHeader>
                  <SheetTitle className="text-white">Filter Listings</SheetTitle>
                  <SheetDescription>
                    Refine your search with the following options.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <FilterOptions
                    filters={tempFilters}
                    setFilters={setTempFilters}
                    minMaxPrice={minMaxPrice}
                    onApply={applyFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
            </Button>

            {/* Sort Dropdown */}
            <SortOptions
              currentSort={tempFilters.sort}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.category || filters.rarity || filters.minPrice > minMaxPrice[0] || filters.maxPrice < minMaxPrice[1]) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>

            {filters.category && (
              <Badge variant="secondary" className="gap-1 pl-2">
                Category: {filters.category}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 rounded-full p-0 ml-1"
                  onClick={() => {
                    setTempFilters({ ...tempFilters, category: "" });
                    setTimeout(() => applyFilters(), 0);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {filters.rarity && (
              <Badge variant="secondary" className="gap-1 pl-2">
                Rarity: {filters.rarity}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 rounded-full p-0 ml-1"
                  onClick={() => {
                    setTempFilters({ ...tempFilters, rarity: "" });
                    setTimeout(() => applyFilters(), 0);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {(filters.minPrice > minMaxPrice[0] || filters.maxPrice < minMaxPrice[1]) && (
              <Badge variant="secondary" className="gap-1 pl-2">
                Price: {filters.minPrice} - {filters.maxPrice} ETH
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 rounded-full p-0 ml-1"
                  onClick={() => {
                    setTempFilters({
                      ...tempFilters,
                      minPrice: minMaxPrice[0],
                      maxPrice: minMaxPrice[1]
                    });
                    setTimeout(() => applyFilters(), 0);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => {
                resetFilters();
                setTimeout(() => applyFilters(), 0);
              }}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Listings */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">No listings found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your filters or search for something else.
            </p>
            <Button onClick={resetFilters}>Reset Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(listing => (
              <Card key={listing.id} className="bg-gray-800 border-gray-700 overflow-hidden flex flex-col">
                <div className="relative h-52 w-full">
                  <Image
                    src={listing.images[0] || getImagePlaceholder(listing.category === Category.SKIN ? "skin" : "item")}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getRarityColor(listing.rarity)}`}>
                      {listing.rarity}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline">{listing.category}</Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <Link href={`/marketplace/${listing.id}`}>
                    <CardTitle className="text-lg text-white hover:text-primary transition-colors">
                      {listing.title}
                    </CardTitle>
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>by {listing.seller.name}</span>
                    {listing.seller.verifiedSeller && (
                      <span className="text-blue-500">✓</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="py-0">
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {listing.description}
                  </p>
                </CardContent>

                <CardFooter className="flex justify-between items-center mt-auto pt-4">
                  <div className="font-bold text-white">
                    {listing.price} {listing.cryptoCurrency}
                  </div>
                  <Button asChild>
                    <Link href={`/marketplace/${listing.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
