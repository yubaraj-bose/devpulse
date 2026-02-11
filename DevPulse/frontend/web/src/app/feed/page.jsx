"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Heart, MessageSquare, ArrowUp, ArrowDown, Clock, Star } from "lucide-react";

/* ------------------------------
   Demo users & stable images
   (picsum.photos uses stable id endpoints)
   ------------------------------ */

const DEMO_USERS = [
  { id: "u_alex", username: "alex", displayName: "Alex K", avatar: "https://picsum.photos/id/1005/200/200" },
  { id: "u_sam", username: "sam", displayName: "Samira", avatar: "https://picsum.photos/id/1011/200/200" },
  { id: "u_jordan", username: "jordan", displayName: "Jordan P", avatar: "https://picsum.photos/id/1027/200/200" },
];

/* stable post images (picsum id -> sized) */
const DEMO_POSTS = [
  {
    id: "p1",
    authorId: "u_alex",
    title: "A tiny CSS animation library",
    body: "Built a tiny CSS animation helper — 1.2KB gzipped. Works with tailwind utility classes and prefers reduced-motion.",
    image: "https://picsum.photos/id/1015/1200/800",
    tags: ["css", "animation", "ui"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    upvotes: 34,
    downvotes: 2,
    comments: [
      { id: "c1", authorId: "u_sam", body: "Love the reduced-motion option — important!", createdAt: Date.now() - 1000 * 60 * 60 * 20 },
    ],
    voters: { up: ["u_sam"], down: [] },
    stars: ["u_sam"], // who starred
  },
  {
    id: "p2",
    authorId: "u_sam",
    title: "Realtime drawing board",
    body: "A collaborative drawing board with WebRTC + CRDTs. Perf is surprisingly good on mobile.",
    image: "https://picsum.photos/id/1033/1200/800",
    tags: ["webrtc", "realtime", "collab"],
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    upvotes: 61,
    downvotes: 3,
    comments: [],
    voters: { up: [], down: [] },
    stars: [],
  },
  {
    id: "p3",
    authorId: "u_jordan",
    title: "IndexedDB wrapper for caching large assets",
    body: "A tiny wrapper that makes storing binary blobs in IndexedDB predictable across browsers.",
    image: "https://picsum.photos/id/1041/1200/800",
    tags: ["browser", "cache", "indexeddb"],
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    upvotes: 18,
    downvotes: 0,
    comments: [
      { id: "c2", authorId: "u_alex", body: "Nice! code sample?", createdAt: Date.now() - 1000 * 60 * 60 * 47 },
    ],
    voters: { up: [], down: [] },
    stars: ["u_alex"],
  },
];

/* ------------------------------
   Utilities
   ------------------------------ */

function getDemoUserById(id) {
  return DEMO_USERS.find((u) => u.id === id) || { id, username: id, displayName: id, avatar: "https://picsum.photos/seed/default/80/80" };
}

function prettyDate(ts) {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

/* ------------------------------
   Small UI bits
   ------------------------------ */

function VoteButton({ active, onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-semibold text-sm transition ${
        active ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-md" : "bg-white/5 text-zinc-300 hover:bg-white/6"
      }`}
    >
      {children}
    </button>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-indigo-200 border border-white/6">
      {children}
    </span>
  );
}

/* ------------------------------
   Comments component
   ------------------------------ */

function Comments({ comments = [], onAddComment, usersMap }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((s) => !s)}
        className="text-sm text-zinc-300 hover:text-white font-medium"
      >
        {open ? "Hide comments" : `View comments (${comments.length})`}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="space-y-2 max-h-56 overflow-auto pr-2">
            {comments.map((c) => {
              const u = usersMap[c.authorId] || { displayName: "Unknown", avatar: "https://picsum.photos/seed/default/80/80" };
              return (
                <div key={c.id} className="flex gap-3">
                  <img src={u.avatar} alt={u.displayName} className="w-8 h-8 rounded-full object-cover" />
                  <div className="bg-white/4 rounded-xl p-3 flex-1">
                    <div className="text-sm font-semibold text-white">
                      {u.displayName}
                      <span className="text-[11px] text-zinc-400 ml-2">{prettyDate(c.createdAt)}</span>
                    </div>
                    <div className="text-sm text-zinc-200 mt-1">{c.body}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-full px-4 py-2 bg-white/6 border border-white/8 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={() => {
                const t = input.trim();
                if (!t) return;
                onAddComment(t);
                setInput("");
              }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold shadow-md"
            >
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------
   PostCard
   ------------------------------ */

function PostCard({ post, author, onUpvote, onDownvote, onAddComment, onToggleStar, currentUserId, usersMap }) {
  const userUpvoted = post.voters?.up?.includes(currentUserId);
  const userDownvoted = post.voters?.down?.includes(currentUserId);
  const userStarred = (post.stars || []).includes(currentUserId);

  return (
    <article className="rounded-2xl border border-white/6 overflow-hidden bg-gradient-to-br from-[#05040a] to-[#0b0410] shadow-xl hover:shadow-2xl transition">
      <div className="p-5 flex gap-4">
        <img src={author.avatar} alt={author.displayName} className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/6" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link href={`/u/${author.username}`} className="font-semibold text-white hover:underline">{author.displayName}</Link>
              <div className="text-[12px] text-zinc-400 mt-1">
                {prettyDate(post.createdAt)} • <span className="ml-1"><Tag>{post.tags.join(", ")}</Tag></span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <ArrowUp className="w-4 h-4 text-indigo-300" /> <span className="font-bold text-white">{post.upvotes}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-pink-300" /> <span className="font-bold text-white">{post.downvotes}</span>
              </div>
            </div>
          </div>

          <h3 className="mt-3 text-lg font-extrabold text-white leading-tight">{post.title}</h3>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed line-clamp-3">{post.body}</p>

          {post.image && (
            <div className="mt-4 rounded-xl overflow-hidden relative">
              <img src={post.image} alt={post.title} className="w-full h-64 object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <VoteButton active={userUpvoted} onClick={() => onUpvote(post.id)} title="Upvote">
              <ArrowUp className="w-4 h-4" /> Upvote
            </VoteButton>

            <VoteButton active={userDownvoted} onClick={() => onDownvote(post.id)} title="Downvote">
              <ArrowDown className="w-4 h-4" /> Downvote
            </VoteButton>

            <button
              onClick={() => {
                const el = document.getElementById(`comments-${post.id}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full font-semibold text-sm bg-white/5 text-zinc-300 hover:bg-white/6"
            >
              <MessageSquare className="w-4 h-4" /> Comment
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => onToggleStar(post.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition ${
                  userStarred ? "bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-lg" : "bg-white/5 text-zinc-300 hover:bg-white/6"
                }`}
                aria-pressed={userStarred}
                title={userStarred ? "Unstar" : "Star"}
              >
                <Heart className="w-4 h-4" />
                <span>{(post.stars || []).length}</span>
              </button>
            </div>
          </div>

          <div id={`comments-${post.id}`} className="mt-4">
            <Comments
              comments={post.comments}
              usersMap={usersMap}
              onAddComment={(text) => onAddComment(post.id, text)}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------
   Feed page (main)
   ------------------------------ */

export default function FeedPage() {
  const { user } = useUser();
  const currentUserId = user?.id || "me_demo";

  const [following] = useState(() => ["u_alex", "u_sam", "u_jordan"]);

  // load persisted posts or DEMO_POSTS
  const [posts, setPosts] = useState(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("devpulse_demo_posts_v3") : null;
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEMO_POSTS;
  });

  const [sort, setSort] = useState("new");
  const [visibleCount, setVisibleCount] = useState(5);

  const usersMap = useMemo(() => {
    const map = {};
    DEMO_USERS.forEach((u) => (map[u.id] = u));
    return map;
  }, []);

  // persist posts to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem("devpulse_demo_posts_v3", JSON.stringify(posts));
    } catch {}
  }, [posts]);

  // vote star handlers update local state
  function upvote(postId) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const votersUp = new Set(p.voters?.up || []);
        const votersDown = new Set(p.voters?.down || []);
        const alreadyUp = votersUp.has(currentUserId);
        const alreadyDown = votersDown.has(currentUserId);

        if (alreadyUp) {
          votersUp.delete(currentUserId);
          return { ...p, upvotes: Math.max(0, p.upvotes - 1), voters: { up: Array.from(votersUp), down: Array.from(votersDown) } };
        }

        if (alreadyDown) {
          votersDown.delete(currentUserId);
          votersUp.add(currentUserId);
          return {
            ...p,
            downvotes: Math.max(0, p.downvotes - 1),
            upvotes: p.upvotes + 1,
            voters: { up: Array.from(votersUp), down: Array.from(votersDown) },
          };
        }

        votersUp.add(currentUserId);
        return { ...p, upvotes: p.upvotes + 1, voters: { up: Array.from(votersUp), down: Array.from(votersDown) } };
      })
    );
  }

  function downvote(postId) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const votersUp = new Set(p.voters?.up || []);
        const votersDown = new Set(p.voters?.down || []);
        const alreadyDown = votersDown.has(currentUserId);
        const alreadyUp = votersUp.has(currentUserId);

        if (alreadyDown) {
          votersDown.delete(currentUserId);
          return { ...p, downvotes: Math.max(0, p.downvotes - 1), voters: { up: Array.from(votersUp), down: Array.from(votersDown) } };
        }

        if (alreadyUp) {
          votersUp.delete(currentUserId);
          votersDown.add(currentUserId);
          return {
            ...p,
            upvotes: Math.max(0, p.upvotes - 1),
            downvotes: p.downvotes + 1,
            voters: { up: Array.from(votersUp), down: Array.from(votersDown) },
          };
        }

        votersDown.add(currentUserId);
        return { ...p, downvotes: p.downvotes + 1, voters: { up: Array.from(votersUp), down: Array.from(votersDown) } };
      })
    );
  }

  function addComment(postId, text) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c_${Math.random().toString(36).slice(2, 9)}`,
                  authorId: currentUserId,
                  body: text,
                  createdAt: Date.now(),
                },
              ],
            }
          : p
      )
    );
  }

  function toggleStar(postId) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const s = new Set(p.stars || []);
        if (s.has(currentUserId)) {
          s.delete(currentUserId);
        } else {
          s.add(currentUserId);
        }
        return { ...p, stars: Array.from(s) };
      })
    );
  }

  const feed = useMemo(() => {
    const filtered = posts.filter((p) => following.includes(p.authorId));
    if (sort === "new") return filtered.sort((a, b) => b.createdAt - a.createdAt);
    return filtered.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  }, [posts, following, sort]);

  const visiblePosts = feed.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#07040b] to-[#0f0410] text-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-pink-400">
              Your Feed
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Latest posts from developers you follow</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center bg-white/5 rounded-full px-3 py-1 gap-2 text-sm">
              <Clock className="w-4 h-4 text-zinc-300" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent outline-none text-sm"
              >
                <option value="new">Newest</option>
                <option value="top">Top</option>
              </select>
            </div>

            <div className="inline-flex items-center bg-gradient-to-r from-indigo-700/20 to-pink-600/12 rounded-full px-3 py-1 gap-2 text-sm">
              <Star className="w-4 h-4 text-indigo-300" />
              <span className="text-sm text-zinc-200">Following: {following.length}</span>
            </div>
          </div>
        </header>

        <section className="space-y-6">
          {visiblePosts.length === 0 ? (
            <div className="text-center text-zinc-400 py-12 rounded-xl border border-white/6 bg-white/3">
              No posts from people you follow yet. Try following some creators to fill your feed.
            </div>
          ) : (
            visiblePosts.map((post) => {
              const author = usersMap[post.authorId] || getDemoUserById(post.authorId);
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  author={author}
                  onUpvote={upvote}
                  onDownvote={downvote}
                  onAddComment={addComment}
                  onToggleStar={toggleStar}
                  currentUserId={currentUserId}
                  usersMap={{ ...usersMap, [currentUserId]: { id: currentUserId, username: user?.username || "you", displayName: user?.fullName || "You", avatar: user?.profileImageUrl || "https://picsum.photos/seed/me/80/80" } }}
                />
              );
            })
          )}

          {visibleCount < feed.length && (
            <div className="text-center">
              <button
                onClick={() => setVisibleCount((c) => c + 5)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
              >
                Load more
              </button>
            </div>
          )}

          <div className="pt-10 text-center text-xs text-zinc-500">
            Demo feed — data stored locally. Will be replaced by your API + DB later.
          </div>
        </section>
      </div>
    </main>
  );
}
