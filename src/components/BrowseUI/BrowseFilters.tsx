"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BrowseFilterValues = {
  search: string;
  category: string[];
  city: string[];
  rentType: string[];
};

interface BrowseFiltersProps {
  current: BrowseFilterValues;
  categories: string[];
  cities: string[];
  rentTypes: string[];
}

const MULTI_FILTER_KEYS = ["category", "city", "rentType"] as const;

const formatOptionLabel = (value: string) =>
  value
    .split(/[\s_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const buildHref = (values: BrowseFilterValues) => {
  const query = new URLSearchParams();

  if (values.search) query.set("search", values.search);

  for (const key of MULTI_FILTER_KEYS) {
    for (const value of values[key]) {
      query.append(key, value);
    }
  }

  const search = query.toString();
  return search ? `/browse-ads?${search}` : "/browse-ads";
};

const sameOptions = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value) => b.includes(value));

const isSameFilters = (a: BrowseFilterValues, b: BrowseFilterValues) =>
  a.search === b.search &&
  MULTI_FILTER_KEYS.every((key) => sameOptions(a[key], b[key]));

interface FilterMultiSelectProps {
  name: string;
  label: string;
  placeholder: string;
  value: string[];
  options: string[];
  onValueChange: (value: string[]) => void;
  onCommit: () => void;
}

const FilterMultiSelect = ({
  name,
  label,
  placeholder,
  value,
  options,
  onValueChange,
  onCommit,
}: FilterMultiSelectProps) => {
  const items = Object.fromEntries(
    options.map((option) => [option, formatOptionLabel(option)]),
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <Select
        multiple
        name={name}
        value={value}
        onValueChange={(next) =>
          onValueChange(Array.isArray(next) ? next.map(String) : [])
        }
        onOpenChange={(open) => {
          if (!open) onCommit();
        }}
        items={items}
      >
        <SelectTrigger className="h-9 w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {formatOptionLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const BrowseFilters = ({
  current,
  categories,
  cities,
  rentTypes,
}: BrowseFiltersProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<BrowseFilterValues>(current);
  const [lastCurrent, setLastCurrent] = useState<BrowseFilterValues>(current);

  const { search, category, city, rentType } = current;
  const currentValues = useMemo(
    () => ({ search, category, city, rentType }),
    [search, category, city, rentType],
  );

  if (!isSameFilters(currentValues, lastCurrent)) {
    setLastCurrent(currentValues);
    setValues(currentValues);
  }

  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const applyFilters = useCallback(
    (next: BrowseFilterValues) => {
      if (isSameFilters(next, currentValues)) return;

      startTransition(() => {
        router.replace(buildHref(next), { scroll: false });
      });
    },
    [currentValues, router],
  );

  useEffect(() => {
    if (values.search === currentValues.search) return;

    const timer = window.setTimeout(() => {
      applyFilters(valuesRef.current);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [values.search, currentValues.search, applyFilters]);

  const updateFilter = (patch: Partial<BrowseFilterValues>) => {
    setValues((previous) => ({ ...previous, ...patch }));
  };

  const hasFilters =
    Boolean(values.search) ||
    MULTI_FILTER_KEYS.some((key) => values[key].length > 0);

  return (
    <Card className="gap-0 py-0">
      <CardContent className="px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
          </span>
          <h2 className="text-sm font-semibold text-foreground">Filters</h2>
          <span
            className="ml-auto text-[11px] text-muted-foreground"
            aria-live="polite"
          >
            {isPending ? "Updating…" : "Auto"}
          </span>
        </div>

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="ad-search"
              className="text-xs font-medium text-foreground"
            >
              Search
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="ad-search"
                name="search"
                value={values.search}
                onChange={(event) => updateFilter({ search: event.target.value })}
                placeholder="Search ads..."
                className="h-9 pl-9"
              />
            </div>
          </div>

          <FilterMultiSelect
            name="category"
            label="Category"
            placeholder="All categories"
            value={values.category}
            options={categories}
            onValueChange={(category) => updateFilter({ category })}
            onCommit={() => applyFilters(valuesRef.current)}
          />
          <FilterMultiSelect
            name="city"
            label="Location (city)"
            placeholder="All cities"
            value={values.city}
            options={cities}
            onValueChange={(city) => updateFilter({ city })}
            onCommit={() => applyFilters(valuesRef.current)}
          />
          <FilterMultiSelect
            name="rentType"
            label="Rent type"
            placeholder="All rent types"
            value={values.rentType}
            options={rentTypes}
            onValueChange={(rentType) => updateFilter({ rentType })}
            onCommit={() => applyFilters(valuesRef.current)}
          />

          {hasFilters && (
            <Link
              href="/browse-ads"
              className="block text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear filters
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BrowseFilters;
