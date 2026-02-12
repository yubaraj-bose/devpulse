"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Heart, Award, Share2, Play, Clock, ArrowLeft, ArrowRight, X, Maximize2 } from "lucide-react";
import Link from "next/link";

/* =========================
   Demo data (stable images/video)
   ========================= */

const DEMO_USERS = [
  { id: "u_alex", username: "alex", displayName: "Alex K", avatar: "https://picsum.photos/id/1005/120/120" },
  { id: "u_sam", username: "sam", displayName: "Samira", avatar: "https://picsum.photos/id/1011/120/120" },
  { id: "u_jordan", username: "jordan", displayName: "Jordan P", avatar: "https://picsum.photos/id/1027/120/120" },
  { id: "u_aria", username: "aria", displayName: "Aria Z", avatar: "https://picsum.photos/id/1012/120/120" },
];

const DEMO_MEDIA = [
  {
    id: "m1",
    type: "image",
    authorId: "u_alex",
    title: "Neon UI mockups",
    src: "https://picsum.photos/id/1018/1200/1800",
    caption: "Vibrant neon UI concepts for a dashboard.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    views: 450,
    hearts: ["u_sam"],
    trophies: [],
    tags: ["ui", "design"],
  },
  {
    id: "m2",
    type: "video",
    authorId: "u_sam",
    title: "Quick WebRTC demo",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    caption: "Short demo of live drawing with low-latency.",
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    views: 1200,
    hearts: ["u_alex", "u_jordan"],
    trophies: ["u_jordan"],
    tags: ["webrtc", "demo"],
  },
  {
    id: "m3",
    type: "image",
    authorId: "u_jordan",
    title: "Caching architecture sketch",
    src: "https://picsum.photos/id/1025/1200/1600",
    caption: "Rough sketch for IndexedDB-based caching flow.",
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    views: 210,
    hearts: [],
    trophies: [],
    tags: ["architecture", "browser"],
  },
  {
    id: "m4",
    type: "image",
    authorId: "u_aria",
    title: "Landing page hero",
    src: "https://picsum.photos/id/1043/1200/1600",
    caption: "Hero shot experiments for a marketing site.",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    views: 980,
    hearts: ["u_alex"],
    trophies: [],
    tags: ["marketing", "design"],
  },
  {
    id: "m5",
    type: "video",
    authorId: "u_alex",
    title: "Tiny animation library showcase",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    caption: "Animations running at 60fps — tiny bundle size.",
    createdAt: Date.now() - 1000 * 60 * 30,
    views: 2000,
    hearts: [],
    trophies: ["u_aria"],
    tags: ["animation", "css"],
  },
];

/* =========================
   Helpers & UI primitives
   ========================= */

function prettyDate(ts) {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function getUserById(id) {
  return DEMO_USERS.find((u) => u.id === id) || { id, username: id, displayName: id, avatar: "https://picsum.photos/seed/default/120/120" };
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/6 text-white/90">
      {children}
    </span>
  );
}

function Toast({ text, onClose = () => {} }) {
  useEffect(() => {
    const t = setTimeout(onClose, 1600);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-zinc-900/90 text-white px-4 py-2 rounded-xl shadow-lg border border-white/8">
      {text}
    </div>
  );
}

/* =========================
   MediaCard (click to view)
   ========================= */

function MediaCard({
  media,
  author,
  currentUserId,
  onToggleHeart,
  onToggleTrophy,
  onShare,
  onView,
}) {
  const heartCount = (media.hearts || []).length;
  const trophyCount = (media.trophies || []).length;
  const userHearted = (media.hearts || []).includes(currentUserId);
  const userTrophy = (media.trophies || []).includes(currentUserId);

  return (
    <article className="rounded-2xl overflow-hidden border border-white/6 bg-gradient-to-br from-[#05040a] to-[#0b0410] shadow-lg hover:shadow-2xl transition">
      <div
        className="relative cursor-pointer"
        onClick={() => onView(media)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") onView(media); }}
      >
        {media.type === "image" ? (
          <img src={media.src} alt={media.title} className="w-full h-64 sm:h-72 object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-64 sm:h-72 bg-black/40 flex items-center justify-center relative">
            {/* small inline controls so user can preview if they click play here, but main playback is in modal */}
            <video
              src={media.src}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
              playsInline
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="p-2 bg-black/40 rounded-full">
                <Play className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <img src={author.avatar} alt={author.displayName} className="w-9 h-9 rounded-lg ring-1 ring-white/6" />
          <div className="bg-white/6 px-2 py-1 rounded-xl text-xs text-white">
            <div className="font-semibold leading-none">{author.displayName}</div>
            <div className="text-[10px] text-zinc-300">{prettyDate(media.createdAt)}</div>
          </div>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Badge>{media.views} views</Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-white truncate">{media.title}</h3>
            <p className="text-sm text-zinc-300 mt-1 line-clamp-2">{media.caption}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {(media.tags || []).map((t) => (
                <span key={t} className="text-xs bg-white/5 px-2 py-1 rounded-full text-zinc-200">{t}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleHeart(media.id); }}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition ${
                  userHearted ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow" : "bg-white/5 text-zinc-300 hover:bg-white/6"
                }`}
                title={userHearted ? "Unheart" : "Heart"}
              >
                <Heart className="w-4 h-4" />
                <span>{heartCount}</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onToggleTrophy(media.id); }}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition ${
                  userTrophy ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow" : "bg-white/5 text-zinc-300 hover:bg-white/6"
                }`}
                title={userTrophy ? "Remove trophy" : "Give trophy"}
              >
                <Award className="w-4 h-4" />
                <span>{trophyCount}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onShare(media); }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/6 text-sm text-zinc-200 hover:bg-white/8 transition"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================
   Main Media Page
   ========================= */

export default function MediaPage() {
  const { user } = useUser();
  const currentUserId = user?.id || "me_demo";

  const STORAGE_KEY = "devpulse_media_v2";

  const [mediaItems, setMediaItems] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {}
    return DEMO_MEDIA.map((m) => ({ ...m, hearts: m.hearts || [], trophies: m.trophies || [] }));
  });

  const [filter, setFilter] = useState("trending");
  const [sort, setSort] = useState("trending");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);

  // modal state
  const [modalIndex, setModalIndex] = useState(null); // index in filtered array
  const modalMediaRef = useRef(null);
  const gridItems = useMemo(() => mediaItems, [mediaItems]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaItems)); } catch (e) {}
  }, [mediaItems]);

  // actions: heart/trophy/share (persisted)
  const toggleHeart = (id) => {
    setMediaItems((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const setHearts = new Set(m.hearts || []);
        if (setHearts.has(currentUserId)) setHearts.delete(currentUserId);
        else setHearts.add(currentUserId);
        return { ...m, hearts: Array.from(setHearts) };
      })
    );
  };

  const toggleTrophy = (id) => {
    setMediaItems((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const setT = new Set(m.trophies || []);
        if (setT.has(currentUserId)) setT.delete(currentUserId);
        else setT.add(currentUserId);
        return { ...m, trophies: Array.from(setT) };
      })
    );
  };

  const shareMedia = async (m) => {
    const url = typeof window !== "undefined" ? window.location.origin + `/media/${m.id}` : `/media/${m.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: m.title, text: m.caption, url });
        setToast("Shared successfully");
        return;
      } catch (e) { /* fallthrough to copy */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast("Link copied to clipboard");
    } catch (e) {
      setToast("Could not copy link");
    }
  };

  // Derived & simple filter/sort/search (kept light for demo)
  const filtered = useMemo(() => {
    let items = [...mediaItems];

    if (filter === "following") items = items.filter((m) => ["u_alex", "u_sam"].includes(m.authorId));
    else if (filter === "influencers") items = items.filter((m) => ["u_aria", "u_jordan"].includes(m.authorId));
    // trending/all as before

    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.caption || "").toLowerCase().includes(q) ||
          (m.tags || []).join(" ").toLowerCase().includes(q)
      );
    }

    if (sort === "newest") items.sort((a, b) => b.createdAt - a.createdAt);
    else if (sort === "top") items.sort((a, b) => (b.hearts.length + b.trophies.length * 3 + b.views / 100) - (a.hearts.length + a.trophies.length * 3 + a.views / 100));
    else {
      items.sort((a, b) => {
        const score = (m) => m.hearts.length * 3 + m.trophies.length * 8 + m.views / 100 - (Date.now() - m.createdAt) / (1000 * 60 * 60 * 24);
        return score(b) - score(a);
      });
    }

    return items;
  }, [mediaItems, filter, sort, query]);

  // open modal for a media item (by media object)
  const openModalFor = (media) => {
    const idx = filtered.findIndex((x) => x.id === media.id);
    if (idx >= 0) setModalIndex(idx);
    else setModalIndex(null);
  };

  const closeModal = () => setModalIndex(null);

  // keyboard navigation & ESC
  useEffect(() => {
    function onKey(e) {
      if (modalIndex === null) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") setModalIndex((i) => (i === null ? null : Math.min(filtered.length - 1, i + 1)));
      if (e.key === "ArrowLeft") setModalIndex((i) => (i === null ? null : Math.max(0, i - 1)));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalIndex, filtered.length]);

  // modal helpers
  const gotoNext = () => setModalIndex((i) => (i === null ? null : Math.min(filtered.length - 1, i + 1)));
  const gotoPrev = () => setModalIndex((i) => (i === null ? null : Math.max(0, i - 1)));

  const requestFullScreen = async () => {
    try {
      const el = modalMediaRef.current;
      if (!el) return;
      if (el.requestFullscreen) await el.requestFullscreen();
      // fallback for webkit
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (e) {
      // ignore
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#07040b] to-[#0f0410] text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-8 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-pink-400">
              Media
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Trending videos & images from creators you love — tap any media to enlarge</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex gap-2 items-center bg-white/5 rounded-full px-3 py-1">
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-transparent text-sm outline-none pr-2">
                <option value="trending">Trending</option>
                <option value="all">All</option>
                <option value="following">Following</option>
                <option value="influencers">Influencers</option>
              </select>

              <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent text-sm outline-none">
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="top">Top</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 flex-1 sm:flex-none">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent outline-none placeholder:text-zinc-400 text-sm w-full"
                placeholder="Search titles, tags..."
              />
              <Clock className="w-4 h-4 text-zinc-300" />
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => {
            const author = getUserById(m.authorId);
            return (
              <div key={m.id}>
                <MediaCard
                  media={m}
                  author={author}
                  currentUserId={currentUserId}
                  onToggleHeart={(id) => toggleHeart(id)}
                  onToggleTrophy={(id) => toggleTrophy(id)}
                  onShare={(media) => shareMedia(media)}
                  onView={(media) => openModalFor(media)}
                />
              </div>
            );
          })}
        </section>

        {/* Modal Lightbox */}
        {modalIndex !== null && filtered[modalIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
            <div className="relative z-10 max-w-5xl w-full h-[85vh] bg-[#0f0810] rounded-2xl p-4 shadow-2xl border border-white/10 flex flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={closeModal} className="p-2 rounded-md hover:bg-white/5"><X /></button>
                  <div className="text-lg font-bold">{filtered[modalIndex].title}</div>
                  <div className="text-sm text-zinc-400 ml-2">{prettyDate(filtered[modalIndex].createdAt)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => shareMedia(filtered[modalIndex])} className="px-3 py-2 rounded-full bg-white/6 hover:bg-white/8">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button onClick={requestFullScreen} className="px-3 py-2 rounded-full bg-white/6 hover:bg-white/8">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 mt-4 flex items-center justify-center relative">
                <button
                  onClick={gotoPrev}
                  disabled={modalIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60"
                >
                  <ArrowLeft />
                </button>

                <div className="max-h-full overflow-hidden w-full flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    {filtered[modalIndex].type === "image" ? (
                      <img
                        ref={modalMediaRef}
                        src={filtered[modalIndex].src}
                        alt={filtered[modalIndex].title}
                        className="max-h-[78vh] object-contain rounded"
                      />
                    ) : (
                      <video
                        ref={modalMediaRef}
                        src={filtered[modalIndex].src}
                        controls
                        autoPlay
                        playsInline
                        className="max-h-[78vh] w-auto rounded"
                      />
                    )}
                  </div>
                </div>

                <button
                  onClick={gotoNext}
                  disabled={modalIndex >= filtered.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60"
                >
                  <ArrowRight />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={getUserById(filtered[modalIndex].authorId).avatar} alt="author" className="w-10 h-10 rounded-md" />
                  <div>
                    <div className="font-semibold">{getUserById(filtered[modalIndex].authorId).displayName}</div>
                    <div className="text-xs text-zinc-400">{filtered[modalIndex].tags?.join(" • ")}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleHeart(filtered[modalIndex].id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/6 hover:bg-white/8"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{filtered[modalIndex].hearts.length}</span>
                  </button>

                  <button
                    onClick={() => toggleTrophy(filtered[modalIndex].id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/6 hover:bg-white/8"
                  >
                    <Award className="w-4 h-4" />
                    <span>{filtered[modalIndex].trophies.length}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && <Toast text={toast} onClose={() => setToast(null)} />}

      </div>
    </main>
  );
}
