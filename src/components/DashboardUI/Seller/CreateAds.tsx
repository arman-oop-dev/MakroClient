"use client";

import { Plus, Upload } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

const textareaClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3 placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

const CreateAds = () => {
  const handlerPostSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button className="gap-2 font-semibold">
            <Plus className="size-4" aria-hidden="true" />
            Create Ads
          </Button>
        }
      />
      <AlertDialogContent className="max-h-[calc(80vh-2rem)] min-w-[calc(80vh-2rem)] overflow-y-auto bg-background sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">
            Create Ads
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Share the details of your ad. Add a clear title, description, and an
            image to attract buyers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          className="flex flex-col gap-5"
          noValidate={false}
          onSubmit={handlerPostSubmit}
        >
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor="ad-title">Title</FieldLabel>
              <Input
                id="ad-title"
                name="title"
                type="text"
                placeholder="Enter ad title"
                minLength={3}
                maxLength={10}
                required
                autoComplete="off"
              />
              <FieldDescription>
                Use 3 to 10 characters for a short, clear title.
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
                className={cn(textareaClassName, "resize-y min-h-28")}
              />
              <FieldDescription>
                Write at least 20 characters so buyers understand your ad.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="ad-image">Ad image</FieldLabel>
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                <label
                  htmlFor="ad-image"
                  className="flex cursor-pointer flex-col items-center gap-2 text-center"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                    <Upload className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Upload an image
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, or JPEG only
                  </span>
                </label>
                <Input
                  id="ad-image"
                  name="img"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,.png,.jpg,.jpeg"
                  required
                  className="mt-3 cursor-pointer file:cursor-pointer"
                />
              </div>
              <FieldDescription>
                Choose a clear image to represent your ad.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <Button type="submit" className="h-11 w-full text-base font-semibold">
            Submit Post
          </Button>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateAds;
