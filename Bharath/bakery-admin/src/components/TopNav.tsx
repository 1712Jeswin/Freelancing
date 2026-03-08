"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingCart, Store } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-6 max-w-7xl mx-auto justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold flex items-center gap-2 text-lg tracking-tight">
            <Store className="w-5 h-5 text-primary" />
            Admin Hub
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/products"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-100/80",
                pathname?.startsWith("/products")
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-500"
              )}
            >
              <Package className="w-4 h-4" />
              Products
            </Link>
            <Link
              href="/orders"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-100/80",
                pathname?.startsWith("/orders")
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-500"
              )}
            >
              <ShoppingCart className="w-4 h-4" />
              Orders
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
