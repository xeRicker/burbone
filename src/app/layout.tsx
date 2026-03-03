import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils/cn";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Generator Listy — Burbone",
  description: "System generowania raportów dziennych",
};

import { ConfigInitializer } from "@/components/features/config-initializer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={cn(inter.className, "bg-bg-base text-text-primary antialiased")}>
        <ConfigInitializer>
          {children}
        </ConfigInitializer>
      </body>
    </html>
  );
}
