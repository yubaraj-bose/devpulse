"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Trash2,
  Save,
  LogOut,
  Link as LinkIcon
} from "lucide-react";

/* ==============================
   Local Storage Key
============================== */

const STORAGE_KEY = "devpulse_settings_v1";

/* ==============================
   Helpers
============================== */

function Section({ icon: Icon, title, children }) {
  return (
    <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-5 h-5 text-indigo-400" />
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 focus:border-indigo-500 outline-none text-sm"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-zinc-200">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition relative ${
          value ? "bg-indigo-600" : "bg-zinc-600"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
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

  /* Load saved */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setSettings(JSON.parse(raw));
  }, []);

  /* Save */
  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  /* ==============================
     UI
  ============================== */

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#07040b] to-[#0f0410] text-white py-12">
      <div className="max-w-5xl mx-auto px-4 space-y-8">

        {/* Header */}
        <header>
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-300 to-pink-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-zinc-400 mt-2">
            Manage your profile, preferences and account.
          </p>
        </header>

        {/* ================= Profile ================= */}
        <Section icon={User} title="Profile">
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Display Name"
              value={settings.displayName}
              onChange={(e) =>
                setSettings({ ...settings, displayName: e.target.value })
              }
              placeholder={user?.fullName}
            />
            <Input
              label="Website"
              value={settings.website}
              onChange={(e) =>
                setSettings({ ...settings, website: e.target.value })
              }
            />
          </div>

          <div className="mt-6">
            <label className="text-xs uppercase text-zinc-400">Bio</label>
            <textarea
              rows={3}
              className="w-full mt-2 rounded-xl px-4 py-3 bg-white/5 border border-white/10"
              value={settings.bio}
              onChange={(e) =>
                setSettings({ ...settings, bio: e.target.value })
              }
            />
          </div>
        </Section>

        {/* ================= Social Links ================= */}
        <Section icon={LinkIcon} title="Social Links">
          <div className="grid md:grid-cols-3 gap-4">
            {Object.keys(settings.socials).map((k) => (
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
              />
            ))}
          </div>
        </Section>

        {/* ================= Preferences ================= */}
        <Section icon={Palette} title="Preferences">
          {Object.entries(settings.preferences).map(([k, v]) => (
            <Toggle
              key={k}
              label={k}
              value={v}
              onChange={(val) =>
                setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, [k]: val },
                })
              }
            />
          ))}
        </Section>

        {/* ================= Notifications ================= */}
        <Section icon={Bell} title="Notifications">
          {Object.entries(settings.notifications).map(([k, v]) => (
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
        </Section>

        {/* ================= Privacy ================= */}
        <Section icon={Shield} title="Privacy">
          {Object.entries(settings.privacy).map(([k, v]) => (
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
        </Section>

        {/* ================= Save Button ================= */}
        <div className="flex justify-end">
          <button
            onClick={save}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 font-bold flex items-center gap-2 shadow-lg"
          >
            <Save size={16} />
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>

        {/* ================= Danger Zone ================= */}
        <Section icon={Trash2} title="Danger Zone">
          <div className="space-y-4">

            <SignOutButton>
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10">
                <LogOut size={16} /> Sign Out
              </button>
            </SignOutButton>

            <button
              onClick={() => alert("Hook this to delete API later")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20"
            >
              <Trash2 size={16} /> Delete Account
            </button>

          </div>
        </Section>

      </div>
    </main>
  );
}
