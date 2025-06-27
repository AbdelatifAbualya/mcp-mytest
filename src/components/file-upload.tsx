"use client";

import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setMessage("File uploaded successfully.");
      } else {
        setMessage("Upload failed.");
      }
    } catch (_error) {
      setMessage("Upload error.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-600 rounded-md bg-background text-foreground max-w-md mx-auto">
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 w-full"
        aria-label="File upload input"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
