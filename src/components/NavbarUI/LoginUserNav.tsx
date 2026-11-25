"use client";

import { LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { authClient } from "@/lib/auth-client";

interface userInfo {
  name: string;
  role: string;
}

const LoginUserNavLink = ({ name, role }: userInfo) => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const normalizedRole = role.toLowerCase();

  const handlerLogout = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.replace("/");
            router.refresh();
          },
        },
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <NavigationMenu
      align="end"
      className="max-w-none justify-end self-end md:self-auto"
    >
      <NavigationMenuList className="justify-end">
        <NavigationMenuItem>
          <NavigationMenuTrigger
            aria-label={`${name} account menu`}
            className="h-10 max-w-20 gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 text-white hover:bg-white/15 hover:text-white focus-visible:ring-primary data-open:bg-white/15 data-open:text-white data-popup-open:bg-white/15 data-popup-open:text-white sm:max-w-28 sm:px-3"
          >
            <span className="max-w-20 truncate text-sm font-medium sm:max-w-28">
              {name}
            </span>
          </NavigationMenuTrigger>

          <NavigationMenuContent className="w-[240px] bg-white p-1.5">
            <ul className="grid gap-1 p-1">
              <li>
                <NavigationMenuLink
                  render={
                    <Link
                      href={`/dashboard/${normalizedRole}`}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted focus:bg-muted"
                    >
                      <LayoutDashboard
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      Dashboard
                    </Link>
                  }
                />
              </li>
              <li>
                <NavigationMenuLink
                  render={
                    <button
                      type="button"
                      disabled={isSigningOut}
                      onClick={handlerLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:bg-red-50 disabled:pointer-events-none disabled:opacity-60"
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      {isSigningOut ? "Logging out..." : "Logout"}
                    </button>
                  }
                />
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default LoginUserNavLink;
