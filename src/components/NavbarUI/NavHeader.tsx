"use client";

import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import LoginDrawer from "./LoginDrawer";
import LoginUserNavLink from "./LoginUserNav";

export interface MenuItem {
  Label: string;
  href: string;
}

const HeaderMenu: MenuItem[] = [
  { Label: "Browse Ads", href: "/browse-ads" },
  { Label: "About Markro", href: "/about" },
];

const navLinkClass = (active: boolean) =>
  cn(
    "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none",
    active && "text-white after:scale-x-100",
  );

const drawerLinkClass = (active: boolean) =>
  cn(
    "relative flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-primary focus-visible:text-primary focus-visible:outline-none",
    active && "bg-primary/10 text-primary",
  );

interface UserInfoProps {
  name: string;
  role: string;
  isPending?: boolean;
}

const NavHeader = ({ name, role, isPending = false }: UserInfoProps) => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/30 bg-accent text-accent-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-x-3 px-4 py-3 sm:px-6 md:grid-cols-[1fr_auto_1fr] md:gap-x-6 md:py-0 lg:px-8">
        {/* Mobile menu drawer */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            aria-label="Open menu"
            className="focus-visible:ring-primary inline-flex size-10 items-center justify-center rounded-md text-white/80 transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-accent focus-visible:outline-none md:hidden"
          >
            <FiMenu size={20} />
          </SheetTrigger>

          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-[min(85vw,20rem)] border-r border-border bg-white p-0 text-foreground"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <SheetTitle className="text-base font-semibold text-foreground">
                Menu
              </SheetTitle>
              <SheetClose
                aria-label="Close menu"
                className="focus-visible:ring-primary inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:outline-none"
              >
                <FiX size={20} />
              </SheetClose>
            </div>

            <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-3 py-4">
              {HeaderMenu.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={drawerLinkClass(active)}
                  >
                    {active && (
                      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    {item.Label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo: centered on mobile, left on desktop */}
        <div className="col-start-2 justify-self-center md:col-start-1 md:justify-self-start">
          <Link href="/" aria-label="Markro home" onClick={() => setMenuOpen(false)}>
            <Image
              src="/media/logo.svg"
              alt="Markro"
              width={128}
              height={56}
              priority
              className="h-auto w-28 transition-opacity hover:opacity-90 sm:w-32 lg:w-36"
            />
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="col-start-2 hidden flex-row items-center justify-center gap-1 md:flex lg:gap-2"
        >
          {HeaderMenu.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(navLinkClass(active), "justify-center")}
              >
                {active && (
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                )}
                {item.Label}
              </Link>
            );
          })}
        </nav>

        {/* Account navigation: right side on all screens */}
        <nav
          aria-label="Account navigation"
          className="col-start-3 flex items-center justify-self-end gap-2 md:justify-self-end"
        >
          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/10" />
          ) : name ? (
            <LoginUserNavLink name={name} role={role} />
          ) : (
            <LoginDrawer />
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavHeader;
