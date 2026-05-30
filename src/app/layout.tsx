import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rose App",
  description: "Rose App - E-commerce platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}