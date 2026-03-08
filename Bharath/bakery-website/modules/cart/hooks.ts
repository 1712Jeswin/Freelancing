"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCart, addToCart, updateCartItemQuantity, removeFromCart } from "./actions";

// Keys for React Query cache
export const CART_QUERY_KEY = ["cart"];

export function useCart() {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const result = await getCart();
      return result.items;
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { productId: string; quantity?: number; weight?: string }) => addToCart(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { cartItemId: string; quantity: number }) => updateCartItemQuantity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId: string) => removeFromCart(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: { addressId?: string; paymentMethod: "razorpay" | "cod"; deliveryDate?: Date }) => {
      // Import dynamically to avoid circular dependencies if any, or just import at top
      const { checkoutCart } = await import('@/modules/orders/actions');
      return checkoutCart(args.addressId, args.paymentMethod, args.deliveryDate);
    },
    onSuccess: () => {
      // Clear the cart cache on successful checkout
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useVerifyRazorpayPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: {
      orderCreationId: string;
      razorpayPaymentId: string;
      razorpayOrderId: string;
      razorpaySignature: string;
    }) => {
      const { verifyRazorpayPayment } = await import('@/modules/orders/actions');
      return verifyRazorpayPayment(args);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}
