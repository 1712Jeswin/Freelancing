import { getOrders } from "@/modules/orders/actions";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Orders Management</h1>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-neutral-50/50">
            <TableRow className="border-neutral-200/50 hover:bg-transparent">
              <TableHead className="text-neutral-500 font-bold tracking-wider uppercase text-xs">Order ID</TableHead>
              <TableHead className="text-neutral-500 font-bold tracking-wider uppercase text-xs">Customer</TableHead>
              <TableHead className="text-neutral-500 font-bold tracking-wider uppercase text-xs">Date</TableHead>
              <TableHead className="text-neutral-500 font-bold tracking-wider uppercase text-xs">Total</TableHead>
              <TableHead className="text-neutral-500 font-bold tracking-wider uppercase text-xs">Status</TableHead>
              <TableHead className="text-neutral-500 font-bold tracking-wider uppercase text-xs">Payment</TableHead>
              <TableHead className="text-right text-neutral-500 font-bold tracking-wider uppercase text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-neutral-50/50">
                  <TableCell className="font-mono text-sm text-neutral-500">
                    {order.id.split("-").pop()}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-neutral-900">{order.user_name || "Guest"}</p>
                    <p className="text-sm text-neutral-500">{order.user_email}</p>
                  </TableCell>
                  <TableCell className="text-neutral-600">{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium text-neutral-900">
                    ₹{Number(order.total_price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.status === "delivered" ? "default" : (order.status === "cancelled" ? "destructive" : "secondary")} className="capitalize">
                      {order.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-neutral-600">
                      {order.payment_method === "razorpay" ? "Online" : "COD"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
