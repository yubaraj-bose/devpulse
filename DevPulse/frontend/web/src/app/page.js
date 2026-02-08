"use server";

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Code2, Rocket, Share2, Star, Zap, TrendingUp, Users, Github, Eye, Heart } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid Pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 40%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 40%, black, transparent)'
          }} />
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-600/20 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          
          {/* Floating Code Symbols */}
          <div className="absolute top-20 left-[10%] text-indigo-500/20 text-6xl font-mono animate-float">&lt;/&gt;</div>
          <div className="absolute top-40 right-[15%] text-purple-500/20 text-5xl font-mono animate-float" style={{ animationDelay: '1s' }}>{ }</div>
          <div className="absolute bottom-40 left-[20%] text-pink-500/20 text-4xl font-mono animate-float" style={{ animationDelay: '2s' }}>[ ]</div>
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-12 backdrop-blur-sm hover:border-indigo-500/40 transition-all group cursor-default animate-fade-in">
            <Star className="w-4 h-4 text-indigo-400 fill-indigo-400 group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold text-indigo-200 tracking-wide">THE #1 DEVELOPER SHOWCASING PLATFORM</span>
            <div className="flex gap-0.5">
              <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-8 animate-slide-up leading-[0.9]">
            Code. Sync.
            <br />
            <span className="relative inline-block mt-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient">
                Get Recognized.
              </span>
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl -z-10 animate-pulse" />
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Stop letting your side projects <span className="text-gray-300 font-semibold">die in private repositories</span>. 
            <br className="hidden md:block" />
            Sync your GitHub, showcase your craft, and let the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-bold">
              community decide your rank
            </span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link
              href={userId ? "/dashboard" : "/sign-up"}
              className="group relative px-12 py-6 bg-white text-black font-bold text-lg rounded-2xl overflow-hidden transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3">
                <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>{userId ? "Go to Dashboard" : "Start Flexing Now"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
            
            <Link
              href="/explore"
              className="group px-12 py-6 bg-transparent text-white font-bold text-lg rounded-2xl border-2 border-gray-700 hover:border-indigo-500 transition-all hover:bg-white/5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6" />
                <span>Explore Gallery</span>
              </div>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-indigo-500/50 transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative">
                <div className="text-4xl font-black text-white mb-2">10K+</div>
                <div className="text-sm text-gray-400 font-medium">Developers</div>
              </div>
            </div>
            
            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-purple-500/50 transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative">
                <div className="text-4xl font-black text-white mb-2">50K+</div>
                <div className="text-sm text-gray-400 font-medium">Projects</div>
              </div>
            </div>
            
            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-pink-500/50 transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative">
                <div className="text-4xl font-black text-white mb-2">1M+</div>
                <div className="text-sm text-gray-400 font-medium">Views</div>
              </div>
            </div>
            
            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-indigo-500/50 transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative">
                <div className="text-4xl font-black text-white mb-2">100K+</div>
                <div className="text-sm text-gray-400 font-medium">Stars Given</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="relative py-32 overflow-hidden">
        <div className="container relative z-10 mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-indigo-300 tracking-wide">POWERFUL FEATURES</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Everything You Need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Stand Out
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built for developers who are serious about showcasing their work
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-indigo-500/50 transition-all hover:transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Github className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">GitHub Sync</h3>
                <p className="text-gray-400 leading-relaxed">
                  Connect your GitHub account and automatically showcase your best repositories with real-time updates.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-purple-500/50 transition-all hover:transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Community Ranking</h3>
                <p className="text-gray-400 leading-relaxed">
                  Get ranked based on project quality, engagement, and community votes. Rise to the top of the leaderboard.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-pink-500/50 transition-all hover:transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Share2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Share Anywhere</h3>
                <p className="text-gray-400 leading-relaxed">
                  Beautiful project cards ready to share on social media, in your portfolio, or with potential employers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur-3xl" />
        
        <div className="container relative z-10 mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
            Ready to Get{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Discovered
            </span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Join thousands of developers who are already showcasing their work and building their reputation.
          </p>
          <Link
            href={userId ? "/dashboard" : "/sign-up"}
            className="group inline-flex items-center gap-3 px-16 py-7 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xl rounded-2xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:scale-105 active:scale-95"
          >
            <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span>{userId ? "Go to Dashboard" : "Get Started Free"}</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}