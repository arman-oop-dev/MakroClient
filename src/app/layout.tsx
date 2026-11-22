import NavHeader from "@/components/Navbar/NavHeader";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const DmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Markro",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${DmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" cz-shortcut-listen="true">
        <NavHeader />
        {children}
      </body>
    </html>
  );
}
