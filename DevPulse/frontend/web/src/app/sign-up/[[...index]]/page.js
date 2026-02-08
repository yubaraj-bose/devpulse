"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1"/>
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
            
            {/* Logo SVG */}
            <svg
              width="140"
              height="140"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative text-indigo-400 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-2xl"
            >
              {/* Outer Ring */}
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
              
              {/* Code Brackets */}
              <path
                d="M7 8L3 12L7 16M17 8L21 12L17 16"
                stroke="url(#gradient1)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-lg"
              />
              
              {/* Center Slash */}
              <path
                d="M14 4L10 20"
                stroke="url(#gradient2)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
              
              {/* Pulse Points */}
              <circle cx="12" cy="2" r="1.5" fill="currentColor" opacity="0.6" className="animate-pulse" />
              <circle cx="12" cy="22" r="1.5" fill="currentColor" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
              <circle cx="2" cy="12" r="1.5" fill="currentColor" opacity="0.6" className="animate-pulse" style={{ animationDelay: '1s' }} />
              <circle cx="22" cy="12" r="1.5" fill="currentColor" opacity="0.6" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
              
              {/* Gradients */}
              <defs>
                <linearGradient id="gradient1" x1="3" y1="8" x2="21" y2="16">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
                <linearGradient id="gradient2" x1="14" y1="4" x2="10" y2="20">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight sm:text-6xl mb-4 drop-shadow-lg">
            DevPulse
          </h1>
          <div className="relative">
            <p className="text-lg text-gray-300 max-w-md mx-auto leading-relaxed">
              Don&apos;t just code in the dark.
            </p>
            <p className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mt-2">
              Start flexing your projects to the world today.
            </p>
          </div>
          
          {/* Feature Icons */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="group flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-center group-hover:border-indigo-500 transition-all duration-300 group-hover:scale-110">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 mt-2 group-hover:text-gray-300 transition-colors">Fast</span>
            </div>
            
            <div className="group flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-center group-hover:border-purple-500 transition-all duration-300 group-hover:scale-110">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 mt-2 group-hover:text-gray-300 transition-colors">Secure</span>
            </div>
            
            <div className="group flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-center group-hover:border-pink-500 transition-all duration-300 group-hover:scale-110">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 mt-2 group-hover:text-gray-300 transition-colors">Modern</span>
            </div>
          </div>
        </div>

        {/* Clerk SignUp Component with Enhanced Container */}
        <div className="relative group">
          {/* Animated Border Gradient */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-1000 animate-gradient-xy"></div>
          
          {/* Glass Card Container */}
          <div className="relative bg-gray-950/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-2xl">
            <SignUp
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  card: "bg-gray-950 shadow-none border-0 rounded-2xl p-8",
                  rootBox: "w-full",
                  formButtonPrimary: 
                    "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm font-semibold normal-case shadow-lg transition-all active:scale-95 border-0 py-3",
                  footerActionLink: "text-indigo-400 hover:text-indigo-300 font-semibold transition-colors",
                  formFieldInput: 
                    "bg-gray-900 border-gray-800 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500/50 rounded-xl py-3",
                  formFieldLabel: "text-gray-300 font-medium mb-2",
                  identityPreviewText: "text-gray-300",
                  identityPreviewEditButton: "text-indigo-400 hover:text-indigo-300",
                  formHeaderTitle: "text-gray-100 text-2xl font-bold mb-2",
                  formHeaderSubtitle: "text-gray-400 mb-6",
                  socialButtonsBlockButton: 
                    "bg-gray-900 border-gray-800 text-gray-100 hover:bg-gray-800 transition-all py-3 rounded-xl",
                  socialButtonsBlockButtonText: "text-gray-100 font-medium",
                  dividerLine: "bg-gray-800",
                  dividerText: "text-gray-500",
                  formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-300",
                  footer: "bg-transparent mt-6",
                  footerActionText: "text-gray-400",
                  footerAction: "mt-4",
                  footerPages: "mt-4",
                  footerPagesLink: "text-indigo-400 hover:text-indigo-300",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  main: "gap-6",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                },
              }}
            />
          </div>
        </div>

        {/* Bottom Link with Icon */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link 
                href="/sign-in" 
                className="font-bold text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text hover:from-indigo-300 hover:to-purple-300 transition-all duration-300 inline-flex items-center gap-1 group"
              >
                Sign in
                <svg className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex justify-center gap-6 opacity-50">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-500 font-medium">SSL Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-xs text-gray-500 font-medium">Email Verified</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 3s ease infinite;
        }
      `}</style>
    </div>
  );
}