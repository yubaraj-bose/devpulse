"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

/**
 * NavBarClient - The wrapper that handles conditional visibility and 
 * passes database data to the main NavBar.
 */
export default function NavBarClient({ dbUser }) {
  const pathname = usePathname();

  // Hide navbar on auth and home pages
  const hiddenRoutes = ["/", "/sign-in", "/sign-up"];
  if (hiddenRoutes.includes(pathname)) return null;

  // Pass the dbUser prop down to NavBar
  return <NavBar dbUser={dbUser} />;
}