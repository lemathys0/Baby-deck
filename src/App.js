import React, { useState } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Auth from "./components/Auth";
import ProfileMenu from "./components/ProfileMenu";
import GameHub from "./components/GameHub";

import useOnlineStatus from "./hooks/useOnlineStatus"; // adapte le chemin si besoin

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "6px 10px",
        borderRadius: 6,
        border: "none",
        backgroundColor: theme === "dark" ? "#444" : "#ddd",
        color: theme === "dark" ? "#eee" : "#333",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      {theme === "light" ? "🌙 Sombre" : "☀️ Clair"}
    </button>
  );
};

const AppContent = () => {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("auth");

  // Appelle ton hook ici avec user (il ne fait rien si user est null)
  useOnlineStatus(user);

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
    setPage("gamehub");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("auth");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme === "dark" ? "#121212" : "#fafafa",
        color: theme === "dark" ? "#eee" : "#111",
        padding: 20,
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 1000,
        }}
      >
        <ThemeToggleButton />
        {user && <ProfileMenu user={user} onLogout={handleLogout} theme={theme} />}
      </div>

      {!user && <Auth theme={theme} onLogin={handleLogin} />}
      {user && page === "gamehub" && <GameHub user={user} />}
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
