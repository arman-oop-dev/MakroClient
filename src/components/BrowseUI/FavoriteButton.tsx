"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const FavoriteButton = () => {
  const [favorite, setFavorite] = useState(false);

  return (
    <button
      type="button"
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorite}
      onClick={() => setFavorite((value) => !value)}
      className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur-sm transition hover:scale-105 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <Heart
        className={cn(
          "size-5 transition-colors",
          favorite && "fill-red-500 text-red-500",
        )}
        aria-hidden="true"
      />
    </button>
  );
};

export default FavoriteButton;
