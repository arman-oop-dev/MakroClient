"use client";

import { useEffect, useRef, useState } from "react";

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
}

const LoginDrawer = ({ onAuthenticated }: LoginDrawerProps) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className="hover:cursor-pointer" render={<Button />}>
        <FiUser />
        Login
      </AlertDialogTrigger>
      <AlertDialogContent ref={contentRef} className="bg-accent-foreground">
        <AlertDialogHeader>
          <SignIn
            onSuccess={() => {
              setOpen(false);
              onAuthenticated?.();
            }}
          />
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoginDrawer;
