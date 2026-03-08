"use client";

import { useEffect, useState } from "react";
import { getProductReviews, hasPurchasedProduct, addProductReview, hasAlreadyReviewed } from "../actions";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, CheckCircle2 } from "lucide-react";

export function ReviewList({ productId }: { productId: string }) {
  const { isSignedIn } = useAuth();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    const data = await getProductReviews(productId);
    setReviews(data);
    
    if (isSignedIn) {
      const [can, reviewed] = await Promise.all([
        hasPurchasedProduct(productId),
        hasAlreadyReviewed(productId)
      ]);
      setCanReview(can);
      setAlreadyReviewed(reviewed);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isSignedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    setErrorMsg("");
    
    const res = await addProductReview({ productId, rating, comment });
    if (res.success) {
      await loadData(); // refresh
      setComment("");
    } else {
      setErrorMsg(res.error || "Something went wrong.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center w-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div className="mt-8 pt-6 border-t border-neutral-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-serif font-black text-neutral-800">Customer Reviews</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-100">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-neutral-700">{averageRating}</span>
            <span className="text-muted-foreground text-sm font-medium">({reviews.length})</span>
          </div>
        )}
      </div>

      {isSignedIn && !alreadyReviewed ? (
        canReview ? (
          <form onSubmit={handleSubmit} className="mb-10 bg-white p-6 rounded-[2rem] border shadow-sm">
            <h4 className="font-bold text-base mb-4 text-neutral-800">Write a Review</h4>
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="focus:outline-none transition-transform hover:scale-110"
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating >= star ? "fill-amber-400 text-amber-400" : "fill-neutral-100 text-neutral-200"
                    } drop-shadow-sm`}
                  />
                </button>
              ))}
            </div>
            <Textarea 
              placeholder="What did you think of this product? Share your experience with others."
              className="mb-4 bg-neutral-50/50 resize-none min-h-[100px] rounded-2xl border-neutral-200 focus:border-primary/50 focus:ring-primary/20"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {errorMsg && <p className="text-red-500 text-sm mb-4 font-medium">{errorMsg}</p>}
            <Button 
              disabled={submitting || rating === 0} 
              className="w-full sm:w-auto font-bold rounded-full h-12 px-8"
            >
              {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Submit Review"}
            </Button>
          </form>
        ) : (
          <div className="mb-10 bg-neutral-50 p-6 rounded-3xl border border-neutral-100 text-center">
            <p className="text-neutral-500 font-medium tracking-tight">You must purchase this product to leave a review.</p>
          </div>
        )
      ) : null}

      {isSignedIn && alreadyReviewed && (
        <div className="mb-10 bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <p className="text-emerald-700 font-bold tracking-tight">Thank you for reviewing this product!</p>
        </div>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="py-12 bg-neutral-50 rounded-3xl border border-neutral-100 text-center">
            <p className="text-neutral-500 font-medium">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          reviews.map((val) => (
            <div key={val.id} className="pb-6 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 p-4 rounded-3xl transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-neutral-800">{val.user?.name || "Anonymous"}</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < val.rating ? "fill-amber-400 text-amber-400" : "fill-neutral-100 text-neutral-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {val.comment && <p className="text-neutral-600 leading-relaxed text-xs md:text-sm">{val.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
