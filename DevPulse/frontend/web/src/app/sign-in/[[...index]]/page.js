"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--bg-body)] px-4 py-12 overflow-hidden transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs - Using brand variables for consistent glow */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
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
        {/* Enhanced Pulse/Activity Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
            
            <svg
              width="140"
              height="140"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative text-indigo-500 transition-all duration-500 group-hover:scale-110 drop-shadow-2xl"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.5" opacity="0.3" className="animate-pulse" />
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="0.3" opacity="0.2" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
              <path d="M3 12H6L9 3L15 21L18 12H21" stroke="url(#pulseGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg" />
              <defs>
                <linearGradient id="pulseGradient" x1="3" y1="12" x2="21" y2="12">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight sm:text-6xl mb-4 drop-shadow-lg">
            Welcome Back
          </h1>
          <div className="relative">
            <p className="text-lg text-[var(--nav-text-muted)] max-w-md mx-auto leading-relaxed">
              Ready to keep the momentum going?
            </p>
            <p className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mt-2">
              Check your Pulse and manage your projects.
            </p>
          </div>
          
          {/* Status Icons */}
          <div className="flex justify-center gap-8 mt-8">
            {[
              { color: "text-indigo-500", label: "Active", path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { color: "text-purple-500", label: "Growing", path: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
              { color: "text-pink-500", label: "Connected", path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }
            ].map((item, idx) => (
              <div key={idx} className="group flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] flex items-center justify-center group-hover:border-indigo-500 transition-all duration-300 group-hover:scale-110">
                  <svg className={`w-6 h-6 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.path} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--nav-text-muted)] mt-2 group-hover:text-[var(--nav-text-active)] transition-colors font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clerk SignIn Component */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000 animate-gradient-xy"></div>
          
          <div className="relative bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl">
            <SignIn
              path="/sign-in"
              signUpUrl="/sign-up"
              appearance={{
                elements: {
                  card: "bg-transparent shadow-none border-0 rounded-2xl p-8",
                  rootBox: "w-full",
                  formButtonPrimary: 
                    "bg-indigo-600 hover:bg-indigo-700 text-sm font-bold normal-case shadow-lg transition-all active:scale-95 border-0 py-3",
                  footerActionLink: "text-indigo-600 hover:text-indigo-500 font-bold transition-colors",
                  formFieldInput: 
                    "bg-[var(--nav-hover-bg)] border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 rounded-xl py-3",
                  formFieldLabel: "text-[var(--nav-text-active)] font-bold mb-2",
                  identityPreviewText: "text-[var(--nav-text-active)]",
                  formHeaderTitle: "text-[var(--nav-text-active)] text-2xl font-black mb-2",
                  formHeaderSubtitle: "text-[var(--nav-text-muted)] mb-6",
                  socialButtonsBlockButton: 
                    "bg-[var(--nav-hover-bg)] border-[var(--border-muted)] text-[var(--nav-text-active)] hover:bg-[var(--nav-hover-bg-heavy)] transition-all py-3 rounded-xl",
                  socialButtonsBlockButtonText: "text-[var(--nav-text-active)] font-bold",
                  dividerLine: "bg-[var(--border-muted)]",
                  dividerText: "text-[var(--nav-text-muted)]",
                  footerActionText: "text-[var(--nav-text-muted)]",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                },
              }}
            />
          </div>
        </div>

        <div className="mt-8 text-center">
            <p className="text-[var(--nav-text-muted)] text-sm font-medium">
              New to the community?{" "}
              <Link 
                href="/sign-up" 
                className="font-black text-indigo-600 hover:text-indigo-500 transition-all duration-300 inline-flex items-center gap-1 group"
              >
                Create an account
                <svg className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
