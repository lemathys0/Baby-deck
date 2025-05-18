// src/components/ThemeToggleButton.js
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Basculer thème clair/sombre"
      style={{
        cursor: "pointer",
        padding: "10px 20px",
        borderRadius: 25,
        border: "none",
        backgroundColor: theme === "dark" ? "#444" : "#ddd",
        color: theme === "dark" ? "#eee" : "#222",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: 10,
        userSelect: "none",
        transition: "background-color 0.3s ease",
      }}
    >
      {theme === "dark" ? (
        <>
          <span>🌙 Mode Sombre</span>
        </>
      ) : (
        <>
          <span>☀️ Mode Clair</span>
        </>
      )}
    </button>
  );
}
