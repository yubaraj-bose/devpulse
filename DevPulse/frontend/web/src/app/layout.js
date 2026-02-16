import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server"; // Import auth for server-side ID
import NavBarClient from "./components/NavBarClient";
import { ThemeProvider } from "@/context/ThemeContext";
import { getUserProfile } from "@/lib/actions/user.actions"; // Import your DB fetch action

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DevPulse",
  description: "Showcase your projects with a pulse.",
};

export default async function RootLayout({ children }) {
  // 1. Fetch the logged-in user's ID from Clerk
  const { userId } = await auth();

  // 2. Fetch the user's custom data (including Cloudinary avatar) from NeonDB
  const dbUser = userId ? await getUserProfile(userId) : null;

  return (
    <html lang="en" suppressHydrationWarning> 
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const settings = JSON.parse(localStorage.getItem('devpulse_settings_v1'));
                const isDark = settings?.preferences?.darkMode;
                if (isDark === true || (isDark === undefined)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}
      >
        <ThemeProvider>
          <ClerkProvider>
            {/* 3. Pass dbUser to NavBarClient so it uses the Cloudinary link */}
            <NavBarClient dbUser={dbUser} />
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}