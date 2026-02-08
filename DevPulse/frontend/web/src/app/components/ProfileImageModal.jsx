"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function ProfileImageModal({ open, onClose, user: externalUser }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [filePreview, setFilePreview] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // use either externalUser prop or the hook user (both should point to same)
  const currentUser = externalUser || user;

  if (!open) return null;

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // small validation
    if (!f.type.startsWith("image/")) {
      setMessage("Please pick an image file (jpg/png).");
      return;
    }
    setFileObj(f);
    const url = URL.createObjectURL(f);
    setFilePreview(url);
    setMessage(null);
  };

  const upload = async () => {
    if (!isLoaded) return;
    if (!fileObj) {
      setMessage("Pick an image first.");
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      // Clerk provides frontend user.setProfileImage API:
      // await user.setProfileImage({ file: fileObj })
      // wrap in try/catch for errors
      await currentUser.setProfileImage({ file: fileObj });

      // optionally reload the user to ensure UI shows updated image:
      await currentUser.reload?.();

      setMessage("Profile image updated!");
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Failed to set profile image:", err);
      setMessage("Upload failed. Try a smaller image (<= 5MB).");
      setLoading(false);
    }
  };

  const removeImage = async () => {
    setLoading(true);
    try {
      await currentUser.setProfileImage({ file: null });
      await currentUser.reload?.();
      setMessage("Profile image removed.");
      setTimeout(() => { setLoading(false); onClose(); }, 600);
    } catch (err) {
      console.error(err);
      setMessage("Could not remove image.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg">
      <div className="w-[420px] bg-zinc-900 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Update profile picture</h3>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-white/8">
              <img
                src={filePreview || currentUser?.profileImageUrl || "/default-avatar.png"}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-white/5 rounded-md">
                Choose image
                <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </label>

              <button onClick={removeImage} className="text-sm text-red-400 hover:underline">Remove image</button>
            </div>
          </div>

          {message && <div className="text-sm text-zinc-300">{message}</div>}

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10">Cancel</button>
            <button
              onClick={upload}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
