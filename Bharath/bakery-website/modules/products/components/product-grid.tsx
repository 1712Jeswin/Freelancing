import { ProductCard } from "../product-card";

interface Product {
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
  created_at: Date;
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or category filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
