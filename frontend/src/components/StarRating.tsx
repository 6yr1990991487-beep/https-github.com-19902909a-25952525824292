import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  initialRating?: number;
  onRate?: (rating: number) => void;
  className?: string;
  readonly?: boolean;
}

export function StarRating({ initialRating = 0, onRate, className, readonly = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  
  return (
    <div className={cn("flex items-center gap-1", className)} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = hover >= star || (!hover && initialRating >= star);
        return (
          <button
            key={star}
            type="button"
            className={cn(
              "transition-colors",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
              active ? "text-amber-400" : "text-white/20"
            )}
            onClick={() => !readonly && onRate?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        );
      })}
    </div>
  );
}
