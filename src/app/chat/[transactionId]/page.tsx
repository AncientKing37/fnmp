"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  Send,
  Paperclip,
  ShieldCheck,
  AlertCircle,
  Clock,
  Check,
  UserCheck,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getImagePlaceholder, getInitials, generateAvatar } from "@/lib/utils";
import { TransactionStatus, UserRole } from "@prisma/client";

// Mock transaction data
const mockTransaction = {
  id: "tx-12345",
  status: TransactionStatus.IN_PROGRESS,
  amount: 2.5,
  cryptoCurrency: "ETH",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  listing: {
    id: "listing-123",
    title: "Renegade Raider Account",
    images: ["/renegade-raider.png"]
  },
  seller: {
    id: "seller-1",
    name: "ProSeller",
    image: null
  },
  buyer: {
    id: "buyer-1",
    name: "FortniteFan",
    image: null
  },
  escrow: {
    id: "escrow-1",
    name: "EscrowAdmin",
    image: null
  }
};

// Mock chat messages
const mockMessages = [
  {
    id: "msg-1",
    senderId: "escrow-1",
    senderName: "EscrowAdmin",
    content: "Welcome to the secure chat for this transaction. I'll be your escrow agent to ensure a smooth transaction.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 48 hours ago
    isSystemMessage: true
  },
  {
    id: "msg-2",
    senderId: "seller-1",
    senderName: "ProSeller",
    content: "Thanks for purchasing my listing! I'm ready to provide the account details once the payment is confirmed.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47), // 47 hours ago
    isSystemMessage: false
  },
  {
    id: "msg-3",
    senderId: "buyer-1",
    senderName: "FortniteFan",
    content: "Great! I've sent the payment. Looking forward to receiving the account.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 46), // 46 hours ago
    isSystemMessage: false
  },
  {
    id: "msg-4",
    senderId: "escrow-1",
    senderName: "EscrowAdmin",
    content: "Payment has been confirmed and is now in escrow. Seller, please provide the account details to the buyer.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
    isSystemMessage: true
  },
  {
    id: "msg-5",
    senderId: "seller-1",
    senderName: "ProSeller",
    content: "I'll send the account details via secure message. Please check your inbox in 5 minutes.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    isSystemMessage: false
  }
];

export default function ChatPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [transaction, setTransaction] = useState(mockTransaction);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user is part of the transaction
  const isUserBuyer = session?.user?.id === transaction.buyer.id;
  const isUserSeller = session?.user?.id === transaction.seller.id;
  const isUserEscrow = session?.user?.id === transaction.escrow.id || session?.user?.role === UserRole.ESCROW || session?.user?.role === UserRole.ADMIN;
  const hasAccess = isUserBuyer || isUserSeller || isUserEscrow;

  useEffect(() => {
    const fetchTransaction = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, would fetch transaction and messages from API
      setTransaction(mockTransaction);
      setMessages(mockMessages);
      setIsLoading(false);
    };

    if (session?.user?.id && transactionId) {
      fetchTransaction();
    }
  }, [session?.user?.id, transactionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      // In a real app, would send message to API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create a new message
      const newMessageObj = {
        id: `msg-${Date.now()}`,
        senderId: session?.user?.id!,
        senderName: session?.user?.name || "User",
        content: newMessage.trim(),
        timestamp: new Date(),
        isSystemMessage: false
      };

      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Render message bubble
  const MessageBubble = ({ message }: { message: (typeof mockMessages)[0] }) => {
    const isCurrentUser = message.senderId === session?.user?.id;
    const isEscrow = message.senderId === transaction.escrow.id;
    const messageTime = format(message.timestamp, "h:mm a");

    if (message.isSystemMessage) {
      return (
        <div className="flex justify-center my-4">
          <div className="bg-gray-800 text-gray-300 text-sm py-1 px-3 rounded-full flex items-center">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-primary" />
            <span>{message.content}</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}>
        <div className={`flex gap-2 max-w-[80%] ${isCurrentUser ? "flex-row-reverse" : ""}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={generateAvatar(message.senderName)} />
            <AvatarFallback>{getInitials(message.senderName)}</AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <div className="flex items-end gap-2">
              <div className={`px-3 py-2 rounded-lg ${
                isCurrentUser
                  ? "bg-primary text-primary-foreground"
                  : isEscrow
                    ? "bg-purple-900/50 text-white"
                    : "bg-gray-800 text-white"
              }`}>
                {!isCurrentUser && (
                  <div className="text-xs font-medium mb-1">
                    {message.senderName}
                    {isEscrow && (
                      <Badge variant="outline" className="ml-1 text-xs py-0 h-3 text-primary border-primary">
                        Escrow
                      </Badge>
                    )}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
              <span className="text-xs text-gray-500">{messageTime}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle className="h-12 w-12 text-yellow-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Authentication Required</h1>
        <p className="text-gray-400 mb-4 max-w-md">
          Please sign in to access your transaction chats.
        </p>
        <Button asChild>
          <Link href={`/login?callbackUrl=/chat/${transactionId}`}>
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-4 max-w-md">
          You don't have permission to view this chat. Only the buyer, seller, and escrow agent can access this conversation.
        </p>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            Go to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col py-6">
      <div className="container mx-auto px-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-white">Transaction Chat</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          {/* Chat Window - Takes more space */}
          <Card className="lg:col-span-3 bg-gray-800 border-gray-700 flex flex-col">
            <CardHeader className="border-b border-gray-700 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">{transaction.listing.title}</CardTitle>
                  <CardDescription>
                    Transaction ID: {transaction.id}
                  </CardDescription>
                </div>
                <Badge
                  className={
                    transaction.status === TransactionStatus.COMPLETED
                      ? "bg-green-600"
                      : transaction.status === TransactionStatus.PENDING
                      ? "bg-yellow-600"
                      : "bg-blue-600"
                  }
                >
                  {transaction.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="overflow-y-auto flex-1 pt-4">
              <div className="space-y-2">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            <CardFooter className="border-t border-gray-700 pt-3">
              <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="bg-gray-900 border-gray-700"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardFooter>
          </Card>

          {/* Transaction Info - Takes less space */}
          <Card className="bg-gray-800 border-gray-700 h-fit">
            <CardHeader>
              <CardTitle className="text-white text-base">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={transaction.listing.images[0] || getImagePlaceholder("item")}
                    alt={transaction.listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-white">{transaction.listing.title}</p>
                  <p className="text-sm text-muted-foreground">{transaction.amount} {transaction.cryptoCurrency}</p>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Buyer</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={transaction.buyer.image || generateAvatar(transaction.buyer.name)} />
                      <AvatarFallback>{getInitials(transaction.buyer.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-white">{transaction.buyer.name}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Seller</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={transaction.seller.image || generateAvatar(transaction.seller.name)} />
                      <AvatarFallback>{getInitials(transaction.seller.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-white">{transaction.seller.name}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Escrow Agent</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={transaction.escrow.image || generateAvatar(transaction.escrow.name)} />
                      <AvatarFallback>{getInitials(transaction.escrow.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-white">{transaction.escrow.name}</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/dashboard/transactions/${transaction.id}`}>
                    View Transaction Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
