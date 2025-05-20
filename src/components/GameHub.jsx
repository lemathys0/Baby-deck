import React, { useState } from "react";
import CreateMatch from "./CreateMatch";
import MatchHistory from "./MatchHistory";
import Leaderboard from "./Leaderboard";
import Friends from "./Friends";
import Players from "./Players";
import BabyDeckContent from "./BabyDeckContent"; // si tu veux ajouter l'onglet baby deck

const GameHub = ({ user }) => {
  const [tab, setTab] = useState("match");

  const buttonStyle = (active) => ({
    padding: "10px 20px",
    margin: 5,
    fontWeight: "bold",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    backgroundColor: active ? "#4CAF50" : "#ccc",
    color: active ? "#fff" : "#333",
  });

  return (
    <div style={{ maxWidth: 800, margin: "auto", paddingTop: 40 }}>
      <h1 style={{ textAlign: "center", marginBottom: 10 }}>🏓 Baby-Foot Hub</h1>

      {/* Affichage de l'utilisateur connecté */}
      <p style={{ textAlign: "center", marginBottom: 30, fontStyle: "italic", color: "#555" }}>
        Connecté en tant que {user.email}
      </p>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
        <button style={buttonStyle(tab === "match")} onClick={() => setTab("match")}>
          🎮 Match
        </button>
        <button style={buttonStyle(tab === "friends")} onClick={() => setTab("friends")}>
          👥 Amis
        </button>
        <button style={buttonStyle(tab === "history")} onClick={() => setTab("history")}>
          🕒 Historique
        </button>
        <button style={buttonStyle(tab === "leaderboard")} onClick={() => setTab("leaderboard")}>
          🏆 Classement
        </button>
        <button style={buttonStyle(tab === "players")} onClick={() => setTab("players")}>
          👤 Joueurs
        </button>
        <button style={buttonStyle(tab === "babydeck")} onClick={() => setTab("babydeck")}>
          🃏 Baby Deck
        </button>
      </div>

      <div style={{ marginTop: 30 }}>
        {tab === "match" && <CreateMatch user={user} />}
        {tab === "friends" && <Friends user={user} />}
        {tab === "history" && <MatchHistory user={user} />}
        {tab === "leaderboard" && <Leaderboard />}
        {tab === "players" && <Players />}
        {tab === "babydeck" && <BabyDeckContent user={user} />}
      </div>
    </div>
  );
};

export default GameHub;
