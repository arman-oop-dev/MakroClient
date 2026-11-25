"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import BrowseFilters, { type BrowseFilterValues } from "./BrowseFilters";

interface MobileFiltersProps {
  current: BrowseFilterValues;
  categories: string[];
  cities: string[];
  rentTypes: string[];
}

const MobileFilters = (props: MobileFiltersProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-input bg-transparent px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 outline-none lg:hidden">
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[min(88vw,22rem)] overflow-y-auto p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Browse filters</SheetTitle>
        </SheetHeader>
        <div className="px-4 pt-4 pb-2">
          <BrowseFilters {...props} />
        </div>
        <SheetFooter className="px-4 pb-5 pt-0">
          <Button className="w-full" onClick={() => setOpen(false)}>
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilters;
