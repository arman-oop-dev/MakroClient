"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinkClass =
  "text-white/75 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none";

export default function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) return null;

  return (
    <footer className="border-t border-white/10 bg-accent">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-6 lg:px-8">
        <Link href="/" aria-label="Markro home" className="justify-self-start">
          <Image
            src="/media/logo.svg"
            alt="Markro"
            width={104}
            height={46}
            className="h-auto w-24"
          />
        </Link>

        <p className="text-center text-xs text-white/75">
          © 2026 Markro. All rights reserved.
        </p>

        <nav
          aria-label="Footer navigation"
          className="flex justify-center gap-5 text-xs text-white/75 sm:justify-end"
        >
          <Link href="/" className={footerLinkClass}>
            Home
          </Link>
          <Link href="/browse-ads" className={footerLinkClass}>
            Browse Ads
          </Link>
        </nav>
      </div>
    </footer>
  );
}
