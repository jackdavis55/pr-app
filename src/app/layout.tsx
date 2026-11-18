import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PR Club | Strength records",
  description: "A simple home for your lifting milestones.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
