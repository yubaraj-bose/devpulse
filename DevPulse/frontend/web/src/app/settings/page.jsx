"use client";
import { useClerk } from "@clerk/nextjs";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useEffect, useState, useCallback, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { deleteUserAccountAction } from "@/lib/actions/user.actions";
import {
  User,
  Bell,
  Shield,
  Palette,
  Trash2,
  Save,
  LogOut,
  Link as LinkIcon
} from "lucide-react";
const STORAGE_KEY = "devpulse_settings_v1";
function Section({ icon: Icon, title, children }) {
  return (
    <section className="bg-[var(--card-bg)] border border-[var(--border-color)] backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20">
          <Icon className="w-6 h-6" />
        </div>
        <h2 className="font-black text-2xl text-[var(--nav-text-active)] tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-2.5">
      <label className="text-[10px] uppercase tracking-[0.25em] text-[var(--nav-text-muted)] font-black ml-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-2xl px-6 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm text-[var(--nav-text-active)] transition-all placeholder:opacity-40 font-medium"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-5 border-b border-[var(--border-muted)] last:border-0 group">
      <span className="text-sm font-bold text-[var(--nav-text-active)] capitalize group-hover:translate-x-1 transition-transform">
        {label.replace(/([A-Z])/g, " $1")}
      </span>
      <button
        aria-pressed={!!value}
        onClick={() => onChange(!value)}
        className={`w-14 h-8 rounded-full transition-all relative shadow-inner ${
          value ? "bg-indigo-600 shadow-indigo-500/40" : "bg-[var(--nav-hover-bg-heavy)]"
        }`}
      >
        <span
          className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${
            value ? "left-[1.75rem]" : "left-1.5"
          }`}
        />
      </button>
    </div>
  );
}

function DeleteAccountModal({ open, onClose, onConfirm, isDeleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={!isDeleting ? onClose : undefined}
      />
      <div className="relative z-10 max-w-md w-full rounded-[3rem] bg-[var(--dropdown-bg)] border border-red-500/30 p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-24 h-24 rounded-[2rem] bg-red-500/10 flex items-center justify-center text-red-500 ring-2 ring-red-500/20" aria-hidden>
            <Trash2 size={48} />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-black text-[var(--nav-text-active)] tracking-tighter">Delete Account?</h3>
            <p className="text-sm text-[var(--nav-text-muted)] leading-relaxed font-medium">
              This will permanently wipe your profile and <span className="text-red-500 font-bold">all projects</span>. This action is irreversible.
            </p>
          </div>
          <div className="w-full flex flex-col gap-4">
            <button
              disabled={isDeleting}
              onClick={onConfirm}
              className="w-full py-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black shadow-xl shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isDeleting ? "WIPING SERVER DATA..." : "YES, DELETE EVERYTHING"}
            </button>
            <button
              disabled={isDeleting}
              onClick={onClose}
              className="w-full py-5 rounded-2xl bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-active)] font-black hover:opacity-80 transition-all"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const router = useRouter();
 const { signOut } = useClerk();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    displayName: "",
    bio: "",
    website: "",
    socials: { github: "", linkedin: "", twitter: "", instagram: "", youtube: "" },
    preferences: { darkMode: true, autoplayVideos: true, showTrending: true },
    notifications: { likes: true, comments: true, follows: true, security: true },
    privacy: { privateProfile: false, hideEmail: true, incognitoMode: false },
  });

  const saveTimeout = useRef();

  useEffect(() => {
    setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, darkMode: isDarkMode } }));
  }, [isDarkMode]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setSettings((prev) => ({
        ...prev,
        ...parsed,
        socials: { ...prev.socials, ...(parsed.socials || {}) },
        preferences: { ...prev.preferences, ...(parsed.preferences || {}) },
        notifications: { ...prev.notifications, ...(parsed.notifications || {}) },
        privacy: { ...prev.privacy, ...(parsed.privacy || {}) },
      }));
      if (parsed.preferences?.darkMode !== undefined) setIsDarkMode(parsed.preferences.darkMode);
    } catch (e) {
      console.error(e);
    }
  }, [setIsDarkMode]);

  useEffect(() => {
    return () => clearTimeout(saveTimeout.current);
  }, []);

  const save = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, [settings]);

  const performDeletion = useCallback(async () => {
  if (!user?.id) {
    alert("No user available to delete.");
    return;
  }

  setIsDeleting(true);

  try {
    // Try server action first
    if (typeof deleteUserAccountAction === "function") {
      const res = await deleteUserAccountAction(user.id);
      if (!res?.success) throw new Error(res?.error || "Unknown server action error");

      localStorage.removeItem(STORAGE_KEY);

      // Ensure client session is cleared and then redirect to signup
      await signOut({ redirectUrl: "/sign-up" });
      return;
    }

    // Fallback to API route
    const fallback = await fetch("/api/delete-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    const data = await fallback.json();
    if (!fallback.ok || !data?.success) throw new Error(data?.error || "Fallback deletion failed");

    localStorage.removeItem(STORAGE_KEY);
    await signOut({ redirectUrl: "/sign-up" });
  } catch (err) {
    console.error("Error during wipe:", err);
    alert("Error during wipe: " + (err?.message || err));
    setIsDeleting(false);
    setDeleteModalOpen(false);
  }
}, [user, router, signOut]);

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[var(--bg-body)] text-[var(--nav-text-active)] py-16 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 bg-[var(--hero-glow)] blur-[150px] opacity-20 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 space-y-12 relative z-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black tracking-tighter">Settings</h1>
            <p className="text-[var(--nav-text-muted)] mt-2 font-semibold text-lg">Manage your DevPulse workspace</p>
          </div>
          <button
            onClick={save}
            className="px-10 py-5 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-black flex items-center gap-3 shadow-2xl active:scale-95 transition-all"
            aria-pressed={saved}
          >
            <Save size={20} />
            {saved ? "SYNCED ✓" : "SAVE SETTINGS"}
          </button>
        </header>

        <Section icon={User} title="Public Profile">
          <div className="grid md:grid-cols-2 gap-10">
            <Input label="Display Name" value={settings.displayName} onChange={(e) => setSettings({ ...settings, displayName: e.target.value })} placeholder={user?.fullName || "Your Name"} />
            <Input label="Website URL" value={settings.website} onChange={(e) => setSettings({ ...settings, website: e.target.value })} placeholder="https://yourportfolio.com" />
          </div>
          <div className="mt-10">
            <label className="text-[10px] uppercase tracking-[0.25em] text-[var(--nav-text-muted)] font-black ml-1">About You</label>
            <textarea
              rows={5}
              className="w-full mt-3 rounded-[2rem] px-6 py-5 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-sm text-[var(--nav-text-active)] focus:border-indigo-500 outline-none transition-all resize-none font-medium"
              value={settings.bio}
              onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
              placeholder="Tell your story..."
            />
          </div>
        </Section>

        <Section icon={LinkIcon} title="Social Connections">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.keys(settings.socials).map((k) => (
              <Input
                key={k}
                label={k}
                value={settings.socials[k]}
                onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, [k]: e.target.value } })}
                placeholder={`@${k}_user`}
              />
            ))}
          </div>
        </Section>

        <Section icon={Palette} title="UI Appearance">
          <div className="space-y-1">
            {Object.entries(settings.preferences).map(([k, v]) => (
              <Toggle
                key={k}
                label={k}
                value={v}
                onChange={(val) => {
                  setSettings({ ...settings, preferences: { ...settings.preferences, [k]: val } });
                  if (k === "darkMode") setIsDarkMode(val);
                }}
              />
            ))}
          </div>
        </Section>

        <Section icon={Bell} title="Activity Notifications">
          <div className="space-y-1">
            {Object.entries(settings.notifications).map(([k, v]) => (
              <Toggle key={k} label={`Notify on ${k}`} value={v} onChange={(val) => setSettings({ ...settings, notifications: { ...settings.notifications, [k]: val } })} />
            ))}
          </div>
        </Section>

        <Section icon={Shield} title="Security & Privacy">
          <div className="space-y-1">
            {Object.entries(settings.privacy).map(([k, v]) => (
              <Toggle key={k} label={k} value={v} onChange={(val) => setSettings({ ...settings, privacy: { ...settings.privacy, [k]: val } })} />
            ))}
          </div>
        </Section>

        <Section icon={Trash2} title="Danger Zone">
          <div className="grid md:grid-cols-2 gap-6">
            <SignOutButton>
              <button className="flex items-center justify-center gap-4 py-6 rounded-3xl bg-[var(--nav-hover-bg)] text-[var(--nav-text-active)] font-black hover:bg-[var(--nav-hover-bg-heavy)] transition-all border border-[var(--border-muted)]">
                <LogOut size={22} className="text-red-400" /> SIGN OUT
              </button>
            </SignOutButton>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center justify-center gap-4 py-6 rounded-3xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-black transition-all"
            >
              <Trash2 size={22} /> DELETE PERMANENTLY
            </button>
          </div>
        </Section>
      </div>

      <DeleteAccountModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={performDeletion} isDeleting={isDeleting} />
    </main>
  );
}