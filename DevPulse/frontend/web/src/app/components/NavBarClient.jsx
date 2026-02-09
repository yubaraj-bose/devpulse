"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

export default function NavBarClient() {
  const pathname = usePathname();

  // Do not show navbar on the homepage root ("/").
  // If you also want to hide on other pages (like "/auth"), extend this condition.
  if (["/", "/sign-in", "/sign-up"].includes(pathname)) return null;

  return <NavBar />;
}
