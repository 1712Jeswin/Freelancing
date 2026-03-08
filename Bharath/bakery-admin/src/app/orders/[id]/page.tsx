import { getOrderDetails } from "@/modules/orders/actions";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { StatusUpdater } from "./status-updater";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetails(id);

  if (!order) {
    notFound();
  }

  // Safely parse the shipping address snapshot
  const addressLines = order.shipping_address ? order.shipping_address.split("\n") : [];

  let phoneNumber = "Not provided";
  if (order.shipping_address) {
    const phoneMatch = order.shipping_address.match(/Phone:\s*([^\n|]+)/i);
    if (phoneMatch && phoneMatch[1]) {
      phoneNumber = phoneMatch[1].trim();
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Order Details
          </h1>
          <p className="text-muted-foreground mt-2">
            Order ID: <span className="font-mono text-neutral-600">{order.id}</span>
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <p className="text-sm font-medium text-neutral-500">
            Placed on {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
          </p>
          <div className="flex items-center gap-2">
            Status:
            <Badge
              variant={order.status === "delivered" ? "default" : (order.status === "cancelled" ? "destructive" : "secondary")}
              className="capitalize ml-1"
            >
              {order.status.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg text-neutral-800 mb-4 border-b pb-2">Customer & Delivery</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-1">Customer</p>
                <p className="text-neutral-900 font-medium">{order.user_name || "Guest"}</p>
                <p className="text-neutral-600 text-sm">{order.user_email}</p>
                <p className="text-neutral-800 text-sm font-semibold mt-1">📞 {phoneNumber}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-500 mb-1">Delivery Address & Contact</p>
                <div className="text-neutral-900 bg-neutral-50 p-4 rounded-xl text-sm leading-relaxed border border-neutral-100">
                  {addressLines.length > 0 ? (
                    addressLines.map((line, i) => (
                      <p key={i} className={line.toLowerCase().includes("phone") ? "font-semibold text-primary" : ""}>
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-neutral-500 italic">No address provided</p>
                  )}
                </div>
              </div>

              {order.delivery_date && (
                <div>
                  <p className="text-sm font-medium text-neutral-500 mb-1">Requested Delivery Date</p>
                  <p className="text-neutral-900 font-medium bg-primary/5 text-primary p-3 rounded-xl inline-block border border-primary/10">
                    {format(new Date(order.delivery_date), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm overflow-hidden flex flex-col">
          <CardContent className="p-6 flex-1">
            <h3 className="font-semibold text-lg text-neutral-800 mb-4 border-b pb-2">Admin Actions</h3>
            <StatusUpdater 
              orderId={order.id} 
              currentStatus={order.status} 
              currentPaymentStatus={order.payment_status}
              paymentMethod={order.payment_method}
            />

            {order.status === "cancelled" && order.cancellation_reason && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-sm font-bold text-red-800 mb-1">Cancellation Reason</p>
                <p className="text-red-700 text-sm">{order.cancellation_reason}</p>
                {order.cancellation_details && (
                  <p className="text-red-600 text-sm mt-2 italic">"{order.cancellation_details}"</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl shadow-sm overflow-hidden mt-6">
        <CardContent className="p-0 sm:p-6">
          <div className="p-6 sm:p-0">
            <h3 className="font-semibold text-lg text-neutral-800 mb-4 border-b pb-2">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-2">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name || "Product"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">
                      {item.product_name || "Deleted Product"}
                    </p>
                    <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="font-medium text-neutral-900">
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      ₹{Number(item.price).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-3 w-full sm:w-64 ml-auto">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Shipping</span>
                <span>₹{Number(order.shipping_cost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Tax (18%)</span>
                <span>₹{Number(order.tax_amount).toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg text-neutral-900">
                <span>Total</span>
                <span>₹{Number(order.total_price).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
