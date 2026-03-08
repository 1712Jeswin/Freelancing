import { Button } from "@/components/ui/button";

export function AboutSection() {
  return (
    <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
      {/* Decorative Text in Background */}
      <div className="absolute top-10 left-10 text-[10vw] font-serif font-black text-neutral-50/50 pointer-events-none tracking-tighter whitespace-nowrap z-0">
        Artisanal
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
          <div className="space-y-8 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-neutral-800 leading-tight">
              Baked with Passion. <br />
              <span className="text-primary italic font-normal">Served with Love.</span>
            </h2>
            <div className="space-y-5 text-base sm:text-lg text-neutral-600 font-medium leading-relaxed">
              <p>
                For generations, our family bakery has been the heart of the community. We wake up before dawn to knead, frost, and fire up the ovens bringing you a taste of nostalgia and warmth.
              </p>
              <p>
                We source only the finest local ingredients and refuse to take shortcuts. The result? Unforgettable pastries, breads, and cakes that bring people together, moment by moment.
              </p>
            </div>
            
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[500px] overflow-hidden rounded-[3rem] lg:max-w-none shadow-2xl shadow-primary/10 border-4 border-white group">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542826438-bd32f43d626f?q=80&w=800&auto=format&fit=crop')` }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </div>
        </div>
      </div>
    </section>
  );
}
