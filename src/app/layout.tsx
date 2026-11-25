import SiteFooter from "@/components/FooterUI/SiteFooter";
import NavHeader from "@/components/NavbarUI/NavHeader";
import AppToaster from "@/components/ui/app-toaster";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { headers } from "next/headers";
import { Suspense } from "react";
import "./globals.css";

const DmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Markro",
};

async function RootNavHeader() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <NavHeader
      name={session?.user.name ?? ""}
      role={session?.user.role ?? ""}
    />
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${DmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" cz-shortcut-listen="true">
        <AppToaster />
        <Suspense
          fallback={<div className="h-[73px] w-full border-b border-primary/30 bg-accent" />}
        >
          <RootNavHeader />
        </Suspense>
        <div className="flex flex-1 flex-col">{children}</div>
        <Suspense fallback={null}>
          <SiteFooter />
        </Suspense>
      </body>
    </html>
  );
}
