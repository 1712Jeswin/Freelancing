"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

export function NavCategories({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategory = searchParams.get("category") || "all";

  // Only show categories if we're on the dashboard
  if (pathname !== "/dashboard" && pathname !== "/products") return null;

  return (
    <div className="border-t bg-background/50 backdrop-blur-xl sticky top-16 z-40">
      <div className="container mx-auto flex items-center gap-8 px-4 h-14 overflow-x-auto no-scrollbar">
        <Link
          href="/dashboard"
          className={cn(
            "text-sm transition-all hover:text-primary whitespace-nowrap py-2 relative font-bold tracking-wide",
            currentCategory === "all" 
              ? "text-primary after:absolute after:bottom-[-2px] after:left-0 after:h-1 after:w-full after:bg-primary after:rounded-full" 
              : "text-muted-foreground/80 hover:bg-primary/5 rounded-lg px-2"
          )}
        >
          All Items
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/dashboard?category=${category.id}`}
            className={cn(
              "text-sm transition-all hover:text-primary whitespace-nowrap py-2 relative font-bold tracking-wide",
              currentCategory === category.id 
                ? "text-primary after:absolute after:bottom-[-2px] after:left-0 after:h-1 after:w-full after:bg-primary after:rounded-full" 
                : "text-muted-foreground/80 hover:bg-primary/5 rounded-lg px-2"
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
