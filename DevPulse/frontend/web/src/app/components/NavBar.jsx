"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  Menu,
  Bell,
  LayoutDashboard,
  Sun,
  Moon,
  Camera,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function NavBar({ dbUser }) {
  const { isLoaded,user: clerkUser } = useUser();
  const pathname = usePathname();

  const { isDarkMode, toggleTheme } = useTheme();

  // menu & dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // notifications
  const [notifications, setNotifications] = useState(null);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notifError, setNotifError] = useState(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const mobileRef = useRef(null);

  // --- Notification fetching ---
  async function fetchNotifications() {
    setLoadingNotifications(true);
    setNotifError(null);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setNotifError("Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }

  const toggleNotifications = async () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && notifications === null) await fetchNotifications();
  };

  async function markRead(id) {
    setNotifications((prev) =>
      prev?.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("mark read error", err);
    }
  }

  // click outside & esc handling
  useEffect(() => {
    function onDocClick(e) {
      const t = e.target;
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
      if (mobileRef.current && !mobileRef.current.contains(t)) setMobileOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!isLoaded) return null;

  const avatarUrl = dbUser?.avatar || clerkUser?.imageUrl || "/default-avatar.png";
  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/feed", label: "Feed" },
    { href: "/media", label: "Media" },
  ];

  const isActive = (href) => {
    if (!pathname) return false;
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--border-color)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* LEFT: Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              DP
            </div>
            <span className="font-bold text-[var(--nav-text-active)] tracking-tight hidden sm:block">
              DevPulse
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md transition text-sm font-bold ${
                  isActive(item.href)
                    ? "bg-[var(--nav-active-bg)] text-[var(--nav-text-active)]"
                    : "text-[var(--nav-text-muted)] hover:text-[var(--nav-text-active)] hover:bg-[var(--nav-hover-bg)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3">
          {/* Dashboard button (icon + label) visible md+ */}
          {pathname !== "/dashboard" && (
            <Link
              href="/dashboard"
              className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--nav-active-bg)] border border-[var(--border-color)] text-[var(--nav-text-active)] text-sm font-bold transition-all hover:bg-[var(--nav-hover-bg-heavy)] active:scale-95"
              aria-label="Open dashboard"
            >
              <LayoutDashboard size={15} className="text-indigo-400" />
              <span className="ml-2">Dashboard</span>
            </Link>
          )}

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)] transition-all"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-amber-400" />
            ) : (
              <Moon size={20} className="text-indigo-500" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={toggleNotifications}
              aria-expanded={notifOpen}
              aria-haspopup="true"
              className={`p-2 rounded-full transition-colors relative ${
                notifOpen
                  ? "text-[var(--nav-text-active)] bg-[var(--nav-hover-bg-heavy)]"
                  : "text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)]"
              }`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-black border-2 border-[var(--nav-bg)]">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[var(--dropdown-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-[var(--border-muted)] bg-[var(--nav-hover-bg)] flex justify-between items-center">
                  <span className="text-sm font-black text-[var(--nav-text-active)] uppercase tracking-widest">
                    Notifications
                  </span>
                </div>

                <div className="max-h-[350px] overflow-y-auto p-2">
                  {loadingNotifications ? (
                    <div className="p-8 text-center text-xs text-[var(--nav-text-muted)] animate-pulse">
                      Loading...
                    </div>
                  ) : notifications?.length === 0 ? (
                    <div className="p-8 text-center text-sm italic text-[var(--nav-text-muted)]">
                      No new activity.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl transition-all ${
                            n.read ? "opacity-50" : "bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] mb-1"
                          }`}
                        >
                          <p className="text-sm font-bold text-[var(--nav-text-active)]">
                            {n.title}
                          </p>
                          <p className="text-xs text-[var(--nav-text-muted)] mt-1">
                            {n.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-[var(--border-muted)] bg-[var(--nav-hover-bg)]">
                  <Link
                    href="/notifications"
                    className="block w-full text-center py-2 text-xs font-black text-indigo-500 hover:text-indigo-400 uppercase tracking-widest transition-colors"
                    onClick={() => setNotifOpen(false)}
                  >
                    View All Activity
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-full p-0.5 border border-[var(--border-color)] hover:ring-2 hover:ring-indigo-500 transition-all"
            >
              <img src={avatarUrl} alt="User avatar" className="w-8 h-8 rounded-full object-cover" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-[var(--dropdown-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2 z-[100] animate-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-[var(--border-muted)] mb-1">
                  <p className="text-sm font-black text-[var(--nav-text-active)]">{dbUser.displayName}</p>
                  <p className="text-[10px] font-bold text-indigo-400">@{dbUser.username}</p>
                </div>

                <Link
                  href={`/u/${dbUser.username}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)]"
                  onClick={() => setProfileOpen(false)}
                >
                  <User size={16} /> View Profile
                </Link>

                <Link
                  href={`/u/${dbUser.username}?edit=true`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)]"
                  onClick={() => setProfileOpen(false)}
                >
                  <Camera size={16} /> Change Picture
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)]"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings size={16} /> Settings
                </Link>

                <div className="border-t border-[var(--border-muted)] my-1" />

                <SignOutButton redirectUrl="/sign-in">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-red-500 font-bold flex items-center gap-3 hover:bg-red-500/10">
                    <LogOut size={16} /> Sign out
                  </button>
                </SignOutButton>
              </div>
            )}
          </div>

          {/* MOBILE: hamburger */}
          <div className="md:hidden" ref={mobileRef}>
            <button
              type="button"
              onClick={() => setMobileOpen((s) => !s)}
              aria-expanded={mobileOpen}
              aria-label="Open menu"
              className="p-2 text-[var(--nav-text-muted)] hover:text-[var(--nav-text-active)]"
            >
              <Menu size={20} />
            </button>

            {mobileOpen && (
              <div className="fixed right-4 top-16 w-48 bg-[var(--dropdown-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2 z-[100] overflow-hidden animate-in slide-in-from-top-2">
                <nav className="flex flex-col">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {pathname !== "/dashboard" && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-indigo-400 hover:bg-[var(--nav-hover-bg)]"
                      onClick={() => setMobileOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}