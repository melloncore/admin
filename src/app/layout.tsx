import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mellon Strata Core Admin",
    template: "%s · Mellon Strata Core Admin",
  },
  description: "Content and settings admin for the Mellon Strata Core portfolio website.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
