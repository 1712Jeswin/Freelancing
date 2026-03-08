import { getProducts } from "@/modules/products/actions";
import { ProductGrid } from "@/modules/products/components/product-grid";
import { SearchBar } from "@/modules/products/components/search-bar";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const categoryId = resolvedParams.category || "all";
  
  // Fetch products based on search params
  const products = await getProducts({ query, categoryId });

  return (
    <div className="min-h-screen bg-[#FCF9F2]">
      <div className="container mx-auto py-12 px-4 md:px-6 max-w-7xl">
        {/* Controls Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <div className="flex-1 w-full md:w-auto text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-neutral-800">Our Menu</h2>
            {query && <p className="text-muted-foreground mt-2 font-medium">Showing results for "{query}"</p>}
          </div>
          <div className="w-full md:w-96 flex justify-center md:justify-end">
            <SearchBar />
          </div>
        </div>

        <main className="w-full pb-20">
          <ProductGrid products={products} />
        </main>
      </div>
    </div>
  );
}
