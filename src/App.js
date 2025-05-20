import React, { useState } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Auth from "./components/Auth";
import ProfileMenu from "./components/ProfileMenu";


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

const MatchPage = ({ user }) => {
  const { matchId } = useParams();
  return <MatchRoom user={user} matchId={matchId} />;
};

const AppContent = () => {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);

  useOnlineStatus(user);

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
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
        <ThemeToggleButton />
        <Auth theme={theme} onLogin={handleLogin} />
      </div>
    );
  }

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
        <ProfileMenu user={user} onLogout={handleLogout} theme={theme} />
      </div>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CreateMatch user={user} />} />
          <Route path="/match/:matchId" element={<MatchPage user={user} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
