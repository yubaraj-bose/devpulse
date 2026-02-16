"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--bg-body)] px-4 py-12 overflow-hidden transition-colors duration-300">
      {/* ========== BACKGROUND GLOW ========== */}
      <div className="absolute inset-0 bg-[var(--hero-glow)] blur-3xl opacity-40 pointer-events-none" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-color)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Enhanced Logo with Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
            
            <svg
              width="140"
              height="140"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative text-indigo-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-2xl"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.3"
                className="animate-spin"
                style={{ animationDuration: '20s' }}
              />
              
              <path
                d="M7 8L3 12L7 16M17 8L21 12L17 16"
                stroke="url(#gradient1)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              <path
                d="M14 4L10 20"
                stroke="url(#gradient2)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              
              <defs>
                <linearGradient id="gradient1" x1="3" y1="8" x2="21" y2="16">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="gradient2" x1="14" y1="4" x2="10" y2="20">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight sm:text-6xl mb-4">
            DevPulse
          </h1>
          <div className="relative">
            <p className="text-lg text-[var(--nav-text-muted)] max-w-md mx-auto leading-relaxed">
              Don&apos;t just code in the dark.
            </p>
            <p className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mt-2 font-black">
              Start flexing your projects today.
            </p>
          </div>
          
          {/* Feature Icons */}
          <div className="flex justify-center gap-8 mt-8">
            {[
              { color: "text-indigo-500", label: "Fast", path: "M13 10V3L4 14h7v7l9-11h-7z" },
              { color: "text-purple-500", label: "Secure", path: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
              { color: "text-pink-500", label: "Modern", path: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" }
            ].map((icon, i) => (
              <div key={i} className="group flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                  <svg className={`w-6 h-6 ${icon.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon.path} />
                  </svg>
                </div>
                <span className="text-xs text-[var(--nav-text-muted)] mt-2 font-black uppercase tracking-widest">{icon.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clerk SignUp Component */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl">
            <SignUp
              path="/sign-up"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/post-signup"
              appearance={{
                elements: {
                  card: "bg-transparent shadow-none border-0 rounded-2xl p-8",
                  rootBox: "w-full",
                  formButtonPrimary: 
                    "bg-indigo-600 hover:bg-indigo-700 text-sm font-black normal-case shadow-lg transition-all active:scale-95 border-0 py-3",
                  footerActionLink: "text-indigo-600 hover:text-indigo-500 font-bold",
                  formFieldInput: 
                    "bg-[var(--nav-hover-bg)] border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 rounded-xl py-3 transition-all",
                  formFieldLabel: "text-[var(--nav-text-active)] font-black uppercase text-[10px] tracking-wider mb-2",
                  identityPreviewText: "text-[var(--nav-text-active)]",
                  formHeaderTitle: "text-[var(--nav-text-active)] text-2xl font-black mb-2",
                  formHeaderSubtitle: "text-[var(--nav-text-muted)] mb-6",
                  socialButtonsBlockButton: 
                    "bg-[var(--nav-hover-bg)] border-[var(--border-muted)] text-[var(--nav-text-active)] hover:bg-[var(--nav-hover-bg-heavy)] transition-all py-3 rounded-xl",
                  socialButtonsBlockButtonText: "text-[var(--nav-text-active)] font-bold",
                  dividerLine: "bg-[var(--border-muted)]",
                  dividerText: "bg-[var(--nav-text-muted)]",
                  footerActionText: "text-[var(--nav-text-muted)]",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                },
              }}
            />
          </div>
        </div>

        {/* Bottom Link */}
        <div className="mt-8 text-center">
          <p className="text-[var(--nav-text-muted)] text-sm font-medium">
            Already have an account?{" "}
            <Link 
              href="/sign-in" 
              className="font-black text-indigo-600 hover:text-indigo-500 transition-all inline-flex items-center gap-1 group"
            >
              Sign in
              <svg className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex justify-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] text-[var(--nav-text-muted)] font-black uppercase">SSL Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-[10px] text-[var(--nav-text-muted)] font-black uppercase">Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
