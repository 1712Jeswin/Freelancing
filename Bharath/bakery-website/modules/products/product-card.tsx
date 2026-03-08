"use client";

import {
  Card,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAddToCart, useCart } from "../cart/hooks";
import { Loader2, Plus, Minus, ShoppingCart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ProductQuickView } from "./components/product-quick-view";
import { Button } from "@/components/ui/button";

const NON_WEIGHT_CATEGORIES = ["juices", "brownies", "desserts", "sweets"];

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: string | null;
    price_quarter: string | null;
    price_half: string | null;
    price_one_half: string | null;
    price_two: string | null;
    image_url: string | null;
    category: string | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const isWeightBased = !product.category || !NON_WEIGHT_CATEGORIES.includes(product.category.toLowerCase());
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { data: cartItems } = useCart();
  const addToCartMutation = useAddToCart();

  // Find if this product is already in the cart
  const cartItem = cartItems?.find((item: any) => item.product.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
  };

  return (
    <>
      <Card 
        className="flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group bg-card rounded-[2.5rem] h-full flex-grow cursor-pointer"
        onClick={() => setQuickViewOpen(true)}
      >
        {/* Image Container with Glassmorphism Overlay */}
        <div className="overflow-hidden aspect-[4/3] w-full bg-muted/20 relative">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: product.image_url ? `url(${product.image_url})` : "none" }}
          />

          {/* Quick View Hover Indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/10 backdrop-blur-[1px]">
            <div className="bg-white/90 p-4 rounded-full shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
              <Eye className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          {/* Category Badge - Top Left */}
          {product.category && (
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-primary font-black px-3 py-1 text-[10px] tracking-wider uppercase shadow-xl">
                {product.category}
              </Badge>
            </div>
          )}

          {/* Bottom Glass Overlay on Image */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="flex flex-col flex-1 p-5 md:p-6 space-y-4">
          <div className="space-y-2">
            <CardTitle className="text-xl md:text-2xl font-serif text-neutral-800 leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {product.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">
              {product.description || "Freshly baked daily with premium ingredients."}
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-auto pt-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{isWeightBased ? "Base Price (1kg)" : "Price"}</span>
              <span className="text-2xl font-black text-primary leading-none">₹{product.price}</span>
            </div>

            <Button 
              variant={"outline"}
              className="rounded-2xl h-12 w-full gap-2 border-2 transition-all duration-300 font-bold border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
              onClick={(e) => { e.stopPropagation(); setQuickViewOpen(true); }}
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>

      <ProductQuickView 
        product={product} 
        isOpen={quickViewOpen} 
        onOpenChange={setQuickViewOpen} 
      />
    </>
  );
}
