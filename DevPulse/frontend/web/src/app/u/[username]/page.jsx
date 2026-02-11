"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Edit2,
  ExternalLink,
  Github,
  Youtube,
  Linkedin,
  Instagram,
  Plus,
  Trash2,
  ArrowRight,
  X,
  UserPlus,
  UserCheck
} from "lucide-react";

/**
 * DevPulse Profile Page - Layout Refinement
 * - Fixes: Stat box overlaps, squashed social buttons, and header spacing.
 *
 * NOTE: Components that used to be declared inside UserProfilePage
 * were hoisted out so React doesn't remount them on every parent render.
 * This prevents the input-caret/focus-from-disappearing issue.
 */

const THEME_BG =
  "bg-gradient-to-b from-[#0b0410] via-[#1c0420] to-[#140816] text-white min-h-screen";

function isValidUrl(s) {
  try {
    if (!s) return false;
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function IconForSocial({ provider, className = "" }) {
  switch (provider) {
    case "github": return <Github className={className} size={18} />;
    case "youtube": return <Youtube className={className} size={18} />;
    case "linkedin": return <Linkedin className={className} size={18} />;
    case "instagram": return <Instagram className={className} size={18} />;
    default: return <ExternalLink className={className} size={18} />;
  }
}

function makeDefaultProfile(clerkUser, usernameParam) {
  return {
    ownerId: clerkUser?.id || "",
    username: usernameParam || clerkUser?.username || clerkUser?.id || "unknown",
    displayName: clerkUser?.fullName || clerkUser?.username || "New Dev",
    avatar: clerkUser?.imageUrl || `https://ui-avatars.com/api/?name=${usernameParam}`,
    bio: "",
    website: "",
    socials: {
      github: "",
      youtube: "",
      linkedin: "",
      instagram: "",
    },
    stats: {
      posts: 0,
      stars: 0,
      views: 0,
      followers: 0,
      following: 0,
    },
    sections: {
      openSource: [],
      projects: [],
      tutorials: [],
      articles: [],
    },
    joinedAt: clerkUser ? new Date().toISOString() : new Date().toISOString(),
  };
}

/* ---------------------------
   Hoisted sub-components
   (moved out of the parent to avoid remounts)
   --------------------------- */

function SectionList({
  profile,
  isOwner,
  keyName,
  title,
  subtitle,
  openAddSection,
  openEditSection,
  deleteSectionItem
}) {
  const items = profile.sections[keyName] || [];
  return (
    <section className="bg-white/3 border border-white/6 rounded-2xl p-6 w-full shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          {subtitle && <p className="text-zinc-400 mt-1 text-sm md:text-base">{subtitle}</p>}
        </div>
        {isOwner && (
          <button
            onClick={() => openAddSection(keyName)}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all text-sm font-bold"
          >
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-xl">
            <p className="text-zinc-500 italic text-sm">No {title.toLowerCase()} added yet.</p>
          </div>
        ) : (
          items.map((it, i) => (
            <article
              key={i}
              className="rounded-xl p-4 bg-white/5 border border-white/5 flex justify-between items-start gap-4 transition-colors hover:bg-white/10"
            >
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white text-lg">{it.title}</h4>
                <p className="text-zinc-400 text-sm mt-1 leading-relaxed line-clamp-2">{it.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-zinc-500">
                  {it.link && (
                    <a
                      href={it.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium"
                    >
                      <ExternalLink size={14} />
                      View Project
                    </a>
                  )}
                  <span className="bg-white/5 px-2 py-1 rounded">{new Date(it.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {isOwner && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEditSection(keyName, i)} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteSectionItem(keyName, i)} className="p-2 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function EditProfileModal({ open, onClose, profile, saveProfile }) {
  const [local, setLocal] = useState(profile);
  useEffect(() => { setLocal(profile); }, [profile, open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 max-w-2xl w-full rounded-3xl bg-[#140c1a] border border-white/10 flex flex-col max-h-[85vh] shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-2xl font-bold">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Display name</label>
              <input value={local.displayName} onChange={(e) => setLocal({ ...local, displayName: e.target.value })} className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Avatar URL</label>
              <input value={local.avatar} onChange={(e) => setLocal({ ...local, avatar: e.target.value })} className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Bio</label>
            <textarea value={local.bio} onChange={(e) => setLocal({ ...local, bio: e.target.value })} rows={3} className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none" placeholder="Tell your story..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Website</label>
            <input value={local.website} onChange={(e) => setLocal({ ...local, website: e.target.value })} className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" placeholder="https://yourportfolio.com" />
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Followers (Manual Seed)</label>
              <input type="number" value={local.stats.followers} onChange={(e) => setLocal({ ...local, stats: { ...local.stats, followers: parseInt(e.target.value) || 0 } })} className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Following (Manual Seed)</label>
              <input type="number" value={local.stats.following} onChange={(e) => setLocal({ ...local, stats: { ...local.stats, following: parseInt(e.target.value) || 0 } })} className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500 outline-none" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Social links</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['github', 'youtube', 'linkedin', 'instagram'].map(s => (
                <div key={s} className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                      <IconForSocial provider={s} />
                  </div>
                  <input value={local.socials[s]} onChange={(e) => setLocal({ ...local, socials: { ...local.socials, [s]: e.target.value } })} placeholder={`${s.charAt(0).toUpperCase() + s.slice(1)} URL`} className="w-full rounded-xl pl-12 pr-4 py-3 bg-white/5 border border-white/10 text-sm focus:border-purple-500 outline-none transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-white/[0.02] rounded-b-3xl">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl hover:bg-white/5 font-medium transition-colors">Cancel</button>
          <button onClick={() => { saveProfile(local, true); onClose(); }} className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold shadow-lg hover:shadow-purple-500/20 transition-all">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function SectionEditorModal({
  open,
  onClose,
  editingSection,
  sectionForm,
  setSectionForm,
  saveSection
}) {
  if (!open) return null;
  const providerLinkValid = !sectionForm.link || isValidUrl(sectionForm.link);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 max-w-lg w-full rounded-3xl bg-[#140c1a] border border-white/10 flex flex-col max-h-[85vh] shadow-2xl">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-xl font-bold capitalize">{editingSection?.index === -1 ? "Add" : "Edit"} {editingSection?.key}</h3>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <input value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} placeholder="Title" className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500 outline-none" />
          <textarea value={sectionForm.description} onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })} rows={4} placeholder="Description" className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500 outline-none resize-none" />
          <input value={sectionForm.link} onChange={(e) => setSectionForm({ ...sectionForm, link: e.target.value })} placeholder="Link (https://...)" className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500 outline-none" />
          <input value={sectionForm.tags} onChange={(e) => setSectionForm({ ...sectionForm, tags: e.target.value })} placeholder="Tags (comma separated)" className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500 outline-none" />
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 hover:bg-white/5 rounded-xl font-medium">Cancel</button>
          <button onClick={saveSection} disabled={!sectionForm.title || !providerLinkValid} className="px-8 py-2.5 rounded-xl bg-purple-600 font-bold disabled:opacity-50 shadow-lg">Save</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------
   Main page component
   --------------------------- */

export default function UserProfilePage() {
  const params = useParams();
  const routeUsername = params?.username || "unknown";

  const { user: clerkUser, isLoaded } = useUser();

  const storageKey = useMemo(
    () => `devpulse_profile_${routeUsername}`,
    [routeUsername]
  );

  const [profile, setProfile] = useState(() =>
    makeDefaultProfile(clerkUser || {}, routeUsername)
  );

  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
    link: "",
    tags: "",
  });

  const isOwner = useMemo(() => {
    if (!isLoaded || !clerkUser) return false;
    return profile.username === clerkUser.username || profile.username === clerkUser.id;
  }, [isLoaded, clerkUser, profile.username]);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setProfile((p) => ({ ...p, ...parsed }));
      } catch { /* ignore */ }
    } else {
      if (clerkUser) {
        const seeded = makeDefaultProfile(clerkUser, routeUsername);
        setProfile((p) => ({ ...p, ...seeded }));
      }
    }
    setLoading(false);
  }, [storageKey, routeUsername, clerkUser?.id]);

  async function saveProfile(newProfile, showToast = false) {
    setProfile(newProfile);
    localStorage.setItem(storageKey, JSON.stringify(newProfile));

    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProfile),
      });
    } catch (e) { /* non-blocking */ }

    if (showToast) {
      const el = document.createElement("div");
      el.textContent = "Profile saved";
      el.className = "fixed bottom-6 right-6 bg-purple-600 text-white px-4 py-2 rounded-lg z-[9999] shadow-xl";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1400);
    }
  }

  function handleFollow() {
    if (isOwner) return;
    const nextFollowingState = !isFollowing;
    setIsFollowing(nextFollowingState);
    const newStats = {
      ...profile.stats,
      followers: nextFollowingState 
        ? (profile.stats.followers || 0) + 1 
        : Math.max(0, (profile.stats.followers || 0) - 1)
    };
    saveProfile({ ...profile, stats: newStats });
  }

  function updateSocial(provider, url) {
    const next = {
      ...profile,
      socials: { ...profile.socials, [provider]: url },
    };
    saveProfile(next);
  }

  function openAddSection(key) {
    setEditingSection({ key, index: -1 });
    setSectionForm({ title: "", description: "", link: "", tags: "" });
  }

  function openEditSection(key, index) {
    const item = profile.sections[key][index];
    setEditingSection({ key, index });
    setSectionForm({
      title: item.title,
      description: item.description,
      link: item.link,
      tags: (item.tags || []).join(", "),
    });
  }

  function saveSection() {
    const key = editingSection.key;
    const index = editingSection.index;
    const newItem = {
      title: sectionForm.title,
      description: sectionForm.description,
      link: sectionForm.link,
      tags: sectionForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    const copy = { ...profile };
    const arr = copy.sections[key] ? [...copy.sections[key]] : [];
    if (index === -1) arr.unshift(newItem);
    else arr[index] = { ...arr[index], ...newItem };

    copy.sections[key] = arr;
    saveProfile(copy, true);
    setEditingSection(null);
    setSectionForm({ title: "", description: "", link: "", tags: "" });
  }

  function deleteSectionItem(key, index) {
    if (!confirm("Delete this item?")) return;
    const copy = { ...profile };
    copy.sections[key] = copy.sections[key].filter((_, i) => i !== index);
    saveProfile(copy, true);
  }

  return (
    <div className={THEME_BG}>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Header Section */}
        <header className="relative rounded-[2.5rem] p-8 md:p-12 border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full -mr-48 -mt-48" />
          
          <div className="relative flex flex-col lg:flex-row gap-12 items-center lg:items-start text-center lg:text-left">
            <img src={profile.avatar} alt={profile.displayName} className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] object-cover border-4 border-white/10 shadow-2xl shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">{profile.displayName}</h1>
                <span className="text-zinc-500 font-mono text-base px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">@{profile.username}</span>
              </div>
              <p className="mt-6 text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {profile.bio || "Crafting experiences and building the future of the web."}
              </p>
              
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                {isOwner ? (
                  <button onClick={() => setEditOpen(true)} className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-bold flex items-center gap-2 text-sm border border-white/10 shadow-lg">
                    <Edit2 size={16}/> Edit Profile
                  </button>
                ) : (
                  <button 
                    onClick={handleFollow} 
                    className={`px-10 py-3 rounded-2xl transition-all font-bold flex items-center gap-2 text-sm shadow-xl ${
                      isFollowing 
                      ? 'bg-zinc-800 border border-zinc-700 text-zinc-400' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    }`}
                  >
                    {isFollowing ? <UserCheck size={18}/> : <UserPlus size={18}/>}
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
                
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="px-8 py-3 rounded-2xl bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 transition-all font-bold flex items-center gap-2 text-sm border border-purple-500/20 shadow-lg">
                    Website <ArrowRight size={16}/>
                  </a>
                )}
              </div>
            </div>
            
            {/* Stats & Socials Grid Container */}
            <div className="w-full lg:w-[400px] shrink-0 space-y-6">
              <div className="bg-black/30 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-inner">
                {/* Stats Grid - Robust Grid spacing */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { val: profile.stats.followers || 0, label: "Followers" },
                        { val: profile.stats.following || 0, label: "Following" },
                        { val: profile.stats.posts, label: "Posts" },
                        { val: profile.stats.stars, label: "Stars" },
                        { val: profile.stats.views, label: "Views" },
                        { val: new Date(profile.joinedAt).getFullYear(), label: "Since" }
                    ].map((s, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-2xl text-center">
                        <div className="text-xl font-black text-white">{s.val}</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Social Grid - Uniform sizes */}
                <div className="grid grid-cols-4 gap-3">
                  {['github', 'youtube', 'linkedin', 'instagram'].map(k => {
                    const v = profile.socials[k];
                    return (
                      <button 
                        key={k} 
                        onClick={() => { 
                          if(!v) { 
                            if(isOwner) {
                              const u = prompt(`Enter ${k} URL`); 
                              if(u) updateSocial(k, u); 
                            }
                          } else { 
                            window.open(v, '_blank'); 
                          } 
                        }} 
                        className={`aspect-square rounded-2xl flex items-center justify-center transition-all border ${
                          v 
                          ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/20' 
                          : 'bg-white/5 border-white/5 text-zinc-600 hover:bg-white/10'
                        }`}
                      >
                        <IconForSocial provider={k} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8 min-w-0">
            <SectionList
              title="Open Source"
              subtitle="Contributions & Repos"
              keyName="openSource"
              profile={profile}
              isOwner={isOwner}
              openAddSection={openAddSection}
              openEditSection={openEditSection}
              deleteSectionItem={deleteSectionItem}
            />
            <SectionList
              title="Projects"
              subtitle="Building things"
              keyName="projects"
              profile={profile}
              isOwner={isOwner}
              openAddSection={openAddSection}
              openEditSection={openEditSection}
              deleteSectionItem={deleteSectionItem}
            />
            <SectionList
              title="Tutorials"
              subtitle="Sharing knowledge"
              keyName="tutorials"
              profile={profile}
              isOwner={isOwner}
              openAddSection={openAddSection}
              openEditSection={openEditSection}
              deleteSectionItem={deleteSectionItem}
            />
            <SectionList
              title="Articles"
              subtitle="Deep dives"
              keyName="articles"
              profile={profile}
              isOwner={isOwner}
              openAddSection={openAddSection}
              openEditSection={openEditSection}
              deleteSectionItem={deleteSectionItem}
            />
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="rounded-3xl p-8 bg-white/[0.02] border border-white/5 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">About Me</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">{profile.bio || "No detailed bio provided yet."}</p>
            </div>

            <div className="rounded-3xl p-8 bg-white/[0.02] border border-white/5 shadow-xl overflow-hidden">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">Connect</h3>
              <div className="space-y-6">
                {Object.entries(profile.socials).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-2.5 rounded-xl border transition-all shrink-0 ${v ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-white/5 border-white/5 text-zinc-600'}`}>
                        <IconForSocial provider={k} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{k}</div>
                        <div className="text-sm font-semibold text-zinc-200 truncate">{v ? "Linked Account" : "Not connected"}</div>
                      </div>
                    </div>
                    {isOwner && (
                      <button onClick={() => { const u = prompt(`Edit ${k}`, v || ""); if(u !== null) updateSocial(k, u); }} className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">Edit</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} profile={profile} saveProfile={saveProfile} />
      <SectionEditorModal
        open={!!editingSection}
        onClose={() => setEditingSection(null)}
        editingSection={editingSection}
        sectionForm={sectionForm}
        setSectionForm={setSectionForm}
        saveSection={saveSection}
      />
    </div>
  );
}
