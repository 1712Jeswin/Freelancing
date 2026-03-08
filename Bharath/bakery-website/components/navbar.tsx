import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CartButton } from "./cart-nav-button";
import { getCategories } from "@/modules/categories/actions";
import { NavCategories } from "./nav-categories";
import { ChevronDown, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export async function Navbar() {
  const { userId } = await auth();
  
  // We can fetch categories securely server-side
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg rotate-3 group-hover:rotate-0 transition-transform duration-300">
            <Package className="h-6 w-6" />
          </div>
          <span className="text-2xl flex font-serif font-black tracking-tight text-neutral-800">
            Rizu Cake World
          </span>
        </Link>
        
        {/* Navigation Links */}
        <div className="hidden md:flex flex-1 items-center gap-6 ml-10">
          <Link
            href="/"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary relative py-1"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary relative py-1"
          >
            Shop
          </Link>

          {/* Orders Section Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary outline-none">
                Orders <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/orders?filter=current" className="flex items-center gap-2 cursor-pointer">
                  <Package className="h-4 w-4" />
                  Current Orders
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orders?filter=prev" className="flex items-center gap-2 cursor-pointer">
                  <Package className="h-4 w-4 opacity-70" />
                  Prev Orders
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orders" className="flex items-center gap-2 border-t mt-1 cursor-pointer pt-2 font-medium">
                  All Orders
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Auth CTA Actions */}
        <div className="flex items-center gap-4">
          {!userId ? (
            <>
              <Button variant="ghost" className="rounded-full font-bold px-6" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button className="rounded-full font-bold px-6 shadow-md shadow-primary/20" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <CartButton />
              <UserButton />
            </div>
          )}
        </div>
      </div>

      <NavCategories categories={categories} />
    </header>
  );
}
