"use client";

import { useToast } from "@/hooks/use-toast";
import { updateOrderStatus, updatePaymentStatus } from "@/modules/orders/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const ORDER_STATUSES = [
  "awaiting_payment",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export function StatusUpdater({
  orderId,
  currentStatus,
  currentPaymentStatus,
  paymentMethod,
}: {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
  paymentMethod: string;
}) {
  const { toast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) {
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus.replace("_", " ")}.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update status",
        variant: "destructive",
      });
      setStatus(currentStatus); // revert
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    setPaymentStatus(newStatus);
    const result = await updatePaymentStatus(orderId, newStatus);
    if (result.success) {
      toast({
        title: "Payment Status Updated",
        description: `Payment status changed to ${newStatus}.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update payment status",
        variant: "destructive",
      });
      setPaymentStatus(currentPaymentStatus); // revert
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-neutral-600 font-medium">Order Status</Label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full bg-neutral-50 border-neutral-200">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-neutral-600 font-medium">
          Payment Status 
          <span className="ml-2 text-xs font-normal text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full capitalize">
            {paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
          </span>
        </Label>
        <Select value={paymentStatus} onValueChange={handlePaymentStatusChange}>
          <SelectTrigger className="w-full bg-neutral-50 border-neutral-200">
            <SelectValue placeholder="Select payment status" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
