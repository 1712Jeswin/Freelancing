"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/modules/cart/hooks";
import { Badge } from "@/components/ui/badge";

export function CartButton() {
  const { data: cartItems } = useCart();
  
  const itemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="relative rounded-full h-11 w-11 border-2 transition-all duration-300 hover:border-primary hover:text-primary shadow-sm hover:shadow-md active:scale-95" 
      asChild
    >
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        <span className="sr-only">Shopping Cart</span>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <Badge 
              className="relative inline-flex rounded-full h-6 w-6 items-center justify-center p-0 text-[10px] font-black border-2 border-background shadow-lg"
            >
              {itemCount > 99 ? '99+' : itemCount}
            </Badge>
          </span>
        )}
      </Link>
    </Button>
  );
}
