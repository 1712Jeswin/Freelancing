"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect, useRef } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q")?.toString() || "");

  const initialRender = useRef(true);

  // Debounce search
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm) {
          params.set("q", searchTerm);
        } else {
          params.delete("q");
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder="Search artisanal treats..."
        className="pl-12 h-14 rounded-full text-lg shadow-sm border-neutral-200 bg-white placeholder:text-neutral-400 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-all font-medium"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isPending && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white pl-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
