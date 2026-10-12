"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");

    setDarkMode(isDark);

    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="flex h-11 w-11 items-center justify-center rounded-full border border-purple-200 bg-white text-xl text-[#5B21B6] transition hover:bg-purple-50 dark:border-[#4B3B78] dark:bg-[#18132D] dark:text-[#A78BFA] dark:hover:bg-[#241B3D]"
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}