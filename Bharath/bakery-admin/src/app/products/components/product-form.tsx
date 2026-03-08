"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  createProduct,
  updateProduct,
  getCategories,
} from "@/modules/products/actions";

// Categories that do NOT have weight variants
const NON_WEIGHT_CATEGORY_NAMES = ["juices", "brownies", "desserts", "sweets"];

export function ProductForm({ product }: { product?: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    price_quarter: product?.price_quarter?.toString() || "",
    price_half: product?.price_half?.toString() || "",
    price_one_half: product?.price_one_half?.toString() || "",
    price_two: product?.price_two?.toString() || "",
    image_url: product?.image_url || "",
    category_id: product?.category_id || "",
  });

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Determine if selected category requires weight variants
  const selectedCategory = categories.find((c) => c.id === formData.category_id);
  const isWeightBased = !selectedCategory || !NON_WEIGHT_CATEGORY_NAMES.includes(selectedCategory.name.toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // If non-weight category, clear out weight prices before saving
    const submitData = isWeightBased
      ? formData
      : { ...formData, price_quarter: "", price_half: "", price_one_half: "", price_two: "" };

    const result = product
      ? await updateProduct(product.id, submitData)
      : await createProduct(submitData);

    if (result.success) {
      toast({
        title: product ? "Product Updated" : "Product Created",
        description: "Your product has been saved.",
      });
      router.push("/products");
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Something went wrong.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl border">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input 
            id="name" 
            required 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            rows={4} 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Base Price / Unit Price (₹)</Label>
            <Input 
              id="price" 
              type="number" 
              step="0.01" 
              required 
              value={formData.price} 
              onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(val: string) => setFormData({ ...formData, category_id: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label className={!isWeightBased ? "text-muted-foreground" : ""}>
              Weight Pricing Variants (Optional)
            </Label>
            {!isWeightBased && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                Not applicable for this category
              </span>
            )}
          </div>
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity ${!isWeightBased ? "opacity-40 pointer-events-none select-none" : ""}`}>
            <div className="space-y-2">
              <Label htmlFor="price_quarter" className="text-xs text-muted-foreground">1/4 kg (₹)</Label>
              <Input id="price_quarter" type="number" step="0.01" value={formData.price_quarter} onChange={(e) => setFormData({ ...formData, price_quarter: e.target.value })} disabled={!isWeightBased} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_half" className="text-xs text-muted-foreground">1/2 kg (₹)</Label>
              <Input id="price_half" type="number" step="0.01" value={formData.price_half} onChange={(e) => setFormData({ ...formData, price_half: e.target.value })} disabled={!isWeightBased} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_one_half" className="text-xs text-muted-foreground">1.5 kg (₹)</Label>
              <Input id="price_one_half" type="number" step="0.01" value={formData.price_one_half} onChange={(e) => setFormData({ ...formData, price_one_half: e.target.value })} disabled={!isWeightBased} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_two" className="text-xs text-muted-foreground">2 kg (₹)</Label>
              <Input id="price_two" type="number" step="0.01" value={formData.price_two} onChange={(e) => setFormData({ ...formData, price_two: e.target.value })} disabled={!isWeightBased} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input 
            id="image_url" 
            type="url" 
            value={formData.image_url} 
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} 
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : (product ? "Update Product" : "Create Product")}
        </Button>
      </div>
    </form>
  );
}
