import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";

export async function HeroSection() {
  const { userId } = await auth();

  // If the user has an active session, they go direct to the dashboard.
  // Otherwise, we prompt them to login/register.
  const targetCtaRoute = userId ? "/dashboard" : "/login";

  return (
    <section className="relative w-full overflow-hidden bg-[#FCF9F2] min-h-[90vh] flex items-center pt-24 pb-16">
      {/* Background Decor Elements */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-multiply" 
      />
      
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[500px] h-[500px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 text-center max-w-5xl">
        <h1 className="text-4xl font-serif font-black tracking-tight sm:text-5xl md:text-6xl text-neutral-800 leading-[1.1]">
          Freshly Baked, <br className="hidden sm:block" />
          <span className="text-primary mt-2 block">Delivered Daily.</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
          Experience the finest artisan breads, heavenly cakes, and rich desserts handcrafted from scratch with premium organic ingredients.
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button size="lg" className="rounded-full h-14 px-10 text-lg font-black shadow-2xl shadow-primary/25 active:scale-95 transition-all w-full sm:w-auto" asChild>
            <Link href={targetCtaRoute}>Shop Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
