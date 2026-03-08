import { getOrders } from "@/modules/orders/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { OrderCard } from "@/modules/orders/components/order-card";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: "current" | "prev" }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const filter = resolvedParams.filter;
  const allOrders = await getOrders();

  const orders = allOrders.filter(order => {
    if (filter === "current") {
      return ["pending", "processing", "shipped"].includes(order.status.toLowerCase());
    }
    if (filter === "prev") {
      return ["delivered", "cancelled"].includes(order.status.toLowerCase());
    }
    return true;
  });

  const getPageTitle = () => {
    if (filter === "current") return "Current Orders";
    if (filter === "prev") return "Previous Orders";
    return "Order History";
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-5xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 pb-6 border-b border-neutral-100">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-neutral-800">{getPageTitle()}</h1>
          <p className="text-muted-foreground mt-3 font-medium text-lg">
            {filter === "current" ? "Track your active orders." : "View your past purchases."}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 px-6 border-none rounded-[2.5rem] bg-muted/20 shadow-sm">
          <h2 className="text-2xl font-serif font-bold text-neutral-800 mb-3">
            {filter ? `No ${filter} orders found` : "No orders found"}
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            {filter === "current" ? "You don't have any orders currently in progress." : "It looks like you haven't bought anything yet. Ready to try our artisanal treats? \uD83C\uDF70"}
          </p>
          <Button asChild className="rounded-full px-8 h-12 text-lg shadow-lg">
            <Link href="/dashboard">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
