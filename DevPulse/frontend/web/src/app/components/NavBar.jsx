"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import ProfileImageModal from "./ProfileImageModal";
import { Menu, Bell, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";

/**
 * NavBar with Notifications and Action-based Dashboard button
 */

export default function NavBar() {
  const { isLoaded, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const pathname = usePathname();

  // Notifications state
  const [notifications, setNotifications] = useState(null);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notifError, setNotifError] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifRef = useRef();
  const menuRef = useRef();

  // helper: fetch notifications
  async function fetchNotifications() {
    setLoadingNotifications(true);
    setNotifError(null);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to fetch notifications");
      }
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("notifications fetch error", err);
      setNotifError(String(err?.message ?? err) || "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }

  // open/close handler for notifications dropdown
  async function toggleNotifications() {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && notifications === null) {
      await fetchNotifications();
    }
  }

  // mark single notification read
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

  // click outside to close dropdowns
  useEffect(() => {
    function onDocClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (!isLoaded) return null;

  const avatarUrl = user?.profileImageUrl || user?.imageUrl || "/default-avatar.png";
  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  // --- GALLERY REMOVED HERE ---
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/feed", label: "Feed" },
  ];

  const isActive = (href) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const linkBase = "px-3 py-2 rounded-md transition text-sm flex items-center gap-2";
  const activeCls = "bg-white/10 text-white font-semibold";
  const inactiveCls = "text-zinc-400 hover:text-white hover:bg-white/5";

  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Left Section: Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                DP
              </div>
              <span className="font-bold text-white tracking-tight hidden sm:block">DevPulse</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${linkBase} ${isActive(item.href) ? activeCls : inactiveCls}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-3">
            
            {pathname !== "/dashboard" && (
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-white/5 active:scale-95"
              >
                <LayoutDashboard size={15} className="text-indigo-400" />
                Dashboard
              </Link>
            )}

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                className={`p-2 rounded-full transition-colors ${notifOpen ? 'bg-white/15 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-zinc-950">
                    {unreadCount > 9 ? "!" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 overflow-hidden bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                    <span className="text-sm font-bold text-white">Notifications</span>
                  </div>

                  <div className="p-2">
                    {loadingNotifications ? (
                      <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
                    ) : notifError ? (
                      <div className="p-8 text-center text-red-400 text-xs">{notifError}</div>
                    ) : (notifications?.length === 0) ? (
                      <div className="p-8 text-center text-zinc-500 text-sm italic">No notifications.</div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          {notifications.slice(0, 2).map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 rounded-xl transition-colors relative group ${n.read ? "opacity-60" : "bg-white/[0.03] hover:bg-white/[0.05]"}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-white truncate">{n.title}</div>
                                  <div className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{n.body}</div>
                                </div>
                                {!n.read && <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0" />}
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] text-zinc-600 font-medium">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                                {!n.read && (
                                  <button onClick={() => markRead(n.id)} className="text-[10px] font-bold text-zinc-400 hover:text-white px-2 py-1 rounded-md bg-white/5 transition-colors">
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-white/5">
                          <Link 
                            href="/notifications" 
                            className="block w-full text-center py-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                            onClick={() => setNotifOpen(false)}
                          >
                            View all notifications
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-white/10 transition-all border border-white/10"
              >
                <img
                  src={avatarUrl}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Account</p>
                    <p className="text-sm font-semibold truncate text-white">{user?.fullName || user?.username}</p>
                  </div>
                  
                  <Link href={`/u/${user?.username ?? user?.id}`} className="flex items-center px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                    View Profile
                  </Link>

                  <Link href="/settings" className="flex items-center px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                    Settings
                  </Link>

                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => { setAvatarModalOpen(true); setMenuOpen(false); }}
                  >
                    Change Picture
                  </button>

                  <div className="border-t border-white/5 my-1" />

                  <SignOutButton redirectUrl="/sign-in">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium">
                      Sign out
                    </button>
                  </SignOutButton>
                </div>
              )}
            </div>

            <button className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <ProfileImageModal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} user={user} />
    </>
  );
}