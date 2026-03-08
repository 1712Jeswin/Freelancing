"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cancelOrder } from "@/modules/orders/actions";
import { useRouter } from "next/navigation";

export function CancelOrderButton({ orderId, orderStatus }: { orderId: string, orderStatus: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string>("Changed my mind");
  const [details, setDetails] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  if (orderStatus === "cancelled" || orderStatus === "delivered" || orderStatus === "shipped") {
    return null;
  }

  const handleCancel = async () => {
    if (reason === "Others" && !details.trim()) {
      toast({
        title: "Required",
        description: "Please provide details for the cancellation.",
        variant: "destructive"
      });
      return;
    }

    // Limit words to ~100
    if (details.split(/\s+/).length > 100) {
      toast({
        title: "Too long",
        description: "Please keep your details under 100 words.",
        variant: "destructive"
      });
      return;
    }

    setIsCancelling(true);
    try {
      const result = await cancelOrder(orderId, reason, reason === "Others" ? details : undefined);
      if (result.success) {
        toast({
          title: "Order Cancelled",
          description: "Your order has been successfully cancelled.",
        });
        setIsOpen(false);
        router.refresh(); // Refresh the page to show the cancelled status
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to cancel order.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 rounded-full h-12 px-6 font-bold mt-6 w-full shadow-sm">
          Cancel Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-black">Cancel Order</DialogTitle>
          <DialogDescription className="font-medium">
            Please let us know why you are cancelling this order.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label className="mb-4 block font-bold text-neutral-800 text-lg">Reason for cancellation</Label>
          <RadioGroup value={reason} onValueChange={setReason} className="space-y-3">
            <div className="flex items-center space-x-3 bg-neutral-50 border border-neutral-100 p-3 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
              <RadioGroupItem value="Changed my mind" id="r1" />
              <Label htmlFor="r1" className="cursor-pointer flex-1 font-medium">Changed my mind</Label>
            </div>
            <div className="flex items-center space-x-3 bg-neutral-50 border border-neutral-100 p-3 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
              <RadioGroupItem value="Found a better price" id="r2" />
              <Label htmlFor="r2" className="cursor-pointer flex-1 font-medium">Found a better price</Label>
            </div>
            <div className="flex items-center space-x-3 bg-neutral-50 border border-neutral-100 p-3 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
              <RadioGroupItem value="Ordered by mistake" id="r3" />
              <Label htmlFor="r3" className="cursor-pointer flex-1 font-medium">Ordered by mistake</Label>
            </div>
            <div className="flex items-center space-x-3 bg-neutral-50 border border-neutral-100 p-3 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
              <RadioGroupItem value="Estimated delivery time is too long" id="r4" />
              <Label htmlFor="r4" className="cursor-pointer flex-1 font-medium">Estimated delivery time is too long</Label>
            </div>
            <div className="flex flex-col space-y-3 bg-neutral-50 border border-neutral-100 p-3 rounded-xl transition-colors">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="Others" id="r5" />
                <Label htmlFor="r5" className="cursor-pointer flex-1 font-medium">Others</Label>
              </div>
              {reason === "Others" && (
                <div className="pl-7 mt-2">
                  <Textarea 
                    placeholder="Tell us more (max 100 words)..." 
                    className="resize-none rounded-xl" 
                    value={details}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDetails(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {details.split(/\s+/).filter(w => w.length > 0).length}/100 words
                  </p>
                </div>
              )}
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-full">Keep Order</Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isCancelling} className="rounded-full">
            {isCancelling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
