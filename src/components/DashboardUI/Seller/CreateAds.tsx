"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { useLoginSession } from "@/app/api/Session/UseLoginSession";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { cn } from "cn";

const textareaClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full min-w-0 rounded-lg border bg-transparent px-3 py-2.5 text-base transition-colors outline-none focus-visible:ring-3 placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

const rentTypeOptions = [
  { label: "Per Hour", value: "hour" },
  { label: "Per Day", value: "day" },
  { label: "Per Week", value: "week" },
  { label: "Per Month", value: "month" },
];

const categoryOptions = [
  { label: "Construction", value: "construction" },
  { label: "Photography", value: "photography" },
  { label: "Vehicles", value: "vehicles" },
  { label: "Agriculture", value: "agriculture" },
  { label: "Event/Program", value: "events" },
  { label: "Others", value: "others" },
];

const cityOptions = [
  { label: "Barishal", value: "Barishal" },
  { label: "Chattogram", value: "Chattogram" },
  { label: "Dhaka", value: "Dhaka" },
  { label: "Khulna", value: "Khulna" },
  { label: "Mymensingh", value: "Mymensingh" },
  { label: "Rajshahi", value: "Rajshahi" },
  { label: "Rangpur", value: "Rangpur" },
  { label: "Sylhet", value: "Sylhet" },
];

const CHECKOUT_PATH = "/dashboard/seller/payment-history/checkout";

type PostingStatus = {
  canPost?: boolean;
  isPaid?: boolean;
  adCount?: number;
  freeAdLimit?: number;
};

const CreateAds = () => {
  const router = useRouter();
  const { user } = useLoginSession();
  const sellerID = user?.id;
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleOpenDialog = async () => {
    if (isCheckingStatus) {
      return;
    }

    setIsCheckingStatus(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/seller/posting-status", {
        method: "GET",
        cache: "no-store",
      });

      if (response.ok) {
        const status = (await response.json().catch(() => null)) as
          | PostingStatus
          | null;

        if (status?.canPost === false) {
          toast.error(
            status.isPaid
              ? "Your posting access is being refreshed. Please try again."
              : "You have used your 2 free ads. Complete the one-time payment to keep posting.",
          );
          router.push(CHECKOUT_PATH);
          return;
        }
      }

      setOpen(true);
    } catch {
      setOpen(true);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handlerPostSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (!sellerID) {
      setSubmitError("Unable to identify seller. Please sign in again.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const price = Number(formData.get("price"));
    const quantity = Number(formData.get("quantity"));
    const rentType = String(formData.get("rentType") ?? "").trim();
    const apartment = String(formData.get("apartment") ?? "").trim();
    const postCode = String(formData.get("postCode") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const imageFile = formData.get("image");

    if (!category) {
      setSubmitError("Please select a category.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setSubmitError("Please enter a valid price in USD.");
      return;
    }

    if (!rentType) {
      setSubmitError("Please select a rent type.");
      return;
    }

    if (!city) {
      setSubmitError("Please select a city.");
      return;
    }

    if (!(imageFile instanceof File) || imageFile.size === 0) {
      setSubmitError("Please select an image.");
      return;
    }

    const location = `${apartment}, ${postCode}, ${city}, Bangladesh`;

    setIsSubmitting(true);

    try {
      const { data: tokenData, error: tokenError } = await authClient.token();
      if (tokenError || !tokenData?.token) {
        throw new Error("Unauthorized. Please log in again.");
      }

      const imgbbFormData = new FormData();
      imgbbFormData.append("image", imageFile);

      const imgBBResponse = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMG_BB_URL}`,
        {
          method: "POST",
          body: imgbbFormData,
        },
      );

      const imgBBResult = await imgBBResponse.json().catch(() => null);

      if (!imgBBResponse.ok || !imgBBResult?.success) {
        throw new Error(imgBBResult?.error?.message || "Image upload failed.");
      }

      const image = imgBBResult.data?.url;
      if (!image) {
        throw new Error("Image upload failed.");
      }

      const adsInfo = {
        title,
        description,
        category,
        price,
        rentType,
        location,
        quantity,
        image,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${sellerID}/ads`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(adsInfo),
        },
      );

      const result = await res.json().catch(() => null);

      if (res.status === 402 || result?.code === "PAYMENT_REQUIRED") {
        setOpen(false);
        toast.error(
          result?.message ||
            "You have used your 2 free ads. Complete the one-time payment to keep posting.",
        );
        router.push(CHECKOUT_PATH);
        return;
      }

      if (!res.ok) {
        throw new Error(
          result?.message || "Failed to create ad. Please try again.",
        );
      }

      form.reset();
      setOpen(false);
      toast.success("Thank you for submitting your ads.");
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to create ad. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        className="gap-2 font-semibold"
        onClick={handleOpenDialog}
        disabled={isCheckingStatus}
        aria-busy={isCheckingStatus}
      >
        {isCheckingStatus ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Plus className="size-4" aria-hidden="true" />
        )}
        {isCheckingStatus ? "Checking..." : "Create Ads"}
      </Button>
      <AlertDialogContent className="max-h-[calc(100vh-2rem)] min-w-[calc(80vh-2rem)] overflow-y-auto bg-background p-0 sm:max-w-3xl">
        <div className="border-b border-border/70 bg-muted/20 px-6 py-5 sm:px-8">
          <AlertDialogHeader className="space-y-1.5 text-left">
            <AlertDialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
              Create New Ad
            </AlertDialogTitle>
            <AlertDialogDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Fill in the details below to publish your rental ad. Clear
              information and a good image help attract more buyers.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <form
          className="flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-7"
          noValidate={false}
          onSubmit={handlerPostSubmit}
        >
          {submitError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {submitError}
            </div>
          )}

          <FieldGroup className="gap-6">
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Ad details
                </h3>
                <p className="text-xs text-muted-foreground">
                  Basic information about what you are renting.
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="ad-title">Title</FieldLabel>
                <Input
                  id="ad-title"
                  name="title"
                  type="text"
                  placeholder="e.g. Professional DSLR Camera"
                  minLength={3}
                  maxLength={100}
                  required
                  autoComplete="off"
                  className="h-10"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="ad-description">Description</FieldLabel>
                <textarea
                  id="ad-description"
                  name="description"
                  placeholder="Describe the item condition, included accessories, and any rental notes..."
                  minLength={20}
                  required
                  rows={5}
                  className={cn(textareaClassName, "min-h-32 resize-y")}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="ad-category">Category</FieldLabel>
                  <Select items={categoryOptions} name="category" required>
                    <SelectTrigger id="ad-category" className="h-10 w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectGroup>
                        {categoryOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="ad-rent-type">Rent Type</FieldLabel>
                  <Select items={rentTypeOptions} name="rentType" required>
                    <SelectTrigger id="ad-rent-type" className="h-10 w-full">
                      <SelectValue placeholder="Select rent type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectGroup>
                        {rentTypeOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            <section className="space-y-4 border-t border-border/70 pt-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Pricing & availability
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="ad-price">Asking Price (USD)</FieldLabel>
                  <InputGroup className="h-10">
                    <InputGroupInput
                      id="ad-price"
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="35.00"
                      required
                      className="h-10"
                    />
                    <InputGroupAddon
                      align="inline-end"
                      className="font-medium text-muted-foreground"
                    >
                      <InputGroupText>USD</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor="ad-quantity">Quantity</FieldLabel>
                  <Input
                    id="ad-quantity"
                    name="quantity"
                    type="number"
                    placeholder="1"
                    min={1}
                    required
                    autoComplete="off"
                    className="h-10"
                  />
                </Field>
              </div>
            </section>

            <section className="space-y-4 border-t border-border/70 pt-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Location
                </h3>
                <p className="text-xs text-muted-foreground">
                  Where renters can find or pick up this item.
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="ad-apartment">
                  Apartment / House / Area
                </FieldLabel>
                <Input
                  id="ad-apartment"
                  name="apartment"
                  type="text"
                  placeholder="House, road, village, or block"
                  maxLength={100}
                  required
                  autoComplete="off"
                  className="h-10"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="ad-postcode">Post Code</FieldLabel>
                  <Input
                    id="ad-postcode"
                    name="postCode"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 1207"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    required
                    autoComplete="postal-code"
                    className="h-10"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="ad-city">City</FieldLabel>
                  <Select items={cityOptions} name="city" required>
                    <SelectTrigger id="ad-city" className="h-10 w-full">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectGroup>
                        {cityOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            <section className="space-y-4 border-t border-border/70 pt-6">
              <Field>
                <FieldLabel htmlFor="ad-image">Ad Image</FieldLabel>
                <Input
                  id="ad-image"
                  name="image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,.png,.jpg,.jpeg"
                  required
                  className="h-auto cursor-pointer py-2 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/15"
                />
                <FieldDescription>
                  Upload a PNG, JPG, or JPEG image for your ad.
                </FieldDescription>
              </Field>
            </section>
          </FieldGroup>

          <div className="flex flex-col-reverse gap-3 border-t border-border/70 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="sm:min-w-28"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="gap-2 sm:min-w-36"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Submitting...
                </>
              ) : (
                "Submit Ad"
              )}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateAds;
