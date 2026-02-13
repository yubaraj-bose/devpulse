"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
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

/* ==============================
   Themed Helpers
============================== */

function Section({ icon: Icon, title, children }) {
  return (
    <section className="bg-[var(--card-bg)] border border-[var(--border-color)] backdrop-blur-xl rounded-3xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="font-black text-xl text-[var(--nav-text-active)]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--nav-text-muted)] font-black">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-[var(--nav-text-active)] transition-all placeholder:opacity-50"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[var(--border-muted)] last:border-0">
      <span className="text-sm font-bold text-[var(--nav-text-active)] capitalize">
        {label.replace(/([A-Z])/g, ' $1')}
      </span>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full transition-all relative shadow-inner ${
          value ? "bg-indigo-600" : "bg-[var(--nav-hover-bg-heavy)]"
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${
            value ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* ==============================
   Page
============================== */

export default function SettingsPage() {
  const { user } = useUser();
  const { isDarkMode, setIsDarkMode } = useTheme();

  const [settings, setSettings] = useState({
    displayName: "",
    bio: "",
    website: "",
    socials: {
      github: "",
      linkedin: "",
      twitter: "",
    },
    preferences: {
      darkMode: true,
      autoplayVideos: true,
      showTrending: true,
    },
    notifications: {
      likes: true,
      comments: true,
      follows: true,
    },
    privacy: {
      privateProfile: false,
      hideEmail: true,
    },
  });

  const [saved, setSaved] = useState(false);

  // Sync theme to settings state
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, darkMode: isDarkMode }
    }));
  }, [isDarkMode]);

  /* Load saved with Deep Merge to prevent "undefined" errors */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // FIX: Deep merge ensures that if an object like 'socials' is missing 
        // in localStorage, it uses the default one from state instead of crashing.
        setSettings(prev => ({
          ...prev,
          ...parsed,
          socials: { ...prev.socials, ...(parsed.socials || {}) },
          preferences: { ...prev.preferences, ...(parsed.preferences || {}) },
          notifications: { ...prev.notifications, ...(parsed.notifications || {}) },
          privacy: { ...prev.privacy, ...(parsed.privacy || {}) },
        }));

        if (parsed.preferences?.darkMode !== undefined) {
          setIsDarkMode(parsed.preferences.darkMode);
        }
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, [setIsDarkMode]);

  /* Save */
  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-body)] text-[var(--nav-text-active)] py-12 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[var(--hero-glow)] blur-[120px] opacity-20 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 space-y-10 relative z-10">
        <header>
          <h1 className="text-4xl font-black text-[var(--nav-text-active)] tracking-tight">
            Account Settings
          </h1>
          <p className="text-[var(--nav-text-muted)] mt-1 font-medium">
            Manage your profile, preferences and global theme.
          </p>
        </header>

        <Section icon={User} title="Profile">
          <div className="grid md:grid-cols-2 gap-8">
            <Input
              label="Display Name"
              value={settings.displayName}
              onChange={(e) =>
                setSettings({ ...settings, displayName: e.target.value })
              }
              placeholder={user?.fullName || "Your Name"}
            />
            <Input
              label="Website"
              value={settings.website}
              onChange={(e) =>
                setSettings({ ...settings, website: e.target.value })
              }
              placeholder="https://portfolio.dev"
            />
          </div>

          <div className="mt-8">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--nav-text-muted)] font-black">Bio</label>
            <textarea
              rows={4}
              className="w-full mt-2 rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-sm text-[var(--nav-text-active)] focus:border-indigo-500 outline-none transition-all resize-none"
              value={settings.bio}
              onChange={(e) =>
                setSettings({ ...settings, bio: e.target.value })
              }
              placeholder="Tell your story..."
            />
          </div>
        </Section>

        {/* FIX: Use optional chaining and default empty objects for all iterations */}
        <Section icon={LinkIcon} title="Social Links">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.keys(settings?.socials || {}).map((k) => (
              <Input
                key={k}
                label={k}
                value={settings.socials[k]}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socials: {
                      ...settings.socials,
                      [k]: e.target.value,
                    },
                  })
                }
                placeholder={`@${k}_user`}
              />
            ))}
          </div>
        </Section>

        <Section icon={Palette} title="Appearance">
          <div className="space-y-1">
            {Object.entries(settings?.preferences || {}).map(([k, v]) => (
              <Toggle
                key={k}
                label={k}
                value={v}
                onChange={(val) => {
                  setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, [k]: val },
                  });
                  if (k === "darkMode") {
                    setIsDarkMode(val);
                  }
                }}
              />
            ))}
          </div>
        </Section>

        <Section icon={Bell} title="Notifications">
          <div className="space-y-1">
            {Object.entries(settings?.notifications || {}).map(([k, v]) => (
              <Toggle
                key={k}
                label={`Notify on ${k}`}
                value={v}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [k]: val },
                  })
                }
              />
            ))}
          </div>
        </Section>

        <Section icon={Shield} title="Privacy">
          <div className="space-y-1">
            {Object.entries(settings?.privacy || {}).map(([k, v]) => (
              <Toggle
                key={k}
                label={k}
                value={v}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, [k]: val },
                  })
                }
              />
            ))}
          </div>
        </Section>

        <div className="flex justify-end pt-4">
          <button
            onClick={save}
            className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black flex items-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Save size={18} />
            {saved ? "Changes Saved ✓" : "Save Settings"}
          </button>
        </div>

        <Section icon={Trash2} title="Danger Zone">
          <div className="space-y-4">
            <SignOutButton>
              <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[var(--nav-hover-bg)] text-[var(--nav-text-active)] font-bold hover:bg-[var(--nav-hover-bg-heavy)] transition-all border border-[var(--border-muted)]">
                <LogOut size={18} /> Sign Out
              </button>
            </SignOutButton>

            <button
              onClick={() => alert("Please contact support to delete account.")}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold transition-all"
            >
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </Section>
      </div>
    </main>
  );
}