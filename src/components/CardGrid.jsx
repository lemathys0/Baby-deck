import React from "react";

export default function CardGrid({ categorizedCards, theme }) {
  return (
    <div style={{ marginTop: 20 }}>
      {Object.entries(categorizedCards).map(([category, images]) => (
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
            {images.map((imgName) => (
              <img
                key={imgName}
                src={`/images/card/${imgName}`}
                alt={imgName}
                style={{ width: "80px", borderRadius: "8px" }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
