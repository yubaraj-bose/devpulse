"use client";
import { uploadImageAction } from "@/lib/actions/user.actions";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
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
import { 
  getUserProfile, 
  updateProfile, 
  saveSectionItem, 
  deleteSectionItemAction 
} from "@/lib/actions/user.actions";


/**
 * DevPulse Profile Page - Fully Integrated with NeonDB
 */

const THEME_BG =
  "min-h-screen bg-[var(--bg-body)] text-[var(--nav-text-active)] relative overflow-hidden transition-colors duration-300";

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
    username: usernameParam || "new_user",
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
    joinedAt: new Date().toISOString(),
  };
}

/* ---------------------------
   UI Sub-components
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
    <section className="bg-[var(--card-bg)] border border-[var(--border-color)] backdrop-blur-xl rounded-3xl p-8 w-full shadow-lg">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h3 className="text-2xl font-black tracking-tight text-[var(--nav-text-active)]">{title}</h3>
          {subtitle && <p className="text-[var(--nav-text-muted)] mt-1 text-sm md:text-base font-medium">{subtitle}</p>}
        </div>
        {isOwner && (
          <button
            onClick={() => openAddSection(keyName)}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-sm font-bold shadow-lg shadow-indigo-500/20"
          >
            <Plus size={18} /> Add New
          </button>
        )}
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-[var(--border-muted)] rounded-2xl">
            <p className="text-[var(--nav-text-muted)] italic text-sm">No {title.toLowerCase()} showcased yet.</p>
          </div>
        ) : (
          items.map((it, i) => (
            <article
              key={i}
              className="rounded-2xl p-5 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] flex justify-between items-start gap-4 transition-all hover:bg-[var(--nav-hover-bg-heavy)] hover:border-[var(--border-color)]"
            >
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-[var(--nav-text-active)] text-lg">{it.title}</h4>
                <p className="text-[var(--nav-text-muted)] text-sm mt-1 leading-relaxed line-clamp-2">{it.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-bold">
                  {it.link && (
                    <a
                      href={it.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-indigo-500 hover:text-indigo-600 transition-colors"
                    >
                      <ExternalLink size={14} />
                      View Project
                    </a>
                  )}
                  <span className="bg-[var(--card-bg)] text-[var(--nav-text-muted)] px-3 py-1 rounded-lg border border-[var(--border-muted)]">{new Date(it.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {isOwner && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEditSection(keyName, i)} className="p-2 rounded-xl hover:bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-muted)] hover:text-[var(--nav-text-active)] transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteSectionItem(keyName, i)} className="p-2 rounded-xl hover:bg-red-500/10 text-[var(--nav-text-muted)] hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
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
  // ensure local is always an object to avoid null controlled input values
  const [local, setLocal] = useState(profile || {});
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => { 
    setLocal(profile || {}); 
  }, [profile, open]);

  // Handle file selection and upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Basic size check (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please select an image under 5MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const imageUrl = await uploadImageAction(reader.result);
        setLocal(prev => ({ ...prev, avatar: imageUrl }));
      } catch (err) {
        alert("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 max-w-2xl w-full rounded-[2.5rem] bg-[var(--dropdown-bg)] border border-[var(--border-color)] flex flex-col max-h-[85vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-[var(--border-muted)] flex justify-between items-center">
          <h3 className="text-2xl font-black text-[var(--nav-text-active)]">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--nav-hover-bg)] rounded-full text-[var(--nav-text-muted)] transition-colors"><X size={24}/></button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-8">
          {/* Identity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">User ID (Read Only)</label>
              <input 
                value={local?.ownerId ?? local?.id ?? ""} 
                disabled 
                className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-muted)] opacity-60 cursor-not-allowed outline-none font-mono text-xs" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Username</label>
              <input 
                value={local?.username ?? ""} 
                onChange={(e) => setLocal({ ...local, username: (e.target.value || "").toLowerCase().replace(/\s+/g, '') })} 
                placeholder="yubarajbose"
                className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none transition-all font-bold" 
              />
            </div>
          </div>

          {/* New Cloudinary Image Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Display name</label>
              <input value={local?.displayName ?? ""} onChange={(e) => setLocal({ ...local, displayName: e.target.value })} className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none transition-all" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Profile Picture</label>
              <div className="flex items-center gap-4 bg-[var(--nav-hover-bg)] p-3 rounded-2xl border border-[var(--border-muted)]">
                <div className="relative shrink-0">
                   <img src={local?.avatar ?? ""} alt="Avatar Preview" className={`w-14 h-14 rounded-xl object-cover border border-[var(--border-color)] ${isUploading ? 'opacity-30' : 'opacity-100'}`} />
                   {isUploading && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                     </div>
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <input 
                    type="file" 
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden" 
                  />
                  <label 
                    htmlFor="avatar-upload"
                    className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Change Image"}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Bio</label>
            <textarea value={local?.bio ?? ""} onChange={(e) => setLocal({ ...local, bio: e.target.value })} rows={3} className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none transition-all resize-none" placeholder="Tell your story..." />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Website</label>
            <input value={local?.website ?? ""} onChange={(e) => setLocal({ ...local, website: e.target.value })} className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none transition-all" placeholder="https://yourportfolio.com" />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Social links</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['github', 'youtube', 'linkedin', 'instagram'].map(s => (
                <div key={s} className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--nav-text-muted)]">
                      <IconForSocial provider={s} />
                  </div>
                  <input 
                    value={local?.socials?.[s] ?? ""} 
                    onChange={(e) => setLocal(prev => ({ ...prev, socials: { ...(prev?.socials || {}), [s]: e.target.value } }))} 
                    placeholder={`${s.charAt(0).toUpperCase() + s.slice(1)} URL`} 
                    className="w-full rounded-2xl pl-14 pr-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-sm text-[var(--nav-text-active)] focus:border-indigo-500 outline-none transition-all" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-[var(--border-muted)] flex justify-end gap-4 bg-[var(--nav-hover-bg)]">
          <button onClick={onClose} className="px-6 py-3 rounded-2xl hover:bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-active)] font-bold transition-all">Cancel</button>
          <button 
            onClick={() => { saveProfile(local, true); onClose(); }} 
            disabled={isUploading}
            className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            Update Profile
          </button>
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
      <div className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 max-w-lg w-full rounded-[2.5rem] bg-[var(--dropdown-bg)] border border-[var(--border-color)] flex flex-col max-h-[85vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-[var(--border-muted)] bg-[var(--nav-hover-bg)]">
          <h3 className="text-xl font-black text-[var(--nav-text-active)] capitalize">{editingSection?.index === -1 ? "Add" : "Edit"} {editingSection?.key}</h3>
        </div>
        <div className="p-8 overflow-y-auto space-y-4">
          <input value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} placeholder="Title" className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none" />
          <textarea value={sectionForm.description} onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })} rows={4} placeholder="Description" className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none resize-none" />
          <input value={sectionForm.link} onChange={(e) => setSectionForm({ ...sectionForm, link: e.target.value })} placeholder="Link (https://...)" className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none" />
          <input value={sectionForm.tags} onChange={(e) => setSectionForm({ ...sectionForm, tags: e.target.value })} placeholder="Tags (comma separated)" className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none" />
        </div>
        <div className="p-8 border-t border-[var(--border-muted)] flex justify-end gap-4 bg-[var(--nav-hover-bg)]">
          <button onClick={onClose} className="px-6 py-3 rounded-2xl hover:bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-active)] font-bold transition-all">Cancel</button>
          <button onClick={saveSection} disabled={!sectionForm.title || !providerLinkValid} className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-black disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Save {editingSection?.key}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------
   Main Page Component
   --------------------------- */

export default function UserProfilePage() {
  const params = useParams();
  const routeUsername = params?.username || "unknown";
  const { user: clerkUser, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
    link: "",
    tags: "",
  });

  const isOwner = useMemo(() => {
    if (!isLoaded || !clerkUser || !profile) return false;
    return profile.username === clerkUser.username || profile.ownerId === clerkUser.id;
  }, [isLoaded, clerkUser, profile]);
useEffect(() => {
    // 1. Check if the URL has ?edit=true
    const editRequested = searchParams.get('edit') === 'true';

    // 2. Only open if the user is the owner and data has finished loading
    if (editRequested && isOwner && !loading) {
      setEditOpen(true);

      // 3. Clean the URL (remove ?edit=true) so it doesn't reopen on refresh
      const cleanPath = window.location.pathname;
      router.replace(cleanPath, { scroll: false });
    }
  }, [searchParams, isOwner, loading, router]);
  // Load from database
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const dbData = await getUserProfile(routeUsername);
      if (dbData) {
        setProfile(dbData);
      } else if (isLoaded && clerkUser && routeUsername === (clerkUser.username || clerkUser.id)) {
        setProfile(makeDefaultProfile(clerkUser, routeUsername));
      }
      setLoading(false);
    }
    loadData();
  }, [routeUsername, isLoaded, clerkUser]);

  async function saveProfile(newProfile, showToast = false) {
  if (!isOwner) return;

  try {
    // 1. Call the server action and wait for success
    const response = await updateProfile(clerkUser.id, {
      displayName: newProfile.displayName,
      avatar: newProfile.avatar,
      bio: newProfile.bio,
      website: newProfile.website,
      socials: newProfile.socials,
      username: newProfile.username.toLowerCase().trim(), 
    });

    if (response.success) {
      // 2. If the username changed, redirect to the NEW URL
      // This is the most important step to prevent "reverting"
      if (newProfile.username !== routeUsername) {
        window.location.href = `/u/${newProfile.username}`;
        return; 
      }

      // 3. Otherwise, just update local state
      setProfile(newProfile);

      if (showToast) {
        const el = document.createElement("div");
        el.textContent = "Database Updated";
        el.className = "fixed bottom-6 right-6 bg-indigo-600 text-white px-5 py-2.5 rounded-xl z-[9999] shadow-2xl font-bold animate-in slide-in-from-bottom-2";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1400);
      }
    }
  } catch (e) { 
    console.error("Update failed:", e);
    alert(e.message); // Show the "Username taken" error if it happens
  }
}

  function handleFollow() {
    if (isOwner) return;
    setIsFollowing(!isFollowing);
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

  async function saveSection() {
    if (!isOwner) return;

    const key = editingSection.key;
    const index = editingSection.index;
    
    // Check if we are editing an existing item (it will have an 'id' from the DB)
    const existingId = index !== -1 ? profile.sections[key][index].id : null;

    const itemData = {
      id: existingId,
      key: key,
      title: sectionForm.title,
      description: sectionForm.description,
      link: sectionForm.link,
      tags: sectionForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      await saveSectionItem(clerkUser.id, routeUsername, itemData);
      
      // Refresh local state by re-fetching
      const updated = await getUserProfile(routeUsername);
      setProfile(updated);
      
      setEditingSection(null);
      setSectionForm({ title: "", description: "", link: "", tags: "" });
      
      // Show toast
      const el = document.createElement("div");
      el.textContent = "Section Updated";
      el.className = "fixed bottom-6 right-6 bg-indigo-600 text-white px-5 py-2.5 rounded-xl z-[9999] shadow-2xl font-bold animate-in slide-in-from-bottom-2";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1400);
    } catch (e) {
      console.error("Save section failed", e);
    }
  }

  async function deleteSectionItem(key, index) {
    if (!isOwner || !confirm("Delete this item permanently?")) return;
    
    const item = profile.sections[key][index];

    try {
      await deleteSectionItemAction(item.id, routeUsername);
      
      // Refresh local state
      const updated = await getUserProfile(routeUsername);
      setProfile(updated);
    } catch (e) {
      console.error("Delete failed", e);
    }
  }

  if (loading) return <div className="min-h-screen bg-[var(--bg-body)] flex items-center justify-center text-white font-black">FETCHING FROM NEONDB...</div>;
  if (!profile) return <div className="min-h-screen bg-[var(--bg-body)] flex items-center justify-center text-white">PROFILE NOT FOUND</div>;

  return (
    <div className={THEME_BG}>
      <div className="absolute inset-0 bg-[var(--hero-glow)] blur-[120px] opacity-20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 relative z-10">
        <header className="relative rounded-[3rem] p-8 md:p-12 border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-2xl overflow-hidden shadow-2xl">
          <div className="relative flex flex-col lg:flex-row gap-12 items-center lg:items-start text-center lg:text-left">
            <img src={profile.avatar} alt={profile.displayName} className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] object-cover border-4 border-[var(--border-muted)] shadow-2xl shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--nav-text-active)]">{profile.displayName}</h1>
                <span className="text-[var(--nav-text-muted)] font-mono text-base px-4 py-1.5 bg-[var(--nav-hover-bg)] rounded-2xl border border-[var(--border-muted)]">@{profile.username}</span>
              </div>
              <p className="mt-6 text-[var(--nav-text-muted)] text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-bold">
                {profile.bio || "Crafting experiences and building the future of the web."}
              </p>
              
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                {isOwner ? (
                  <button onClick={() => setEditOpen(true)} className="px-10 py-3.5 rounded-2xl bg-[var(--nav-hover-bg)] hover:bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-active)] transition-all font-black flex items-center gap-2 text-sm border border-[var(--border-muted)] shadow-xl">
                    <Edit2 size={18}/> Update Profile
                  </button>
                ) : (
                  <button 
                    onClick={handleFollow} 
                    className={`px-12 py-3.5 rounded-2xl transition-all font-black flex items-center gap-2 text-sm shadow-2xl ${
                      isFollowing 
                      ? 'bg-[var(--nav-hover-bg-heavy)] border border-[var(--border-color)] text-[var(--nav-text-active)]' 
                      : 'bg-indigo-600 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {isFollowing ? <UserCheck size={20}/> : <UserPlus size={20}/>}
                    {isFollowing ? "Following" : "Follow Developer"}
                  </button>
                )}
                
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="px-10 py-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-all font-black flex items-center gap-2 text-sm border border-indigo-500/20 shadow-xl">
                    Portfolio <ArrowRight size={18}/>
                  </a>
                )}
              </div>
            </div>
            
            <div className="w-full lg:w-[400px] shrink-0 space-y-6">
              <div className="bg-[var(--nav-hover-bg)] p-8 rounded-[2.5rem] border border-[var(--border-muted)] backdrop-blur-md shadow-inner">
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { val: profile.stats.followers || 0, label: "Fans" },
                        { val: profile.stats.following || 0, label: "Following" },
                        { val: profile.stats.posts, label: "Builds" },
                        { val: profile.stats.stars, label: "Stars" },
                        { val: profile.stats.views, label: "Views" },
                        { val: new Date(profile.joinedAt).getFullYear(), label: "Since" }
                    ].map((s, idx) => (
                        <div key={idx} className="bg-[var(--card-bg)] border border-[var(--border-muted)] p-3 rounded-2xl text-center shadow-sm">
                        <div className="text-xl font-black text-[var(--nav-text-active)]">{s.val}</div>
                        <div className="text-[9px] text-[var(--nav-text-muted)] font-black uppercase tracking-widest mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

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
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-500/20' 
                          : 'bg-[var(--card-bg)] border-[var(--border-muted)] text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)]'
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

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-10 min-w-0">
            {['openSource', 'projects', 'tutorials', 'articles'].map(key => (
               <SectionList
               key={key}
               title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
               subtitle={key === 'openSource' ? "Public Repos" : key === 'projects' ? "Recent Builds" : key === 'tutorials' ? "Guides" : "Thought Pieces"}
               keyName={key}
               profile={profile}
               isOwner={isOwner}
               openAddSection={openAddSection}
               openEditSection={openEditSection}
               deleteSectionItem={deleteSectionItem}
             />
            ))}
          </div>

          <aside className="lg:col-span-4 space-y-10">
            <div className="rounded-[2.5rem] p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl backdrop-blur-xl">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--nav-text-muted)] mb-6">About Developer</h3>
              <p className="text-[var(--nav-text-active)] text-sm leading-relaxed font-medium opacity-80">{profile.bio || "This developer hasn't added a detailed bio yet."}</p>
            </div>
            <div className="rounded-[2.5rem] p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl backdrop-blur-xl overflow-hidden">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--nav-text-muted)] mb-8">Social Connections</h3>
              <div className="space-y-6">
                {Object.entries(profile.socials).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-3 rounded-2xl border transition-all shrink-0 ${v ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 shadow-sm' : 'bg-[var(--nav-hover-bg)] border-[var(--border-muted)] text-[var(--nav-text-muted)] opacity-50'}`}>
                        <IconForSocial provider={k} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--nav-text-muted)]">{k}</div>
                        <div className="text-sm font-bold text-[var(--nav-text-active)] truncate">{v ? "Authenticated" : "Disconnected"}</div>
                      </div>
                    </div>
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
