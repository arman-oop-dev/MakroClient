"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FiUser } from "react-icons/fi";
import { Button } from "../ui/button";
import SignIn from "./SignIn";

interface LoginDrawerProps {
  onAuthenticated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  redirectTo?: string;
}

const LoginDrawer = ({
  onAuthenticated,
  open,
  onOpenChange,
  redirectTo,
}: LoginDrawerProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isOpen = open ?? internalOpen;

  const setIsOpen = useCallback(
    (value: boolean) => {
      if (open === undefined) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [open, onOpenChange],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, setIsOpen]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger className="hover:cursor-pointer" render={<Button />}>
        <FiUser />
        Login
      </AlertDialogTrigger>
      <AlertDialogContent ref={contentRef} className="bg-accent-foreground">
        <AlertDialogHeader>
          <SignIn
            redirectTo={redirectTo}
            onSuccess={() => {
              setIsOpen(false);
              onAuthenticated?.();
            }}
          />
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoginDrawer;
