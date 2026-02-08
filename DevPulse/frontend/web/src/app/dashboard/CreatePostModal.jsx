"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { X, Upload, Image as ImageIcon, Film, AlertCircle } from "lucide-react";

export default function CreatePostModal({ open, onClose, onPosted }) {
  const { isLoaded, user } = useUser();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!open) return null;

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) {
      setError("File too large (max 50MB).");
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return setError("Auth not ready.");
    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      if (file) fd.append("file", file);
      fd.append("text", text || "");
      fd.append("userId", user?.id || "");
      fd.append("username", user?.username || user?.id || "");

      const res = await fetch("/api/posts", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Upload failed");
      }

      const post = await res.json();
      onPosted?.(post);
      resetAndClose();
    } catch (err) {
      console.error(err);
      setError(String(err));
    } finally {
      setUploading(false);
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setPreview(null);
    setText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={uploading ? null : resetAndClose} 
      />

      {/* Modal Content */}
      <form 
        onSubmit={handleSubmit} 
        className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Create Post
          </h3>
          <button 
            type="button"
            onClick={resetAndClose}
            className="p-1 rounded-full hover:bg-white/10 text-zinc-400 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Text Area */}
          <div className="space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind? Share your project's progress..."
              className="w-full min-h-[120px] bg-black/40 border border-white/8 rounded-xl p-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-600/50 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preview Box */}
            <div className="relative group aspect-video md:aspect-auto md:h-44 border-2 border-dashed border-white/10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden transition hover:border-white/20">
              {preview ? (
                <>
                  {file?.type.startsWith("video/") ? (
                    <video src={preview} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  )}
                  <button 
                    onClick={() => {setFile(null); setPreview(null);}}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-500">
                  <ImageIcon size={32} strokeWidth={1.5} />
                  <span className="text-xs">No media selected</span>
                </div>
              )}
            </div>

            {/* Upload Area */}
            <div className="flex flex-col justify-center space-y-3">
              <label className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-white/10 bg-white/3 cursor-pointer hover:bg-white/5 transition border-dashed hover:border-purple-500/50">
                <div className="p-2 rounded-full bg-purple-600/10 text-purple-400 group-hover:scale-110 transition">
                  <Upload size={20} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-200">Click to upload</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Images or MP4 (Max 50MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={onFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/2 border-t border-white/5 flex justify-end gap-3">
          <button
            type="button"
            onClick={resetAndClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition"
            disabled={uploading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={uploading || (!text && !file)}
            className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Posting...
              </>
            ) : (
              "Post Content"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}