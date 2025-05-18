import React from "react";

export default function CardGrid({ categorizedCards, theme }) {
  const renderCards = (cards) =>
    cards.map((cardName) => (
      <div
        key={cardName}
        style={{
          border: `1px solid ${theme === "dark" ? "#555" : "#ccc"}`,
          borderRadius: "8px",
          padding: "10px",
          width: "120px",
          textAlign: "center",
          backgroundColor: theme === "dark" ? "#333" : "white",
          color: theme === "dark" ? "#eee" : "#333",
          transition: "background-color 0.3s, border-color 0.3s",
        }}
      >
        <img
          src={`/images/cards/${cardName}`} // 👈 CORRIGÉ
          alt={cardName}
          style={{ width: "100%", height: "auto", borderRadius: "4px" }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/cards/default.png";
          }}
        />
        <p>{cardName}</p>
      </div>
    ));

  return (
    <div style={{ marginTop: 20 }}>
      {Object.entries(categorizedCards).map(([category, cards]) => (
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
            {renderCards(cards)}
          </div>
        </div>
      ))}
    </div>
  );
}
