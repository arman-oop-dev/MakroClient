"use client";

import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { getLoginSession } from "@/lib/API/GetLoginSession";
import LoginDrawer from "./LoginDrawer";

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

const fetchSessionName = async () => {
  try {
    return await getLoginSession();
  } catch {
    return null;
  }
};

const NavHeader = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    fetchSessionName().then((name) => {
      setSessionName(name);
      setIsCheckingSession(false);
    });
  }, []);

  const handleAuthenticated = () => {
    fetchSessionName().then((name) => setSessionName(name));
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/30 bg-accent text-accent-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6 md:py-0 lg:px-8">
        <Link
          href="/"
          aria-label="Markro home"
          className="focus-visible:ring-primary flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-accent md:col-start-1"
        >
          <Image
            src="/media/logo.svg"
            alt="Markro"
            width={128}
            height={56}
            priority
            className="h-auto w-28 transition-opacity hover:opacity-90 sm:w-32 lg:w-36"
          />
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="focus-visible:ring-primary inline-flex size-10 items-center justify-center rounded-md text-white/80 transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-accent focus-visible:outline-none md:hidden"
        >
          {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>

        <div
          id="site-navigation"
          className={cn(
            "w-full flex-col gap-1 border-t border-white/10 pt-3 md:contents",
            isOpen ? "flex" : "hidden",
          )}
        >
          <nav
            aria-label="Main navigation"
            className="flex flex-col gap-1 md:col-start-2 md:flex-row md:items-center md:justify-center md:gap-1 lg:gap-2"
          >
            {HeaderMenu.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
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

          <nav
            aria-label="Account navigation"
            className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3 md:col-start-3 md:mt-0 md:flex-row md:items-center md:justify-end md:gap-2 md:border-0 md:pt-0 lg:gap-3"
          >
            {isCheckingSession ? null : sessionName ? (
              <p className="px-3 py-2 text-sm font-medium text-white/80">
                {sessionName}
              </p>
            ) : (
              <LoginDrawer onAuthenticated={handleAuthenticated} />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
