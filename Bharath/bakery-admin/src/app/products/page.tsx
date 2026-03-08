import { getProducts, deleteProduct } from "@/modules/products/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DeleteProductButton } from "./delete-button";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Products Management</h1>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-neutral-50/50">
            <TableRow className="border-neutral-200/50 hover:bg-transparent">
              <TableHead className="w-[100px] text-neutral-500 font-bold tracking-wider uppercase text-xs">Image</TableHead>
              <TableHead className="text-neutral-500 font-bold tracking-wider uppercase text-xs">Name</TableHead>
              <TableHead className="text-neutral-500 font-bold tracking-wider uppercase text-xs">Category</TableHead>
              <TableHead className="text-neutral-500 font-bold tracking-wider uppercase text-xs">Price</TableHead>
              <TableHead className="text-neutral-500 font-bold tracking-wider uppercase text-xs">Added On</TableHead>
              <TableHead className="text-right text-neutral-500 font-bold tracking-wider uppercase text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  No products found. Include some to get started!
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className="hover:bg-neutral-50/50">
                  <TableCell>
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-neutral-100 flex items-center justify-center border">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <span className="text-xs text-neutral-500 font-medium">No Img</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-neutral-900">{product.name}</TableCell>
                  <TableCell>
                    <span className="bg-neutral-100 text-neutral-800 border border-neutral-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      {product.category_name || "Uncategorized"}
                    </span>
                  </TableCell>
                  <TableCell>₹{Number(product.price).toFixed(2)}</TableCell>
                  <TableCell className="text-neutral-500">{format(new Date(product.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" asChild className="h-8 w-8">
                        <Link href={`/products/${product.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <DeleteProductButton id={product.id} />
                    </div>
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
