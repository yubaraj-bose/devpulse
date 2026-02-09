"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  User,
  CornerUpRight,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

/* -------------------- DUMMY DATA -------------------- */
const SEED_POSTS = [
  {
    id: "p1",
    author: "alice",
    authorAvatar: "",
    title: "I rewrote my CLI tool in Rust — results & benchmarks",
    body:
      "Rewrote my old Node CLI tool in Rust. Startup time improved from ~120ms to ~12ms. Memory dropped by 75%. Sharing some benchmarks and pitfalls.",
    upvotes: 234,
    downvotes: 7,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    comments: [
      {
        id: "c1",
        author: "bob",
        text: "Amazing. Can you share the benchmarking script?",
        upvotes: 12,
        downvotes: 0,
        createdAt: Date.now() - 1000 * 60 * 60 * 20,
      },
      {
        id: "c2",
        author: "cara",
        text: "Did you use `cargo` features for release optimization?",
        upvotes: 3,
        downvotes: 1,
        createdAt: Date.now() - 1000 * 60 * 60 * 18,
      },
    ],
  },
  {
    id: "p2",
    author: "dave",
    authorAvatar: "",
    title: "Help: Strange memory leak in C++ program with vector reserve",
    body:
      "I reserved a huge vector then filled it. Memory never returned—am I doing something wrong? Minimal code included.",
    upvotes: 87,
    downvotes: 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    comments: [
      {
        id: "c3",
        author: "erin",
        text: "Are you using global allocators or a third-party profiler?",
        upvotes: 6,
        downvotes: 0,
        createdAt: Date.now() - 1000 * 60 * 60 * 10,
      },
    ],
  },
];

/* -------------------- HELPERS -------------------- */
const STORAGE_KEY = "devpulse_explore_posts_v1";
const VOTE_KEY = "devpulse_votes_v1"; // stores { posts: {postId: 1|-1}, comments: {commentId: 1|-1} }

function uid(prefix = "") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

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

/* -------------------- COMPONENT -------------------- */
export default function ExplorePage() {
  const { user } = useUser();
  const username = user?.username || user?.id || "guest";

  const [posts, setPosts] = useState([]);
  const [votes, setVotes] = useState({ posts: {}, comments: {} });
  const [openCommentsPost, setOpenCommentsPost] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({}); // keyed by postId

  // seed/load posts (robust)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
            // fallback to seed
            localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
            setPosts(SEED_POSTS);
          } else {
            setPosts(parsed);
          }
        } catch {
          // corrupted JSON — reset to seed
          localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
          setPosts(SEED_POSTS);
        }
      } else {
        // first-time load
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
        setPosts(SEED_POSTS);
      }
    } catch (e) {
      // localStorage access issue — still set posts into memory
      setPosts(SEED_POSTS);
    }

    // votes
    try {
      const vraw = localStorage.getItem(VOTE_KEY);
      if (vraw) {
        try {
          const parsedV = JSON.parse(vraw);
          setVotes(parsedV && typeof parsedV === "object" ? parsedV : { posts: {}, comments: {} });
        } catch {
          setVotes({ posts: {}, comments: {} });
        }
      } else {
        setVotes({ posts: {}, comments: {} });
      }
    } catch {
      setVotes({ posts: {}, comments: {} });
    }
  }, []);

  // persist posts & votes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // ignore write errors
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem(VOTE_KEY, JSON.stringify(votes));
    } catch {
      // ignore write errors
    }
  }, [votes]);

  // ---------- voting logic ----------
  function handlePostVote(postId, value) {
    // optimistic + local
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const current = votes.posts[postId] || 0;
        let up = p.upvotes;
        let down = p.downvotes;

        if (current === value) {
          // unvote
          if (value === 1) up = Math.max(0, up - 1);
          else down = Math.max(0, down - 1);
          setVotes((v) => ({ ...v, posts: { ...v.posts, [postId]: 0 } }));
        } else {
          // switching or new vote
          if (value === 1) {
            up = up + 1;
            if (current === -1) down = Math.max(0, down - 1);
          } else {
            down = down + 1;
            if (current === 1) up = Math.max(0, up - 1);
          }
          setVotes((v) => ({ ...v, posts: { ...v.posts, [postId]: value } }));
        }

        return { ...p, upvotes: up, downvotes: down };
      })
    );
  }

  function handleCommentVote(commentId, postId, value) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const comments = p.comments.map((c) => {
          if (c.id !== commentId) return c;
          const current = votes.comments[commentId] || 0;
          let up = c.upvotes;
          let down = c.downvotes;

          if (current === value) {
            if (value === 1) up = Math.max(0, up - 1);
            else down = Math.max(0, down - 1);
            setVotes((v) => ({ ...v, comments: { ...v.comments, [commentId]: 0 } }));
          } else {
            if (value === 1) {
              up = up + 1;
              if (current === -1) down = Math.max(0, down - 1);
            } else {
              down = down + 1;
              if (current === 1) up = Math.max(0, up - 1);
            }
            setVotes((v) => ({ ...v, comments: { ...v.comments, [commentId]: value } }));
          }

          return { ...c, upvotes: up, downvotes: down };
        });
        return { ...p, comments };
      })
    );
  }

  // ---------- comments ----------
  function toggleComments(postId) {
    setOpenCommentsPost((cur) => (cur === postId ? null : postId));
  }

  function submitComment(postId) {
    const text = (commentDrafts[postId] || "").trim();
    if (!text) return;
    const newComment = {
      id: uid("c"),
      author: username,
      text,
      upvotes: 0,
      downvotes: 0,
      createdAt: Date.now(),
    };
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
    );
    setCommentDrafts((d) => ({ ...d, [postId]: "" }));
    setOpenCommentsPost(postId);
  }

  // ---------- derived helpers ----------
  const sortedPosts = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    return [...posts].sort((a, b) => {
      const sa = a.upvotes - a.downvotes;
      const sb = b.upvotes - b.downvotes;
      if (sb === sa) return b.createdAt - a.createdAt;
      return sb - sa;
    });
  }, [posts]);

  /* -------------------- RENDER -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0410] via-[#1c0420] to-[#140816] text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold">Explore</h1>
          <div className="text-sm text-zinc-400">Discover trending posts</div>
        </div>

        <div className="space-y-4">
          {sortedPosts.length === 0 ? (
            <div className="text-zinc-400 text-center py-20">No posts yet</div>
          ) : (
            sortedPosts.map((post) => {
              const userVote = votes.posts[post.id] || 0;
              return (
                <article key={post.id} className="bg-white/3 border border-white/8 rounded-xl p-4 flex gap-4">
                  {/* votes column */}
                  <div className="w-12 flex flex-col items-center">
                    <button
                      aria-pressed={userVote === 1}
                      onClick={() => handlePostVote(post.id, 1)}
                      className={`p-1 rounded-md ${userVote === 1 ? "bg-purple-600 text-white" : "text-zinc-300 hover:bg-white/5"}`}
                      title="Upvote"
                    >
                      <ArrowUp />
                    </button>

                    <div className="text-sm font-semibold mt-2 text-white">
                      {post.upvotes - post.downvotes}
                    </div>

                    <button
                      aria-pressed={userVote === -1}
                      onClick={() => handlePostVote(post.id, -1)}
                      className={`p-1 rounded-md mt-2 ${userVote === -1 ? "bg-pink-600 text-white" : "text-zinc-300 hover:bg-white/5"}`}
                      title="Downvote"
                    >
                      <ArrowDown />
                    </button>
                  </div>

                  {/* content column */}
                  <div className="flex-1">
                    <header className="flex items-center gap-3 text-sm text-zinc-400 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/7 flex items-center justify-center text-xs text-white/90">
                          {post.author?.[0]?.toUpperCase() || <User size={12} />}
                        </div>
                        <div className="font-medium text-white">{post.author}</div>
                        <div className="text-zinc-500">•</div>
                        <div>{timeAgo(post.createdAt)}</div>
                      </div>
                    </header>

                    <h3 className="text-lg font-semibold text-white mb-1">{post.title}</h3>
                    <p className="text-zinc-300 mb-3">{post.body}</p>

                    <div className="flex items-center gap-3 text-sm">
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="inline-flex items-center gap-2 text-zinc-300 hover:text-white"
                        aria-expanded={openCommentsPost === post.id}
                      >
                        <MessageSquare size={16} /> {post.comments?.length || 0}
                      </button>

                      <div className="inline-flex items-center gap-2 text-zinc-300">
                        <span className="text-sm text-zinc-400">Up</span>
                        <span className="font-semibold text-white">{post.upvotes}</span>
                        <span className="mx-2 text-zinc-500">|</span>
                        <span className="text-sm text-zinc-400">Down</span>
                        <span className="font-semibold text-white">{post.downvotes}</span>
                      </div>

                      <button
                        onClick={() => {
                          try {
                            const url = typeof location !== "undefined" ? `${location.origin}/posts/${post.id}` : `/posts/${post.id}`;
                            if (navigator?.clipboard?.writeText) {
                              navigator.clipboard.writeText(url);
                              alert("Post link copied to clipboard");
                            } else {
                              prompt("Copy this link", url);
                            }
                          } catch {
                            // ignore
                          }
                        }}
                        className="ml-auto inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white"
                      >
                        <CornerUpRight size={14} /> Share
                      </button>
                    </div>

                    {/* comments area */}
                    {openCommentsPost === post.id && (
                      <div className="mt-4 border-t border-white/6 pt-4 space-y-3">
                        {(!post.comments || post.comments.length === 0) ? (
                          <div className="text-zinc-400 italic">No comments yet — be the first!</div>
                        ) : (
                          post.comments.map((c) => {
                            const cv = votes.comments[c.id] || 0;
                            return (
                              <div key={c.id} className="flex gap-3">
                                <div className="w-10 flex flex-col items-center">
                                  <button
                                    aria-pressed={cv === 1}
                                    onClick={() => handleCommentVote(c.id, post.id, 1)}
                                    className={`p-1 rounded-md ${cv === 1 ? "bg-purple-600 text-white" : "text-zinc-300 hover:bg-white/5"}`}
                                  >
                                    <ArrowUp size={14} />
                                  </button>
                                  <div className="text-xs text-white mt-1">{c.upvotes - c.downvotes}</div>
                                  <button
                                    aria-pressed={cv === -1}
                                    onClick={() => handleCommentVote(c.id, post.id, -1)}
                                    className={`p-1 rounded-md mt-1 ${cv === -1 ? "bg-pink-600 text-white" : "text-zinc-300 hover:bg-white/5"}`}
                                  >
                                    <ArrowDown size={14} />
                                  </button>
                                </div>

                                <div className="flex-1">
                                  <div className="text-sm text-zinc-300">
                                    <span className="font-semibold text-white mr-2">{c.author}</span>
                                    <span className="text-xs text-zinc-500">{timeAgo(c.createdAt)}</span>
                                  </div>
                                  <div className="mt-1 text-zinc-300">{c.text}</div>
                                </div>
                              </div>
                            );
                          })
                        )}

                        {/* add comment */}
                        <div className="mt-3">
                          <textarea
                            placeholder="Add a comment..."
                            value={commentDrafts[post.id] || ""}
                            onChange={(e) =>
                              setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))
                            }
                            className="w-full rounded-md p-3 bg-white/5 border border-white/6 text-white placeholder:text-zinc-500"
                            rows={2}
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => submitComment(post.id)}
                              className="px-3 py-1 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm"
                            >
                              Comment
                            </button>
                            <div className="text-xs text-zinc-400">posting as <span className="text-white ml-1">{username}</span></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
