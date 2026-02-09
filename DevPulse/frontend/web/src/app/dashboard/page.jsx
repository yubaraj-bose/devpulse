"use client";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import CreatePostModal from "./CreatePostModal";
import ProfileImageModal from "../components/ProfileImageModal";
import { Github, Plus, Flame, LayoutGrid, Settings } from "lucide-react";

/**
 * app/dashboard/page.jsx
 * - Dashboard-only navbar (Create button removed from navbar)
 * - Create Post modal is still available from the hero "Create Post" button
 * - Profile dropdown with Change photo and Sign out
 * - Repo cards + Edit modal + feed
 */

export default function Dashboard() {
  const { isLoaded, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [openProfileImage, setOpenProfileImage] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // demo repos (temporary)
  const repos = [
    { id: 1, name: "portfolio-site", stars: 120, forks: 30 },
    { id: 2, name: "ai-assistant", stars: 350, forks: 80 },
    { id: 3, name: "chat-app", stars: 210, forks: 40 },
    { id: 4, name: "api-server", stars: 98, forks: 15 },
    { id: 5, name: "blog-platform", stars: 66, forks: 10 },
  ];

  // fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // wait for Clerk to initialize before rendering UI that depends on user
 const router = useRouter();

useEffect(() => {
  if (isLoaded && !user) {
    router.replace("/");   // or "/sign-in"
  }
}, [isLoaded, user]);

if (!isLoaded || !user) return null;


  async function fetchPosts() {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) {
        setPosts([]);
      } else {
        const json = await res.json();
        setPosts(Array.isArray(json) ? json : []);
      }
    } catch (err) {
      console.error("fetch posts error", err);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }

  // callback when a new post is created
  function handlePosted(post) {
    setPosts((p) => [post, ...p]);
  }

  const avatarUrl = user?.profileImageUrl || "/default-avatar.png";

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* ========== NAVBAR (dashboard-only) ========== */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-950/70 via-purple-950/60 to-pink-950/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          {/* left side: logo + nav links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 flex items-center justify-center text-white font-bold">
                DP
              </div>
              <span className="font-semibold text-white">DevPulse</span>
            </Link>

            <nav className="hidden md:flex gap-6 text-sm text-zinc-200">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/explore" className="hover:text-white">Explore</Link>
              <Link href="/gallery" className="hover:text-white">Gallery</Link>
              <Link href="/feed" className="hover:text-white">Feed</Link>
            </nav>
          </div>

          {/* right side: profile (Create button removed here) */}
          <div className="flex items-center gap-4">
            {/* avatar & dropdown */}
            <div className="relative">
              <img
                src={avatarUrl}
                onClick={() => setMenuOpen((s) => !s)}
                className="w-9 h-9 rounded-full cursor-pointer border border-white/10"
                alt="avatar"
              />

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-zinc-900 border border-white/8 rounded-lg py-2"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link
                    href={`/u/${user?.username ?? user?.id}`}
                    className="block px-4 py-2 text-sm hover:bg-white/5"
                  >
                    Profile
                  </Link>

                  <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-white/5">
                    Settings
                  </Link>

                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                    onClick={() => {
                      setOpenProfileImage(true);
                      setMenuOpen(false);
                    }}
                    type="button"
                  >
                    Change photo
                  </button>

                  <div className="border-t border-white/6 mt-2" />

                  <SignOutButton redirectUrl="/sign-in">
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-white/5">
                      Sign out
                    </button>
                  </SignOutButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========== BACKGROUND GLOW ========== */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 blur-3xl opacity-60 pointer-events-none" />

      {/* ========== MAIN CONTENT ========== */}
      <main className="relative z-10 max-w-7xl mx-auto px-10 py-12 space-y-14">
        {/* HERO */}
        <section className="rounded-3xl p-10 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-4xl font-bold mb-3">
                Code. Sync. <span className="text-purple-400">Showcase.</span>
              </h2>
              <p className="text-zinc-400 mb-4">
                Connect GitHub and share your work with the community.
              </p>

              <div className="flex gap-4 flex-wrap">
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-semibold hover:scale-105 transition">
                  <Github size={18} />
                  Connect GitHub
                </button>

                {/* hero-level Create Post button (keeps modal) */}
                <button
                  onClick={() => setOpenCreate(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 rounded-xl hover:bg-purple-700 transition text-white"
                >
                  <Plus size={18} />
                  Create Post
                </button>
              </div>
            </div>

            {/* small stats / CTA area (optional) */}
            <div className="hidden md:flex flex-col items-end text-sm text-zinc-400">
              <div className="mb-2">10K+ Developers</div>
              <div className="mb-2">50K+ Projects</div>
              <div className="mb-2">1M+ Views</div>
            </div>
          </div>
        </section>

        {/* REPO SECTION */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <LayoutGrid size={20} className="text-purple-400" />
            <h3 className="text-2xl font-semibold">Your Repositories</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <article
                key={repo.id}
                className="relative rounded-2xl p-6 bg-white/5 border border-white/10 hover:border-purple-500 transition backdrop-blur-lg group"
              >
                <button
                  onClick={() => {
                    setSelectedRepo(repo);
                    setOpenEdit(true);
                  }}
                  className="absolute top-3 right-3 text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-purple-600 transition opacity-0 group-hover:opacity-100 flex items-center gap-1"
                >
                  <Settings size={14} />
                  Edit
                </button>

                <h4 className="font-semibold mb-2">{repo.name}</h4>

                <p className="text-sm text-zinc-400 mb-4">
                  Project description goes here
                </p>

                <div className="flex justify-between text-sm text-zinc-400">
                  <span>⭐ {repo.stars}</span>
                  <span>🍴 {repo.forks}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* FEED SECTION */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Flame size={20} className="text-pink-400" />
            <h3 className="text-2xl font-semibold">Community Feed</h3>
          </div>

          <div className="space-y-6">
            {loadingPosts ? (
              <div className="text-zinc-400">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-zinc-400">No posts yet — be the first to post!</div>
            ) : (
              posts.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl p-6 bg-white/5 border border-white/10 backdrop-blur-xl flex gap-6"
                >
                  {/* votes */}
                  <div className="flex flex-col items-center text-zinc-400 min-w-[48px]">
                    <button className="hover:text-white">▲</button>
                    <span className="font-semibold">{p.votes ?? 0}</span>
                    <button className="hover:text-white">▼</button>
                  </div>

                  {/* content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs">
                        {(p.username || "U")[0]?.toUpperCase()}
                      </div>

                      <div className="text-sm text-zinc-300">
                        <div className="font-semibold">{p.username ?? "Unknown"}</div>
                        <div className="text-xs text-zinc-500">{new Date(p.createdAt).toLocaleString()}</div>
                      </div>
                    </div>

                    <p className="mb-3">{p.text}</p>

                    {p.mediaUrl && (
                      <div className="mt-2">
                        {/\.(mp4|webm|ogg)$/i.test(p.mediaUrl) ? (
                          <video src={p.mediaUrl} controls className="w-full max-h-[420px] rounded-lg" />
                        ) : (
                          <img src={p.mediaUrl} alt="media" className="w-full rounded-lg" />
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      {/* ========== EDIT MODAL ========== */}
      <EditModal open={openEdit} repo={selectedRepo} onClose={() => setOpenEdit(false)} />

      {/* ========== CREATE POST MODAL ========== */}
      <CreatePostModal open={openCreate} onClose={() => setOpenCreate(false)} onPosted={handlePosted} />

      {/* ========== PROFILE IMAGE MODAL ========== */}
      <ProfileImageModal open={openProfileImage} onClose={() => setOpenProfileImage(false)} user={user} />
    </div>
  );
}

/* ================= EDIT MODAL ================= */
function EditModal({ open, repo, onClose }) {
  if (!open || !repo) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 w-[420px]">
        <h3 className="text-xl font-semibold mb-6">Customize "{repo.name}"</h3>

        <div className="space-y-4 text-sm">
          <label className="flex justify-between">
            Show stars <input type="checkbox" defaultChecked />
          </label>

          <label className="flex justify-between">
            Show forks <input type="checkbox" defaultChecked />
          </label>

          <label className="flex justify-between">
            Show description <input type="checkbox" defaultChecked />
          </label>

          <label className="flex justify-between">
            Pin to top <input type="checkbox" />
          </label>

          <label className="flex justify-between">
            Hide repo <input type="checkbox" />
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 bg-white/10 rounded-lg">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 bg-purple-600 rounded-lg">Save</button>
        </div>
      </div>
    </div>
  );
}
