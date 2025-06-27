"use client";

import React, { useEffect, useState } from "react";

const themes = ["default-dark", "zinc", "blue-dark", "slate-dark"];

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "default-dark";
    }
    return "default-dark";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="px-3 py-1 rounded-md border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-300"
      title="Toggle theme"
    >
      {theme}
    </button>
  );
}
