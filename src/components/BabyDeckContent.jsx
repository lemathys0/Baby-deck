import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import CardGrid from "./CardGrid";
import codeToCardMap from "../data/codeToCardMap";
import { useTheme } from "../context/ThemeContext";

export default function BabyDeckContent({ user }) {
  const { theme } = useTheme();

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [cards, setCards] = useState([]);

  const [categorizedCards, setCategorizedCards] = useState({
    joueur: [],
    equipement: [],
    defi: [],
  });

  useEffect(() => {
  if (!user || !user.uid) return;

  const docRef = doc(db, "users", user.uid);

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const userCards = docSnap.data().cards || [];
      setCards(userCards);

      const categorized = {
        joueur: [],
        equipement: [],
        defi: [],
      };

      userCards.forEach((cardName) => {
        const entry = Object.entries(codeToCardMap).find(([key, val]) => {
          if (typeof val === "object") return val.nom === cardName;
          return val === cardName;
        });

        if (entry) {
          const [, data] = entry;

          if (typeof data === "object") {
            const type = data.type.toLowerCase(); // Forcer la casse en minuscules
            console.log(`Carte trouvée: ${cardName}, type: ${type}`);

            if (categorized[type]) {
              categorized[type].push(cardName);
            } else {
              categorized.defi.push(cardName);
              console.warn(`Type inconnu "${type}" pour la carte ${cardName}, classée en défi par défaut.`);
            }
          } else {
            categorized.defi.push(cardName);
            console.log(`Carte sans type, classée en défi: ${cardName}`);
          }
        } else {
          console.warn(`Carte non trouvée dans codeToCardMap: ${cardName}`);
        }
      });

      setCategorizedCards(categorized);
    }
  });

  return () => unsubscribe();
}, [user]);


  const codePattern = /^[A-Z]{3}-\d{4}-[A-Z]{3}$/;

  const handleCodeSubmit = async () => {
    if (!code) {
      setMessage("❗ Veuillez entrer un code.");
      return;
    }

    const newCardCode = code.toUpperCase();

    if (!codePattern.test(newCardCode)) {
      setMessage("❌ Format de code invalide. Exemple : ABC-1234-XYZ");
      return;
    }

    const cardData = codeToCardMap[newCardCode];

    if (!cardData) {
      setMessage("❌ Code invalide !");
      return;
    }

    const cardName = typeof cardData === "string" ? cardData : cardData.nom;

    if (cards.includes(cardName)) {
      setMessage("✅ Carte déjà débloquée !");
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { cards: arrayUnion(cardName) });
      setMessage("🎉 Carte débloquée !");
      setCode("");
    } catch (error) {
      try {
        await setDoc(doc(db, "users", user.uid), { cards: [cardName] });
        setMessage("🎉 Carte débloquée !");
        setCode("");
      } catch (e) {
        setMessage("⚠️ Erreur : " + e.message);
      }
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "600px",
        margin: "0 auto",
        background: theme === "dark" ? "#222" : "white",
        borderRadius: "16px",
        boxShadow:
          theme === "dark"
            ? "0 4px 12px rgba(0, 0, 0, 0.7)"
            : "0 4px 12px rgba(0, 0, 0, 0.1)",
        color: theme === "dark" ? "#eee" : "#333",
        minHeight: "100vh",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        Bienvenue sur ton <span style={{ color: "#0077cc" }}>BabyDeck 🍼</span>
      </h3>

      <input
        type="text"
        placeholder="Entrez un code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ padding: "8px", marginRight: "10px", width: "60%" }}
      />
      <button onClick={handleCodeSubmit} style={{ padding: "8px" }}>
        Valider
      </button>

      <p>{message}</p>

      <h4>🎴 Cartes débloquées :</h4>
      <ul style={{ listStyle: "none", padding: 0, marginBottom: 10 }}>
        <li>👶 Joueurs : {categorizedCards.joueur.length}</li>
        <li>🛡️ Équipements : {categorizedCards.equipement.length}</li>
        <li>🏁 Défis : {categorizedCards.defi.length}</li>
        <li>📦 Total : {cards.length}</li>
      </ul>

      <CardGrid categorizedCards={categorizedCards} theme={theme} />
    </div>
  );
}
