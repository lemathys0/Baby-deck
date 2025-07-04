// src/components/CardGrid.jsx
import React from "react";
import "./CardGrid.css"; // Assure-toi d'avoir ce fichier

export default function CardGrid({ categorizedCards, theme, codeToCardMap, highlightedCode }) {
  return (
    <div style={{ marginTop: 20 }}>
      {Object.entries(categorizedCards).map(([category, codes]) => (
        <div key={category} style={{ marginBottom: "30px" }}>
          <h5 style={{ textTransform: "capitalize", marginBottom: "10px" }}>
            {category === "joueur"
              ? "👶 Joueurs"
              : category === "equipement"
              ? "🛡️ Équipements"
              : category === "defi"
              ? "🏁 Défis"
              : category}
          </h5>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            {codes.map((code) => {
              const card = codeToCardMap[code];
              if (!card) return null;
              return (
                <img
                  key={code}
                  src={`/images/cards/${card.nom}`}
                  alt={card.nom}
                  className={code === highlightedCode ? "vibrate" : ""}
                  style={{ width: "80px", margin: "5px" }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
