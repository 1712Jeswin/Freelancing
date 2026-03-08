"use client";

import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useRemoveFromCart, useUpdateCartQuantity } from "../hooks";

interface CartItem {
  id: string; // The cart_item ID
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string | null;
    image_url: string | null;
  };
  weight?: string | null;
}

export function CartItemCard({ item }: { item: CartItem }) {
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeMutation = useRemoveFromCart();

  const handleIncrease = () => {
    updateQuantityMutation.mutate({ cartItemId: item.id, quantity: item.quantity + 1 });
  };

  const handleDecrease = () => {
    if (item.quantity <= 1) {
      removeMutation.mutate(item.id);
    } else {
      updateQuantityMutation.mutate({ cartItemId: item.id, quantity: item.quantity - 1 });
    }
  };

  const handleRemove = () => {
    removeMutation.mutate(item.id);
  };

  const isUpdating = updateQuantityMutation.isPending || removeMutation.isPending;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 py-6 border-b border-neutral-100 group">
      {/* Product Image */}
      <div 
        className="w-full sm:w-28 h-32 sm:h-28 rounded-2xl bg-cover bg-center bg-muted/20 shrink-0 relative overflow-hidden group-hover:shadow-md transition-shadow duration-300"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: item.product.image_url ? `url(${item.product.image_url})` : "none" }}
        />
      </div>
      
      {/* Product Info & Controls Container */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col mb-4 sm:mb-0">
            <h4 className="font-serif font-bold text-xl sm:text-2xl text-neutral-800 leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {item.product.name}
            </h4>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded border text-muted-foreground uppercase">{item.weight}</span>
              <p className="text-muted-foreground font-semibold">₹{item.product.price} each</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="sm:hidden h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            onClick={handleRemove}
            disabled={isUpdating}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between w-full mt-auto">
          <div className="flex items-center border border-neutral-200 rounded-full bg-neutral-50/50 p-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white text-neutral-600 hover:text-primary shadow-sm hover:shadow transition-all"
              onClick={handleDecrease}
              disabled={isUpdating}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center text-lg font-black text-neutral-800">{item.quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white text-neutral-600 hover:text-primary shadow-sm hover:shadow transition-all"
              onClick={handleIncrease}
              disabled={isUpdating}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Total</span>
              <span className="text-2xl font-black text-primary leading-none">
                ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
              </span>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:inline-flex h-10 w-10 text-muted-foreground hover:bg-red-50 hover:text-red-500 rounded-full transition-colors shrink-0"
              onClick={handleRemove}
              disabled={isUpdating}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
