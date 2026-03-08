import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const featuredItems = [
  {
    title: "Artisan Cakes",
    description: "Rich, decadent, and perfect for birthdays and celebrations.",
    price: "₹35.00+",
  },
  {
    title: "Gooey Brownies",
    description: "Our signature double chocolate fudge brownies.",
    price: "₹12.99",
  },
  {
    title: "Fruit Desserts",
    description: "Light, refreshing tartlets with seasonal fruits.",
    price: "₹8.50",
  },
  {
    title: "Fresh Cold Juices",
    description: "Squeezed daily from organic farm produce.",
    price: "₹5.00",
  },
];

export function FeaturedProductsSection() {
  return (
    <section className="py-24 sm:py-32 bg-[#FCF9F2]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-20 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-black tracking-tight text-neutral-800">
            Our Bakery Favorites
          </h2>
          <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed mt-3">
            Discover a taste of our most beloved creations. From sweet to savory, every item is baked with love and the finest ingredients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {featuredItems.map((item, idx) => {
            const getImageUrl = (title: string) => {
              if (title.includes("Cakes")) return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop";
              if (title.includes("Brownies")) return "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop";
              if (title.includes("Fruit Desserts")) return "https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600&auto=format&fit=crop";
              if (title.includes("Fresh Cold Juices")) return "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=600&auto=format&fit=crop";
              return "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"; // baked goods
            };

            return (
              <Card key={idx} className="flex flex-col border-none shadow-xl shadow-neutral-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white group">
                {/* Image Area */}
                <div className="h-64 sm:h-56 w-full relative overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${getImageUrl(item.title)})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <CardHeader className="px-5 sm:px-6 pt-6 pb-2">
                  <CardTitle className="text-xl font-serif font-bold text-neutral-800 tracking-tight group-hover:text-primary transition-colors">{item.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="px-5 sm:px-6 flex-1">
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {item.description}
                  </p>
                  <p className="mt-4 font-black text-xl text-primary">{item.price}</p>
                </CardContent>
                
                <CardFooter className="px-5 sm:px-6 pb-6 pt-4">
                  <Button className="w-full rounded-full h-12 text-sm font-bold shadow-md shadow-neutral-200 hover:shadow-primary/25 transition-all" variant="outline" asChild>
                    <Link href="/dashboard">View More</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-16 flex justify-center">
          <Button size="lg" className="rounded-full px-10 h-14 text-base font-black shadow-lg shadow-primary/20 active:scale-95 transition-all" asChild>
            <Link href="/dashboard">Explore Full Menu</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
