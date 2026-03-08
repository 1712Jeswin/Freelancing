import { Button } from "@/components/ui/button";
import { Instagram, MessageCircle } from "lucide-react";

export function ContactSection() {
  return (
    <section className="py-24 bg-[#FCF9F2] relative overflow-hidden">
      {/* Subtle Flour Dust Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />
      
      <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-widest uppercase">
          Get In Touch
        </div>
        
        <h2 className="text-4xl md:text-5xl font-serif font-black text-neutral-800 mb-6 tracking-tight">
          Say Hello to the Bakers
        </h2>
        
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto font-medium">
          Have a special request or want to place a custom order? Reach out to us on our social platforms or drop us a message on WhatsApp. We'd love to hear from you!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button 
            variant="outline"
            className="h-16 px-8 rounded-[2.5rem] text-lg font-bold shadow-lg transition-all hover:bg-green-500 hover:text-white hover:border-green-500 border-2 active:scale-95 bg-white w-full sm:w-auto"
            asChild
          >
            <a href="https://wa.me/918270414277" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              WhatsApp Us
            </a>
          </Button>

          <Button 
            variant="outline"
            className="h-16 px-8 rounded-[2.5rem] text-lg font-bold shadow-lg transition-all hover:bg-pink-600 hover:text-white hover:border-pink-600 border-2 active:scale-95 bg-white w-full sm:w-auto"
            asChild
          >
            <a href="https://instagram.com/rizu_cake_world/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
              <Instagram className="w-6 h-6" />
              Instagram
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
