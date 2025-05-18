import React from "react";
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

const AppContent = () => {
  const { theme } = useTheme();

  // Ici, on va gérer l'auth dans Auth, donc on n'a pas besoin de ce fakeUser dans AppContent
  // Le mieux est de gérer la déconnexion depuis Auth et passer la fonction à ProfileMenu.

  // Pour ça, on peut remonter l'état user et la fonction logout depuis Auth via un contexte ou prop drilling,
  // mais pour simplifier, on va juste enlever le bouton Logout en haut à droite (sinon doublon)

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
      {/* TOP RIGHT TOOLBAR */}
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
        {/* 
          On supprime le bouton Logout ici pour éviter doublon, 
          puisque ProfileMenu le gère avec un vrai utilisateur connecté 
        */}
      </div>

      <Auth theme={theme} />
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
