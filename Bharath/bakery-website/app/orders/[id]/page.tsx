import { getOrderDetails } from "@/modules/orders/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, CheckCircle, Clock, CreditCard, MapPin, Package, ReceiptText, Truck, XCircle, CalendarIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CancelOrderButton } from "./cancel-order-button";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const orderData = await getOrderDetails(id);

  if (!orderData) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-8">This order does not exist or you do not have permission to view it.</p>
        <Button asChild>
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const { order, items } = orderData;

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      case 'processing': return <Package className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case 'cancelled': return "bg-red-500/10 text-red-600 border-red-500/20";
      case 'shipped': return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case 'processing': return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default: return "bg-neutral-500/10 text-neutral-600 border-neutral-500/20";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-6 -ml-4 hover:bg-neutral-100 rounded-full px-4 h-10 group transition-all">
          <Link href="/orders">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 pb-6 border-b border-neutral-200/60">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight mb-2 text-neutral-800">Order #{order.id.split('-')[0]}</h1>
          <p className="text-muted-foreground font-medium text-base flex items-center gap-2">
            <Clock className="w-4 h-4" /> 
            Placed on {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
        <Badge variant="outline" className={cn("text-sm py-1.5 px-4 font-black tracking-widest uppercase flex items-center gap-2 border-2", getStatusColor(order.status))}>
          {getStatusIcon(order.status)}
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-serif font-black text-neutral-800">Items Ordered ({items.length})</h2>
          </div>
          
          <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-100">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-5 sm:p-6 hover:bg-neutral-50/50 transition-colors">
                    <div 
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-muted/20 bg-cover bg-center shrink-0 border border-neutral-100 shadow-sm"
                      style={{ backgroundImage: item.product.image_url ? `url(${item.product.image_url})` : "none" }}
                    />
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h4 className="font-serif font-black text-lg sm:text-xl text-neutral-800 line-clamp-2">{item.product.name}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 hover:bg-neutral-100 text-xs font-bold border-none px-2 py-0.5">
                          Qty: {item.quantity}
                        </Badge>
                        {item.weight && (
                          <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 uppercase tracking-widest text-neutral-500 border-neutral-200">
                            {item.weight}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-black text-lg text-primary flex justify-end items-center">
                      ₹{Number(item.historical_price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-serif font-black text-neutral-800">Delivery Address</h2>
              </div>
              
              <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden relative group flex-1">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 group-hover:w-2 transition-all" />
                <CardContent className="p-6 pl-8 h-full flex flex-col justify-center">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">Expected Delivery</p>
                      <p className="text-lg font-black text-neutral-800">
                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">Address</p>
                      {order.shipping_address ? (
                        <p className="whitespace-pre-line text-neutral-600 font-medium leading-relaxed text-base">
                          {order.shipping_address}
                        </p>
                      ) : (
                        <p className="text-muted-foreground font-medium text-base italic">
                          Contacting bakery for pickup details...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-serif font-black text-neutral-800">Payment Details</h2>
              </div>
              
              <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden relative group flex-1">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 group-hover:w-2 transition-all" />
                <CardContent className="p-6 pl-8 flex flex-col justify-center h-full">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">Method</p>
                      <p className="text-lg font-black text-neutral-800">
                        {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">Status</p>
                      <p className={cn(
                        "text-lg font-black capitalize",
                        order.payment_status === 'paid' ? 'text-emerald-600' : 
                        order.payment_status === 'pending' ? 'text-amber-600' : 'text-neutral-600'
                      )}>
                        {order.payment_status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <ReceiptText className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-serif font-black text-neutral-800">Order Summary</h2>
            </div>
            
            <Card className="rounded-[2rem] border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] bg-gradient-to-br from-[#FCF9F2] to-[#F2EFE8] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
              <CardContent className="p-6 relative z-10">
                <div className="space-y-4 font-medium text-neutral-600 text-base">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2"><ReceiptText className="w-4 h-4 text-neutral-400" /> Subtotal</span>
                    <span className="font-bold text-neutral-800">₹{order.subtotal || order.total_price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-neutral-400" /> Shipping</span>
                    <span className="font-bold text-neutral-800">{order.shipping_cost ? `₹${order.shipping_cost}` : <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md text-xs tracking-widest uppercase font-black">Free</span>}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-neutral-400" /> Tax</span>
                    <span className="font-bold text-neutral-800">₹{order.tax_amount || "0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-neutral-200/60 pb-4">
                    <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-neutral-400" /> Delivery Date</span>
                    <span className="font-bold text-neutral-800">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "Not specified"}</span>
                  </div>
                  <div className="flex justify-between font-black text-2xl pt-2">
                    <span className="font-serif text-neutral-800">Total</span>
                    <span className="text-primary drop-shadow-sm">₹{order.total_price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {order.status === 'cancelled' && order.cancellation_reason && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-serif font-black text-neutral-800">Cancellation Info</h2>
              </div>
              
              <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 group-hover:w-2 transition-all" />
                <CardContent className="p-6 pl-8">
                  <p className="font-bold text-neutral-800 mb-2">{order.cancellation_reason}</p>
                  {order.cancellation_details && (
                    <p className="text-neutral-600 font-medium leading-relaxed text-sm">
                      {order.cancellation_details}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <CancelOrderButton orderId={order.id} orderStatus={order.status} />
        </div>
      </div>
    </div>
  );
}
