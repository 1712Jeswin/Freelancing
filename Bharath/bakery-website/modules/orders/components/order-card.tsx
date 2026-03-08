import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: {
    id: string;
    total_price: string;
    status: string;
    created_at: Date | string;
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const isCompleted = order.status.toLowerCase() === "delivered";
  const isCancelled = order.status.toLowerCase() === "cancelled";
  const isProcessing = ["pending", "processing", "shipped"].includes(order.status.toLowerCase());

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (isCancelled) return <XCircle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  const getStatusBadgeVariant = () => {
    if (isCompleted) return "default";
    if (isCancelled) return "destructive";
    return "secondary";
  };

  return (
    <Card className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group rounded-[2.5rem] bg-white">
      <CardHeader className="bg-neutral-50 pb-6 border-b border-neutral-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100 group-hover:scale-105 transition-transform">
              <Package className="w-7 h-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-serif font-black text-neutral-800 tracking-tight">Order #{order.id.split('-')[0].toUpperCase()}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3" />
                Placed on {new Date(order.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Grand Total</p>
              <p className="text-xl font-black text-primary">₹{order.total_price}</p>
            </div>
            
            <Badge 
              variant={getStatusBadgeVariant()} 
              className={cn(
                "capitalize px-3 py-1 gap-1.5 border-none shadow-sm",
                isCompleted && "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
                isProcessing && "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20",
                isCancelled && "bg-destructive/10 text-destructive hover:bg-destructive/20"
              )}
            >
              {getStatusIcon()}
              {order.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 flex flex-col sm:flex-row justify-between items-center bg-card gap-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
          <p className="text-sm text-muted-foreground font-medium">
            {isProcessing ? "Your bakery items are being prepared with love." : "This order has been finalized and archived."}
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          className="rounded-xl group/btn hover:bg-primary/5 hover:text-primary transition-all pr-2" 
          asChild
        >
          <Link href={`/orders/${order.id}`}>
            View Details
            <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
