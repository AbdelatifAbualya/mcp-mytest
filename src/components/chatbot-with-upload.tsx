"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatbotWithUpload() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages((prev) => [...prev, "User: " + input]);
    setInput("");
    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [...prev, "Bot: Echo - " + input]);
    }, 1000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    setUploadMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setUploadMessage("File uploaded successfully: " + file.name);
      } else {
        setUploadMessage("Upload failed.");
      }
    } catch (_error) {
      setUploadMessage("Upload error.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-background text-foreground rounded-lg shadow-lg flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto mb-4 p-2 border border-border rounded">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">
            Start the conversation...
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="mb-2">
              {msg}
            </div>
          ))
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 p-2 rounded border border-border bg-input text-foreground"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Type your message..."
          aria-label="Chat input"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
      <div className="mt-4">
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-block px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          aria-label="File upload input"
          disabled={uploading}
        />
        {uploadMessage && (
          <p className="mt-2 text-sm text-muted-foreground">{uploadMessage}</p>
        )}
      </div>
    </div>
  );
}
