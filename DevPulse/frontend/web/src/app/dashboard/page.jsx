"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CreatePostModal from "./CreatePostModal";
import ProfileImageModal from "../components/ProfileImageModal";
import { Github, Plus, Flame } from "lucide-react";
import RepoSection from "../components/RepoSection";


export default function Dashboard() {
  const { isLoaded, user } = useUser();
  const [openCreate, setOpenCreate] = useState(false);
  const [openProfileImage, setOpenProfileImage] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const repos = [
    { id: 1, name: "portfolio-site", stars: 120, forks: 30 },
    { id: 2, name: "ai-assistant", stars: 350, forks: 80 },
    { id: 3, name: "chat-app", stars: 210, forks: 40 },
    { id: 4, name: "api-server", stars: 98, forks: 15 },
    { id: 5, name: "blog-platform", stars: 66, forks: 10 },
  ];

  useEffect(() => {
    if (isLoaded && !user) {
      window.location.replace("/");
    }
  }, [isLoaded, user]);

  useEffect(() => {
    fetchPosts();
  }, []);

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

  function handlePosted(post) {
    setPosts((p) => [post, ...p]);
  }

  return (
    <div className="min-h-screen text-[var(--nav-text-active)] relative overflow-hidden bg-[var(--bg-body)]">
      {/* ========== BACKGROUND GLOW ========== */}
      <div className="absolute inset-0 bg-[var(--hero-glow)] blur-3xl opacity-60 pointer-events-none" />

      {/* ========== MAIN CONTENT ========== */}
      <main className="relative z-10 max-w-7xl mx-auto px-10 py-12 space-y-14">
        {/* HERO */}
        <section className="rounded-3xl p-10 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] shadow-2xl">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-4xl font-bold mb-3">
                Code. Sync. <span className="text-indigo-500">Showcase.</span>
              </h2>
              <p className="text-[var(--nav-text-muted)] mb-4">
                Connect GitHub and share your work with the community.
              </p>

              <div className="flex gap-4 flex-wrap">
                <button className="flex items-center gap-2 px-6 py-3 bg-[var(--nav-text-active)] text-[var(--bg-body)] rounded-xl font-semibold hover:scale-105 transition shadow-lg">
                  <Github size={18} />
                  Connect GitHub
                </button>

                <button
                  onClick={() => setOpenCreate(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition text-white shadow-lg shadow-indigo-500/20"
                >
                  <Plus size={18} />
                  Create Post
                </button>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-end text-sm text-[var(--nav-text-muted)]">
              <div className="mb-2">10K+ Developers</div>
              <div className="mb-2">50K+ Projects</div>
              <div className="mb-2">1M+ Views</div>
            </div>
          </div>
        </section>

       <RepoSection initialRepos={repos} />

        {/* FEED SECTION */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Flame size={20} className="text-orange-500" />
            <h3 className="text-2xl font-semibold text-[var(--nav-text-active)]">Community Feed</h3>
          </div>

          <div className="space-y-6">
            {loadingPosts ? (
              <div className="text-[var(--nav-text-muted)]">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-[var(--nav-text-muted)]">No posts yet — be the first to post!</div>
            ) : (
              posts.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl p-6 bg-[var(--card-bg)] border border-[var(--border-color)] backdrop-blur-xl flex gap-6"
                >
                  {/* votes */}
                  <div className="flex flex-col items-center text-[var(--nav-text-muted)] min-w-[48px]">
                    <button className="hover:text-[var(--nav-text-active)]">▲</button>
                    <span className="font-semibold">{p.votes ?? 0}</span>
                    <button className="hover:text-[var(--nav-text-active)]">▼</button>
                  </div>

                  {/* content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--nav-hover-bg)] flex items-center justify-center text-xs text-[var(--nav-text-active)] border border-[var(--border-muted)]">
                        {(p.username || "U")[0]?.toUpperCase()}
                      </div>

                      <div className="text-sm">
                        <div className="font-semibold text-[var(--nav-text-active)]">{p.username ?? "Unknown"}</div>
                        <div className="text-xs text-[var(--nav-text-muted)]">{new Date(p.createdAt).toLocaleString()}</div>
                      </div>
                    </div>

                    <p className="mb-3 text-[var(--nav-text-active)]">{p.text}</p>

                    {p.mediaUrl && (
                      <div className="mt-2 border border-[var(--border-muted)] rounded-lg overflow-hidden">
                        {/\.(mp4|webm|ogg)$/i.test(p.mediaUrl) ? (
                          <video src={p.mediaUrl} controls className="w-full max-h-[420px]" />
                        ) : (
                          <img src={p.mediaUrl} alt="media" className="w-full" />
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

      <EditModal open={openEdit} repo={selectedRepo} onClose={() => setOpenEdit(false)} />
      <CreatePostModal open={openCreate} onClose={() => setOpenCreate(false)} onPosted={handlePosted} />
      <ProfileImageModal open={openProfileImage} onClose={() => setOpenProfileImage(false)} user={user} />
    </div>
  );
}

function EditModal({ open, repo, onClose }) {
  if (!open || !repo) return null;

  return (
    <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-[var(--dropdown-bg)] border border-[var(--border-color)] rounded-2xl p-8 w-[420px] shadow-2xl">
        <h3 className="text-xl font-semibold mb-6 text-[var(--nav-text-active)]">Customize "{repo.name}"</h3>

        <div className="space-y-4 text-sm text-[var(--nav-text-muted)]">
          <label className="flex justify-between items-center">
            Show stars <input type="checkbox" defaultChecked className="accent-indigo-500" />
          </label>
          <label className="flex justify-between items-center">
            Show forks <input type="checkbox" defaultChecked className="accent-indigo-500" />
          </label>
          <label className="flex justify-between items-center">
            Show description <input type="checkbox" defaultChecked className="accent-indigo-500" />
          </label>
          <label className="flex justify-between items-center">
            Pin to top <input type="checkbox" className="accent-indigo-500" />
          </label>
          <label className="flex justify-between items-center">
            Hide repo <input type="checkbox" className="accent-indigo-500" />
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 bg-[var(--nav-hover-bg)] text-[var(--nav-text-active)] border border-[var(--border-muted)] rounded-lg transition-colors">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}