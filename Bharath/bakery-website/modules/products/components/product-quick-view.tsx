"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, Leaf, Info, Flame } from "lucide-react";
import { useState, useRef } from "react";
import { useAddToCart } from "@/modules/cart/hooks";
import { ReviewList } from "../../reviews/components/review-list";
import { Input } from "@/components/ui/input";

const NON_WEIGHT_CATEGORIES = ["juices", "brownies", "desserts", "sweets"];

interface ProductQuickViewProps {
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
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductQuickView({ product, isOpen, onOpenChange }: ProductQuickViewProps) {
  const isWeightBased = !product.category || !NON_WEIGHT_CATEGORIES.includes(product.category.toLowerCase());
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState(isWeightBased ? "1kg" : "Regular");
  const [customWeight, setCustomWeight] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);
  const addToCartMutation = useAddToCart();

  const isCustomSelected = weight === "Custom";
  const effectiveWeight = isCustomSelected && customWeight ? `${customWeight}kg` : weight;

  const getPriceForWeight = (w: string) => {
    if (!product.price) return "0.00";
    if (!isWeightBased) return product.price;

    switch (w) {
      case "1/4kg": return product.price_quarter || (Number(product.price) * 0.25).toFixed(2);
      case "1/2kg": return product.price_half || (Number(product.price) * 0.5).toFixed(2);
      case "1kg": return product.price;
      case "1.5kg": return product.price_one_half || (Number(product.price) * 1.5).toFixed(2);
      case "2kg": return product.price_two || (Number(product.price) * 2).toFixed(2);
      default: return product.price;
    }
  };

  const currentPrice = getPriceForWeight(weight);

  const handleAddToCart = () => {
    addToCartMutation.mutate({ productId: product.id, quantity, weight: effectiveWeight });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="p-0 overflow-hidden rounded-3xl sm:rounded-[3rem] border-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] bg-white !max-w-[1000px] w-[95vw] sm:w-[90vw]"
        style={{ maxWidth: '1000px' }} // Forcibly overrides sm:max-w-lg from dialog.tsx
      >
        <DialogDescription className="sr-only">Detailed view of {product.name}</DialogDescription>
        <div className="flex flex-col md:flex-row min-h-[500px] sm:min-h-[600px] md:max-h-[85vh]">
          {/* Left: Image Section */}
          <div className="w-full md:w-1/2 relative bg-neutral-100 min-h-[300px] md:min-h-full shrink-0">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: product.image_url ? `url(${product.image_url})` : "none" }}
            />
            {/* Subtle Gradient overlay for premium feel */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
          </div>

          {/* Right: Details Section */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-8 lg:p-10 flex flex-col bg-white overflow-y-auto">
            <DialogHeader className="mb-6 text-left">
              <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-widest text-xs mb-4 px-4 py-1.5 rounded-full">
                {product.category || "Bakery Element"}
              </Badge>
              <DialogTitle className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-neutral-800 leading-[1.15] tracking-tight break-words whitespace-normal">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 flex flex-col">
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-primary drop-shadow-sm">₹{currentPrice}</span>
                {isWeightBased && weight !== "1kg" && <span className="text-base text-neutral-500 font-bold uppercase tracking-wider">({weight})</span>}
              </div>

              <p className="text-base sm:text-lg text-neutral-500 leading-relaxed font-medium mb-6">
                {product.description || "Freshly baked daily using centuries-old techniques and the finest organic ingredients sourced from local farms."}
              </p>

              {/* Nutrition/Features Layout - styled as premium cards */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-auto pb-10 border-b border-neutral-100/80">
                <div className="flex flex-col items-center justify-center gap-2 py-3 px-2 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-sm transition-transform hover:-translate-y-1">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">320 kcal</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 py-3 px-2 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-sm transition-transform hover:-translate-y-1">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Organic</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 py-3 px-2 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-sm transition-transform hover:-translate-y-1">
                  <Info className="w-5 h-5 text-blue-500" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Handmade</span>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-col gap-4 mt-6 pt-2">
                {isWeightBased && (
                  <div className="flex items-center gap-3 w-full border-b pb-4 mb-2 border-neutral-100">
                    <span className="text-sm font-bold uppercase tracking-wider text-neutral-400">Weight</span>
                    <div className="flex gap-2 w-full overflow-x-auto no-scrollbar">
                      {["1/4kg", "1/2kg", "1kg", "1.5kg", "2kg", "Custom"].map((w) => (
                        <button
                          key={w}
                          className={`px-4 py-2 border-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${weight === w ? "border-primary text-primary bg-primary/5" : "border-neutral-200 text-neutral-500 hover:border-primary/20 hover:text-primary"}`}
                          onClick={() => { setWeight(w); if (w === "Custom") setTimeout(() => customInputRef.current?.focus(), 50); }}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                    {isCustomSelected && (
                      <div className="pt-3 flex items-center gap-2">
                        <Input
                          ref={customInputRef}
                          type="number"
                          min="0.25"
                          step="0.25"
                          placeholder="Enter kg (e.g. 2.5)"
                          value={customWeight}
                          onChange={(e) => setCustomWeight(e.target.value)}
                          className="h-9 rounded-full text-sm border-primary/30 focus:border-primary"
                        />
                        <span className="text-sm font-bold text-neutral-500 whitespace-nowrap">kg</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Quantity Control Pill */}
                  <div className="w-full sm:w-auto flex items-center justify-between gap-6 bg-white px-2 py-2 rounded-full border-2 border-neutral-100 shadow-sm">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-full hover:bg-neutral-100 text-neutral-600 shrink-0 transition-colors"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-5 h-5" />
                    </Button>
                    <span className="font-black text-xl min-w-[2rem] text-center text-neutral-800">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-full hover:bg-neutral-100 text-neutral-600 shrink-0 transition-colors"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    className="w-full sm:flex-1 h-[56px] rounded-full text-lg font-black gap-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] shadow-primary/40 active:scale-95 transition-all text-white shrink-0 hover:bg-primary/90"
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                  >
                    <ShoppingCart className="w-6 h-6" />
                    <span>Add {quantity > 1 ? `${quantity} items` : `to Cart`}</span>
                  </Button>
                </div>
              </div>

              <ReviewList productId={product.id} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
