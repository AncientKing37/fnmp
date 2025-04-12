"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Upload, Plus, Trash, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Category, Rarity, UserRole } from "@prisma/client";

// Form schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description must be less than 2000 characters"),
  category: z.nativeEnum(Category, {
    required_error: "Please select a category",
  }),
  rarity: z.nativeEnum(Rarity, {
    required_error: "Please select a rarity",
  }),
  price: z.coerce.number().positive("Price must be a positive number"),
  cryptoCurrency: z.string().default("ETH"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewListingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      rarity: undefined,
      price: undefined,
      cryptoCurrency: "ETH",
    },
  });

  // Check if user is a seller
  if (status === "authenticated" &&
      session?.user?.role !== UserRole.SELLER &&
      session?.user?.role !== UserRole.ADMIN) {
    router.push("/dashboard/become-seller");
  }

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, would call API to create listing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock API response
      const mockResponse = {
        id: "new-listing-" + Math.random().toString(36).substring(2, 9),
        ...data,
        images,
        createdAt: new Date(),
        status: "AVAILABLE",
      };

      toast.success("Listing created successfully!");

      // Redirect to seller dashboard
      setTimeout(() => {
        router.push("/dashboard/seller");
      }, 1000);
    } catch (error) {
      toast.error("Failed to create listing");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // File upload handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Mock image upload
    Array.from(files).forEach(file => {
      // In a real app, would upload to storage and get URL
      const mockImageUrl = URL.createObjectURL(file);
      setImages(prev => [...prev, mockImageUrl]);
    });

    // Clear input
    e.target.value = "";
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create New Listing</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Listing Details</CardTitle>
                  <CardDescription>
                    Provide detailed information about your Fortnite item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Renegade Raider Account"
                            className="bg-gray-900 border-gray-700"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A clear and concise title that describes your item
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your item in detail including all relevant information..."
                            className="bg-gray-900 border-gray-700 min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of your item, including its features, history, and any other relevant information
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Images */}
                  <div className="space-y-4">
                    <div>
                      <Label>Images</Label>
                      <p className="text-sm text-gray-400 mt-1">
                        Add images of your item (up to 5 images)
                      </p>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group aspect-square rounded-md overflow-hidden border border-gray-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image}
                              alt={`Item preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}

                        {images.length < 5 && (
                          <div className="aspect-square rounded-md border border-dashed border-gray-700 bg-gray-900/50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-900/80 transition-colors">
                            <label htmlFor="image-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                              <Plus className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-400">Add Image</span>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                                multiple={images.length < 4}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    )}

                    {images.length === 0 && (
                      <div className="border border-dashed border-gray-700 rounded-md bg-gray-900/50 p-8">
                        <div className="flex flex-col items-center justify-center text-center">
                          <ImageIcon className="h-12 w-12 text-gray-500 mb-4" />
                          <h3 className="text-lg font-medium text-white mb-2">No images added</h3>
                          <p className="text-sm text-gray-400 mb-4">
                            Add at least one image to showcase your item
                          </p>
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <div className="inline-flex items-center justify-center h-9 px-4 py-2 rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90">
                              <Upload className="mr-2 h-4 w-4" />
                              <span>Upload Images</span>
                            </div>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                              multiple
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Listing Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-900 border-gray-700">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {Object.values(Category).map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of item you're selling
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rarity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rarity</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-900 border-gray-700">
                              <SelectValue placeholder="Select a rarity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {Object.values(Rarity).map((rarity) => (
                              <SelectItem key={rarity} value={rarity}>
                                {rarity}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The rarity level of your item
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="bg-gray-700" />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="bg-gray-900 border-gray-700"
                              {...field}
                            />
                          </FormControl>

                          <FormField
                            control={form.control}
                            name="cryptoCurrency"
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-[80px] bg-gray-900 border-gray-700">
                                  <SelectValue placeholder="ETH" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                  <SelectItem value="ETH">ETH</SelectItem>
                                  <SelectItem value="WETH">WETH</SelectItem>
                                  <SelectItem value="USDC">USDC</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <FormDescription>
                          Set a fair price for your item
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Listing"
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">Listing Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Use clear, high-quality images</p>
                  <p>• Be honest about the condition</p>
                  <p>• Provide specific details about included items</p>
                  <p>• Set a competitive price by checking similar listings</p>
                  <p>• Be responsive to buyer questions</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
