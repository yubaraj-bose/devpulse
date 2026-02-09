"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Star,
  Bell,
  Check,
} from "lucide-react";

/* -------------------- DUMMY DATA -------------------- */

const SEED_NOTIFICATIONS = [
  {
    id: "n1",
    type: "comment",
    user: "alice",
    message: "commented on your post",
    postTitle: "Rust CLI benchmarks",
    createdAt: Date.now() - 1000 * 60 * 5,
    read: false,
  },
  {
    id: "n2",
    type: "upvote",
    user: "bob",
    message: "upvoted your post",
    postTitle: "C++ memory leak issue",
    createdAt: Date.now() - 1000 * 60 * 30,
    read: false,
  },
  {
    id: "n3",
    type: "downvote",
    user: "cara",
    message: "downvoted your comment",
    postTitle: "CLI tool thread",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    read: true,
  },
  {
    id: "n4",
    type: "follow",
    user: "dave",
    message: "started following you",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    read: false,
  },
  {
    id: "n5",
    type: "star",
    user: "erin",
    message: "starred your project",
    postTitle: "DevPulse Frontend",
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    read: true,
  },
];

const STORAGE_KEY = "devpulse_notifications_v1";

/* -------------------- HELPERS -------------------- */

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function getIcon(type) {
  switch (type) {
    case "comment":
      return <MessageSquare size={18} className="text-purple-400" />;
    case "upvote":
      return <ArrowUp size={18} className="text-green-400" />;
    case "downvote":
      return <ArrowDown size={18} className="text-red-400" />;
    case "follow":
      return <UserPlus size={18} className="text-blue-400" />;
    case "star":
      return <Star size={18} className="text-yellow-400" />;
    default:
      return <Bell size={18} className="text-zinc-400" />;
  }
}

/* -------------------- PAGE -------------------- */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  /* load */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS));
        setNotifications(SEED_NOTIFICATIONS);
      } else {
        const parsed = JSON.parse(raw);
        setNotifications(parsed?.length ? parsed : SEED_NOTIFICATIONS);
      }
    } catch {
      setNotifications(SEED_NOTIFICATIONS);
    }
  }, []);

  /* persist */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  /* actions */
  function markRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  /* sorted */
  const sorted = useMemo(
    () =>
      [...notifications].sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return b.createdAt - a.createdAt;
      }),
    [notifications]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0410] via-[#1c0420] to-[#140816] text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">

        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-extrabold">Notifications</h1>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 text-sm"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* list */}
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="text-zinc-400 text-center py-20">
              You're all caught up 🎉
            </div>
          ) : (
            sorted.map((n) => (
              <div
                key={n.id}
                className={`
                  flex items-start gap-4 p-4 rounded-xl border
                  ${n.read
                    ? "bg-white/3 border-white/6 opacity-70"
                    : "bg-purple-900/20 border-purple-500/30"}
                `}
              >
                <div className="mt-1">{getIcon(n.type)}</div>

                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-semibold text-white">{n.user}</span>{" "}
                    <span className="text-zinc-300">{n.message}</span>
                    {n.postTitle && (
                      <span className="text-purple-400 ml-1">
                        “{n.postTitle}”
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-zinc-500 mt-1">
                    {timeAgo(n.createdAt)} ago
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="p-2 rounded-md hover:bg-white/5"
                    title="Mark read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
