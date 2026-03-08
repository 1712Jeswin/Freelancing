"use client";

import { useState } from "react";
import { useCart, useCheckout, useVerifyRazorpayPayment } from "@/modules/cart/hooks";
import { useAddresses, useAddAddress, useUpdateAddress, useDeleteAddress } from "@/modules/addresses/hooks";
import { CartItemCard } from "@/modules/cart/components/cart-item-card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Check, ChevronsUpDown, MoreVertical, Trash2, Pencil, CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { State, City } from "country-state-city";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ConfirmationModal } from "@/components/confirmation-modal";

export default function CartPage() {
  const { data: cartItems, isLoading: isLoadingCart } = useCart();
  const { data: addresses, isLoading: isLoadingAddresses } = useAddresses();

  const checkoutMutation = useCheckout();
  const verifyRazorpayMutation = useVerifyRazorpayPayment();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  
  const [deliveryDate, setDeliveryDate] = useState<Date>(() => {
    const now = new Date();
    const isPastCutoff = now.getHours() > 17 || (now.getHours() === 17 && now.getMinutes() >= 30);
    const earliestDate = new Date(now);
    earliestDate.setDate(now.getDate() + (isPastCutoff ? 2 : 1));
    earliestDate.setHours(0, 0, 0, 0);
    return earliestDate;
  });

  const [newAddress, setNewAddress] = useState({
    recipient_name: "",
    phone_number: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const [stateCode, setStateCode] = useState("");
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  const indianStates = State.getStatesOfCountry("IN");
  const stateCities = stateCode ? City.getCitiesOfState("IN", stateCode) : [];

  const isLoading = isLoadingCart || isLoadingAddresses;

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 px-4 md:px-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const items = cartItems || [];
  const isEmpty = items.length === 0;
  const userAddresses = addresses || [];

  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.product.price || 0) * item.quantity,
    0
  );

  const shippingCost = items.length > 0 ? 5.00 : 0;
  const taxAmount = subtotal * 0.18;
  const finalTotal = subtotal + taxAmount + shippingCost;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast({
        title: "Missing Information",
        description: "Please select a delivery address.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await checkoutMutation.mutateAsync({ addressId: selectedAddressId, paymentMethod, deliveryDate });
      
      if (result.success) {
        if (result.paymentMethod === "cod") {
          toast({
            title: "Order placed successfully!",
            description: "Your order will be paid on delivery.",
          });
          checkoutMutation.reset();
          router.push(`/orders/${result.orderId}`);
          return;
        }

        if (result.razorpayOrderId) {
          const res = await loadRazorpay();
          if (!res) {
            toast({ title: "Failed to load Razorpay SDK", variant: "destructive" });
            return;
          }

          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
            amount: result.amount, 
            currency: "INR",
            name: "Rizu Cake World",
            description: "Order Payment",
            order_id: result.razorpayOrderId,
            handler: async function (response: any) {
              // This handler executes on successful payment closure
              const verifyRes = await verifyRazorpayMutation.mutateAsync({
                orderCreationId: result.orderId!,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                toast({
                  title: "Payment Successful!",
                  description: "Your order has been placed.",
                });
                checkoutMutation.reset();
                router.push(`/orders/${result.orderId}`);
              } else {
                toast({
                  title: "Payment Verification Failed",
                  description: verifyRes.error || "Please contact support.",
                  variant: "destructive"
                });
              }
            },
            theme: {
              color: "#d97706", // amber-600
            }
          };

          const paymentObject = new (window as any).Razorpay(options);
          paymentObject.on('payment.failed', function (response: any) {
            toast({
              title: "Payment Failed",
              description: response.error.description,
              variant: "destructive"
            });
          });
          
          paymentObject.open();
        }
      } else {
        toast({
          title: "Checkout failed",
          description: "error" in result ? result.error : "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
       toast({
          title: "Checkout error",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.state || !newAddress.city) {
      toast({ title: "Please select state and city", variant: "destructive" });
      return;
    }

    if (editingAddressId) {
      const result = await updateAddressMutation.mutateAsync({ id: editingAddressId, data: newAddress });
      if (result.success) {
        setIsAddressModalOpen(false);
        setEditingAddressId(null);
        resetForm();
        toast({ title: "Address updated!" });
      } else {
        toast({ title: "Failed to update address", variant: "destructive" });
      }
    } else {
      const result = await addAddressMutation.mutateAsync(newAddress);
      if (result.success && result.address) {
        setIsAddressModalOpen(false);
        setSelectedAddressId(result.address.id);
        resetForm();
        toast({ title: "Address saved!" });
      } else {
        toast({ title: "Failed to save address", variant: "destructive" });
      }
    }
  };

  const resetForm = () => {
    setNewAddress({
      recipient_name: "",
      phone_number: "",
      street_address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
    });
    setStateCode("");
    setEditingAddressId(null);
  };

  const handleEditClick = (address: any) => {
    setEditingAddressId(address.id);
    setNewAddress({
      recipient_name: address.recipient_name,
      phone_number: address.phone_number || "",
      street_address: address.street_address,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
    });
    // Find state code
    const state = indianStates.find(s => s.name === address.state);
    if (state) setStateCode(state.isoCode);
    setIsAddressModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;
    
    const result = await deleteAddressMutation.mutateAsync(addressToDelete);
    if (result.success) {
      if (selectedAddressId === addressToDelete) setSelectedAddressId(undefined);
      toast({ title: "Address deleted" });
    } else {
      toast({ title: "Failed to delete address", variant: "destructive" });
    }
    setAddressToDelete(null);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddressToDelete(id);
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-6xl">
      <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight mb-10 text-neutral-800">Checkout</h1>

      {isEmpty ? (
        <div className="p-16 text-center border-none rounded-[2.5rem] bg-muted/20 shadow-sm">
          <h2 className="text-2xl font-serif font-bold mb-3 text-neutral-800">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 text-lg">Looks like you haven't added any artisanal treats yet.</p>
          <Button asChild className="rounded-full px-8 h-12 text-lg shadow-lg">
            <Link href="/dashboard">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            
            {/* Delivery Address Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-2xl font-serif font-bold text-neutral-800">1. Delivery Address</h2>
                <Dialog open={isAddressModalOpen} onOpenChange={(open) => {
                  setIsAddressModalOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full px-4" onClick={() => {
                      resetForm();
                      setIsAddressModalOpen(true);
                    }}>
                      <Plus className="w-4 h-4 mr-2" /> Add New Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[500px] sm:rounded-[2.5rem] p-8">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-serif font-bold">{editingAddressId ? "Edit Address" : "Add Delivery Address"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveAddress} className="space-y-5 pt-4">
                      <div className="space-y-2">
                        <Label className="text-neutral-600 font-semibold">Full Name</Label>
                        <Input className="h-12 rounded-2xl" required value={newAddress.recipient_name} onChange={e => setNewAddress({...newAddress, recipient_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-neutral-600 font-semibold">Phone Number</Label>
                        <Input className="h-12 rounded-2xl" type="tel" required value={newAddress.phone_number} onChange={e => setNewAddress({...newAddress, phone_number: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-neutral-600 font-semibold">Street Address</Label>
                        <Input className="h-12 rounded-2xl" required value={newAddress.street_address} onChange={e => setNewAddress({...newAddress, street_address: e.target.value})} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col">
                          <Label className="mb-1 text-neutral-600 font-semibold">State</Label>
                          <Popover open={isStateOpen} onOpenChange={setIsStateOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isStateOpen}
                                className="justify-between w-full font-normal h-12 rounded-2xl"
                              >
                                {newAddress.state ? newAddress.state : "Select state..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0 rounded-2xl">
                              <Command>
                                <CommandInput placeholder="Search state..." />
                                <CommandList>
                                  <CommandEmpty>No state found.</CommandEmpty>
                                  <CommandGroup>
                                    {indianStates.map((state) => (
                                      <CommandItem
                                        key={state.isoCode}
                                        value={state.name}
                                        onSelect={(currentValue) => {
                                          setNewAddress({
                                            ...newAddress,
                                            state: currentValue,
                                            city: "", // Reset city
                                          });
                                          setStateCode(state.isoCode);
                                          setIsStateOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            newAddress.state === state.name ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {state.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2 flex flex-col">
                          <Label className="mb-1 text-neutral-600 font-semibold">City</Label>
                          <Popover open={isCityOpen} onOpenChange={setIsCityOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isCityOpen}
                                className="justify-between w-full font-normal h-12 rounded-2xl"
                                disabled={!stateCode}
                              >
                                {newAddress.city ? newAddress.city : "Select city..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0 rounded-2xl">
                              <Command>
                                <CommandInput placeholder="Search city..." />
                                <CommandList>
                                  <CommandEmpty>No city found.</CommandEmpty>
                                  <CommandGroup>
                                    {stateCities.map((city) => (
                                      <CommandItem
                                        key={city.name}
                                        value={city.name}
                                        onSelect={(currentValue) => {
                                          setNewAddress({
                                            ...newAddress,
                                            city: currentValue,
                                          });
                                          setIsCityOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            newAddress.city === city.name ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {city.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-neutral-600 font-semibold">Postal Code</Label>
                          <Input className="h-12 rounded-2xl" required value={newAddress.postal_code} onChange={e => setNewAddress({...newAddress, postal_code: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-neutral-600 font-semibold">Country</Label>
                          <Input className="h-12 rounded-2xl bg-neutral-100" required value={newAddress.country} readOnly disabled />
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-14 rounded-full text-lg mt-6 shadow-xl active:scale-95 transition-transform" disabled={addAddressMutation.isPending || updateAddressMutation.isPending}>
                        {(addAddressMutation.isPending || updateAddressMutation.isPending) ? "Saving..." : "Save Address"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {userAddresses.length === 0 ? (
                <Card className="border-dashed rounded-[2rem] bg-muted/10">
                  <CardContent className="p-10 text-center text-muted-foreground">
                    No addresses saved yet. Please add a delivery address to continue.
                  </CardContent>
                </Card>
              ) : (
                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="grid gap-4">
                  {userAddresses.map((address) => (
                    <div key={address.id} className="relative group">
                      <Label
                        className={`flex items-start justify-between cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 ${selectedAddressId === address.id ? "border-primary bg-primary/5 shadow-md" : "border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50"}`}
                      >
                        <div className="flex items-start gap-4">
                          <RadioGroupItem value={address.id} className="mt-1 flex-shrink-0 text-primary border-primary" />
                          <div>
                            <p className="font-bold text-lg text-neutral-800">{address.recipient_name}</p>
                            <p className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
                              Phone: {address.phone_number}<br/>
                              {address.street_address}<br/>
                              {address.city}, {address.state} {address.postal_code}<br/>
                              {address.country}
                            </p>
                          </div>
                        </div>
                      </Label>

                      <div className="absolute top-6 right-6 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-neutral-400 hover:text-neutral-800">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => handleEditClick(address)} className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive cursor-pointer" 
                              onClick={(e) => handleDeleteClick(address.id, e as any)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-2xl font-serif font-bold text-neutral-800">2. Payment Method</h2>
              </div>
              <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as "razorpay" | "cod")} className="grid gap-4 sm:grid-cols-2">
                <Label
                  className={`flex flex-col items-center justify-center cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 ${paymentMethod === "razorpay" ? "border-primary bg-primary/5 shadow-md" : "border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50"}`}
                >
                  <RadioGroupItem value="razorpay" className="sr-only" />
                  <div className="text-4xl mb-3">💳</div>
                  <p className="font-bold text-lg text-neutral-800">Pay Online</p>
                  <p className="text-sm font-medium text-muted-foreground mt-1 text-center">Credit/Debit, UPI, Netbanking</p>
                </Label>
                <Label
                  className={`flex flex-col items-center justify-center cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 ${paymentMethod === "cod" ? "border-primary bg-primary/5 shadow-md" : "border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50"}`}
                >
                  <RadioGroupItem value="cod" className="sr-only" />
                  <div className="text-4xl mb-3">💵</div>
                  <p className="font-bold text-lg text-neutral-800">Pay on Delivery</p>
                  <p className="text-sm font-medium text-muted-foreground mt-1 text-center">Pay with cash when your order arrives</p>
                </Label>
              </RadioGroup>
            </div>

            {/* Cart Items Section */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-2xl font-serif font-bold text-neutral-800">3. Review Items</h2>
              </div>
              <div className="flex flex-col gap-0">
                {items.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary Header */}
          <div className="lg:col-span-1">
            <div className="rounded-[2.5rem] p-8 xl:p-10 bg-[#FCF9F2] shadow-xl border border-neutral-100 sticky top-24">
              <h2 className="text-2xl font-serif font-black mb-8 text-neutral-800">Order Summary</h2>
              
              <div className="space-y-4 font-medium text-neutral-600">
                <div className="flex justify-between items-center">
                  <span>Items ({items.reduce((a, b) => a + b.quantity, 0)})</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping & handling</span>
                  <span>{shippingCost === 0 ? "Free" : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Tax (18%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-8 mb-6 border-t border-neutral-200/60 pt-6">
                <Label className="font-bold text-neutral-800 mb-3 block">Estimated Delivery Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-bold rounded-2xl h-14 border-2 border-neutral-100 hover:border-primary/50 hover:bg-primary/5 transition-all text-neutral-700 active:scale-[0.98]",
                        !deliveryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                      {deliveryDate ? format(deliveryDate, "MMMM do, yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-3xl border-0 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden" align="center">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={(day) => {
                        if (day) setDeliveryDate(day);
                      }}
                      disabled={(date) => {
                        const now = new Date();
                        const isPastCutoff = now.getHours() > 17 || (now.getHours() === 17 && now.getMinutes() >= 30);
                        const earliestDate = new Date(now);
                        earliestDate.setDate(now.getDate() + (isPastCutoff ? 2 : 1));
                        earliestDate.setHours(0, 0, 0, 0);
                        return date < earliestDate;
                      }}
                      initialFocus
                      className="p-4"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-between items-center mt-6 mb-10 pt-6 text-2xl font-black border-t border-neutral-200/60">
                <span className="font-serif">Total</span>
                <span className="text-primary">₹{finalTotal.toFixed(2)}</span>
              </div>

              <Button 
                className="w-full text-lg h-16 rounded-full font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending || items.length === 0}
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                ) : null}
                {checkoutMutation.isPending ? "Processing..." : "Place your order"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation for deleting address */}
      <ConfirmationModal
        isOpen={!!addressToDelete}
        onOpenChange={(open) => !open && setAddressToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Address?"
        description="Are you sure you want to remove this delivery address? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
