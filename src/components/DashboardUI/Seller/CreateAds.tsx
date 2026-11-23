"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLoginSession } from "@/lib/API/Session/UseLoginSession";
import { authClient } from "@/lib/auth-client";
import { cn } from "cn";

const textareaClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3 placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

const rentTypeOptions = [
  { label: "Per Hour", value: "hour" },
  { label: "Per Day", value: "day" },
  { label: "Per Week", value: "week" },
  { label: "Per Month", value: "month" },
];

const CreateAds = () => {
  const router = useRouter();
  const { user } = useLoginSession();
  const sellerID = user?.id;
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
    const price = Number(formData.get("price"));
    const rentType = String(formData.get("rentType") ?? "day");
    const imageFile = formData.get("image");

    if (!(imageFile instanceof File) || imageFile.size === 0) {
      setSubmitError("Please select an image.");
      return;
    }

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
        price,
        rentType,
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
      <AlertDialogTrigger
        render={
          <Button className="gap-2 font-semibold">
            <Plus className="size-4" aria-hidden="true" />
            Create Ads
          </Button>
        }
      />
      <AlertDialogContent className="max-h-[calc(100vh-2rem)] min-w-full overflow-y-auto bg-background p-0 sm:max-w-2xl">
        <div className="p-6">
          <AlertDialogHeader className="mb-5 space-y-1.5 text-left">
            <AlertDialogTitle className="text-xl font-semibold tracking-tight">
              Create Ads
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Share the details of your ad. Add a clear title, description,
              price, and image to attract buyers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form
            className="flex flex-col gap-5"
            noValidate={false}
            onSubmit={handlerPostSubmit}
          >
            {submitError && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {submitError}
              </div>
            )}
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="ad-title">Title</FieldLabel>
                <Input
                  id="ad-title"
                  name="title"
                  type="text"
                  placeholder="Enter ad title"
                  minLength={3}
                  maxLength={100}
                  required
                  autoComplete="off"
                />
                <FieldDescription>
                  Use 3 to 100 characters for a short, clear title.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="ad-description">Description</FieldLabel>
                <textarea
                  id="ad-description"
                  name="description"
                  placeholder="Describe your ad, condition, and key details..."
                  minLength={20}
                  required
                  rows={5}
                  className={cn(textareaClassName, "min-h-28 resize-y")}
                />
                <FieldDescription>
                  Write at least 20 characters so buyers understand your ad.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="ad-price">Asking Price</FieldLabel>
                <InputGroup className="h-10">
                  <InputGroupInput
                    id="ad-price"
                    name="price"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    required
                    className="h-10"
                  />
                  <InputGroupAddon
                    align="inline-end"
                    className="text-muted-foreground font-medium"
                  >
                    <InputGroupText>BDT</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  Set the amount you want to charge.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="ad-rent-type">Rent For</FieldLabel>
                <Select
                  items={rentTypeOptions}
                  defaultValue="day"
                  name="rentType"
                >
                  <SelectTrigger id="ad-rent-type" className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectGroup>
                      {rentTypeOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Choose how the rental price is billed.
                </FieldDescription>
              </Field>

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
            </FieldGroup>

            <Button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="h-11 w-full text-base font-semibold"
            >
              {isSubmitting ? "Submitting..." : "Submit Ads"}
            </Button>
          </form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateAds;
