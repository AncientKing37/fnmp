"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  Copy,
  ExternalLink,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
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

const getStatusIcon = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.PENDING:
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case TransactionStatus.IN_PROGRESS:
      return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
    case TransactionStatus.COMPLETED:
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case TransactionStatus.CANCELLED:
      return <XCircle className="h-5 w-5 text-red-600" />;
    case TransactionStatus.DISPUTED:
      return <AlertCircle className="h-5 w-5 text-purple-600" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
};

// Mock transaction data
const mockTransaction = {
  id: "tx-123456",
  status: TransactionStatus.IN_PROGRESS,
  amount: 2.5,
  cryptoCurrency: "ETH",
  cryptoWalletAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
  listing: {
    id: "listing-123",
    title: "Renegade Raider + Black Knight Account",
    description: "OG Fortnite account with rare skins including Renegade Raider and Black Knight. Also includes various emotes and pickaxes from Season 1 and Season 2.",
    images: ["/renegade-raider.png", "/black-knight.png"],
    category: "ACCOUNT",
    rarity: "LEGENDARY"
  },
  seller: {
    id: "seller-123",
    name: "ProSeller",
    username: "pro_seller",
    image: null,
    rating: 4.8,
    verifiedSeller: true
  },
  buyer: {
    id: "buyer-123",
    name: "FortniteFan",
    username: "fortnite_fan",
    image: null
  },
  escrow: {
    id: "escrow-123",
    name: "EscrowAdmin",
    username: "escrow_admin",
    image: null
  },
  paymentConfirmed: true,
  itemDelivered: false,
  deliveryConfirmed: false,
  escrowReleased: false,
  disputeOpened: false,
  notes: "Delivery instructions: Account credentials will be sent via secure chat once payment is confirmed."
};

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [transaction, setTransaction] = useState(mockTransaction);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingAction, setIsSendingAction] = useState(false);

  // Determine user role in the transaction
  const isCurrentUserSeller = session?.user?.id === transaction.seller.id;
  const isCurrentUserBuyer = session?.user?.id === transaction.buyer.id;
  const isCurrentUserEscrow = session?.user?.id === transaction.escrow.id;
  const isEscrowRole = session?.user?.role === UserRole.ESCROW || session?.user?.role === UserRole.ADMIN;

  useEffect(() => {
    // Simulate fetching transaction data
    const fetchTransaction = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, would fetch data from API
      setTransaction(mockTransaction);
      setIsLoading(false);
    };

    fetchTransaction();
  }, [id]);

  // Helper for copying to clipboard
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  // Transaction status actions
  const confirmPayment = async () => {
    setIsSendingAction(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setTransaction(prev => ({
      ...prev,
      paymentConfirmed: true,
      status: TransactionStatus.IN_PROGRESS
    }));
    toast.success("Payment confirmed successfully");
    setIsSendingAction(false);
  };

  const confirmDelivery = async () => {
    setIsSendingAction(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setTransaction(prev => ({
      ...prev,
      deliveryConfirmed: true,
      status: TransactionStatus.COMPLETED
    }));
    toast.success("Delivery confirmed, funds have been released to the seller");
    setIsSendingAction(false);
  };

  const markAsDelivered = async () => {
    setIsSendingAction(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setTransaction(prev => ({
      ...prev,
      itemDelivered: true
    }));
    toast.success("Item marked as delivered, waiting for buyer confirmation");
    setIsSendingAction(false);
  };

  const releaseEscrow = async () => {
    setIsSendingAction(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setTransaction(prev => ({
      ...prev,
      escrowReleased: true,
      status: TransactionStatus.COMPLETED
    }));
    toast.success("Escrow funds released to seller");
    setIsSendingAction(false);
  };

  const openDispute = async () => {
    setIsSendingAction(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setTransaction(prev => ({
      ...prev,
      disputeOpened: true,
      status: TransactionStatus.DISPUTED
    }));
    toast.success("Dispute opened, an escrow agent will review your case");
    setIsSendingAction(false);
  };

  const cancelTransaction = async () => {
    setIsSendingAction(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setTransaction(prev => ({
      ...prev,
      status: TransactionStatus.CANCELLED
    }));
    toast.success("Transaction cancelled");
    setIsSendingAction(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-white">Transaction #{id}</h1>
        {getStatusBadge(transaction.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Transaction Details</CardTitle>
            <CardDescription>
              Created on {format(transaction.createdAt, "MMMM d, yyyy 'at' h:mm a")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Listing Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Item Information</h3>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative h-48 md:h-32 md:w-32 rounded-md overflow-hidden">
                  <Image
                    src={transaction.listing.images[0] || "/placeholder.png"}
                    alt={transaction.listing.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <Link
                    href={`/marketplace/${transaction.listing.id}`}
                    className="text-xl font-semibold text-white hover:text-primary transition-colors"
                  >
                    {transaction.listing.title}
                  </Link>

                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{transaction.listing.category}</Badge>
                    <Badge variant="outline" className="bg-yellow-900/30 text-yellow-500 border-yellow-800">
                      {transaction.listing.rarity}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground mt-2 line-clamp-2">
                    {transaction.listing.description}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* User Information */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Seller</h4>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={transaction.seller.image || ""} />
                    <AvatarFallback>
                      {transaction.seller.name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-white">{transaction.seller.name}</span>
                      {transaction.seller.verifiedSeller && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500 ml-1" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">@{transaction.seller.username}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Buyer</h4>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={transaction.buyer.image || ""} />
                    <AvatarFallback>
                      {transaction.buyer.name?.charAt(0) || "B"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium text-white">{transaction.buyer.name}</span>
                    <div className="text-sm text-muted-foreground">@{transaction.buyer.username}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Escrow Admin</h4>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={transaction.escrow.image || ""} />
                    <AvatarFallback>
                      {transaction.escrow.name?.charAt(0) || "E"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium text-white">{transaction.escrow.name}</span>
                    <div className="text-sm text-muted-foreground">@{transaction.escrow.username}</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Payment Information</h3>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Amount</h4>
                    <p className="text-xl font-semibold text-white">
                      {transaction.amount} {transaction.cryptoCurrency}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Status</h4>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      <span className="font-medium text-white">
                        {transaction.status.charAt(0) + transaction.status.slice(1).toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Payment Address</h4>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-gray-900 px-2 py-1 text-sm font-mono text-gray-300 flex-1 truncate">
                        {transaction.cryptoWalletAddress}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(
                          transaction.cryptoWalletAddress,
                          "Wallet address copied to clipboard"
                        )}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {transaction.notes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
                    <p className="text-white bg-gray-900 p-3 rounded-md">
                      {transaction.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status and Actions */}
        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Transaction Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${transaction.paymentConfirmed ? 'bg-green-600/20' : 'bg-gray-700'}`}>
                    <CreditCard className={`h-5 w-5 ${transaction.paymentConfirmed ? 'text-green-500' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Payment Sent</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.paymentConfirmed
                        ? "Payment confirmed"
                        : "Waiting for payment confirmation"}
                    </p>
                  </div>
                  {transaction.paymentConfirmed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </div>

                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${transaction.itemDelivered ? 'bg-green-600/20' : 'bg-gray-700'}`}>
                    <Package className={`h-5 w-5 ${transaction.itemDelivered ? 'text-green-500' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Item Delivered</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.itemDelivered
                        ? "Item delivered by seller"
                        : "Waiting for seller to deliver item"}
                    </p>
                  </div>
                  {transaction.itemDelivered && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </div>

                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${transaction.deliveryConfirmed ? 'bg-green-600/20' : 'bg-gray-700'}`}>
                    <CheckCircle2 className={`h-5 w-5 ${transaction.deliveryConfirmed ? 'text-green-500' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Delivery Confirmed</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.deliveryConfirmed
                        ? "Buyer confirmed receipt"
                        : "Waiting for buyer to confirm receipt"}
                    </p>
                  </div>
                  {transaction.deliveryConfirmed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </div>

                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${transaction.escrowReleased ? 'bg-green-600/20' : 'bg-gray-700'}`}>
                    <ShieldCheck className={`h-5 w-5 ${transaction.escrowReleased ? 'text-green-500' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Funds Released</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.escrowReleased
                        ? "Escrow funds released to seller"
                        : "Funds held in escrow"}
                    </p>
                  </div>
                  {transaction.escrowReleased && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buyer Actions */}
              {isCurrentUserBuyer && (
                <>
                  {!transaction.paymentConfirmed && (
                    <Button
                      className="w-full"
                      onClick={confirmPayment}
                      disabled={isSendingAction}
                    >
                      {isSendingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                      Confirm Payment Sent
                    </Button>
                  )}

                  {transaction.itemDelivered && !transaction.deliveryConfirmed && (
                    <Button
                      className="w-full"
                      onClick={confirmDelivery}
                      disabled={isSendingAction}
                    >
                      {isSendingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Confirm Item Received
                    </Button>
                  )}

                  {transaction.status !== TransactionStatus.COMPLETED &&
                   transaction.status !== TransactionStatus.CANCELLED &&
                   transaction.status !== TransactionStatus.DISPUTED && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={openDispute}
                      disabled={isSendingAction}
                    >
                      {isSendingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertCircle className="mr-2 h-4 w-4" />}
                      Open Dispute
                    </Button>
                  )}
                </>
              )}

              {/* Seller Actions */}
              {isCurrentUserSeller && (
                <>
                  {transaction.paymentConfirmed && !transaction.itemDelivered && (
                    <Button
                      className="w-full"
                      onClick={markAsDelivered}
                      disabled={isSendingAction}
                    >
                      {isSendingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Mark as Delivered
                    </Button>
                  )}

                  {!transaction.paymentConfirmed && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={cancelTransaction}
                      disabled={isSendingAction}
                    >
                      {isSendingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                      Cancel Transaction
                    </Button>
                  )}
                </>
              )}

              {/* Escrow Actions */}
              {(isCurrentUserEscrow || isEscrowRole) && (
                <>
                  {transaction.paymentConfirmed && transaction.itemDelivered && !transaction.escrowReleased && (
                    <Button
                      className="w-full"
                      onClick={releaseEscrow}
                      disabled={isSendingAction}
                    >
                      {isSendingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                      Release Escrow Funds
                    </Button>
                  )}

                  {transaction.status === TransactionStatus.DISPUTED && (
                    <>
                      <Button
                        className="w-full"
                        onClick={releaseEscrow}
                        disabled={isSendingAction}
                      >
                        {isSendingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        Resolve for Seller
                      </Button>

                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={cancelTransaction}
                        disabled={isSendingAction}
                      >
                        {isSendingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                        Resolve for Buyer
                      </Button>
                    </>
                  )}
                </>
              )}

              {/* Common Actions */}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/chat/${transaction.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Open Chat
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
