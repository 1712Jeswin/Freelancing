import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start max-w-sm">
            <h3 className="text-xl font-bold mb-4">Rizu Cake World</h3>
            <p className="text-sm text-muted-foreground">
              Freshly baked goods delivered daily. Crafted with love, premium ingredients, and a passion for pastry.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="flex space-x-4">
              <Link href="https://instagram.com/rizu_cake_world/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="https://wa.me/918270414277" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-green-500 transition-colors">
                <MessageCircle className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Rizu Cake World. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
