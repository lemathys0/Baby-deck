import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { db } from "../firebase"; // Assure-toi que db est bien exporté de ton fichier firebase.js
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const ItemTypes = {
  CARD: "card",
};

function DraggableCard({ card }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id: card.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: 8,
        margin: "0 10px",
        border: "1px solid #888",
        borderRadius: 4,
        backgroundColor: "#fff",
        cursor: "grab",
        userSelect: "none",
        width: 100,
        textAlign: "center",
      }}
    >
      {card.name}
    </div>
  );
}

function DropZone({ position, card, onDrop }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item) => onDrop(item.id, position),
    canDrop: (item) => card === null || card.id === item.id,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        height: 140,
        width: 120,
        border: "2px dashed #666",
        borderRadius: 6,
        margin: "0 10px",
        backgroundColor: isOver && canDrop ? "#acf" : "#eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        userSelect: "none",
      }}
    >
      {card ? card.name : position === "attack" ? "Attaque" : "Défense"}
    </div>
  );
}

export default function MatchRoom({ user, matchId }) {
  const unlockedCards = [
    { id: "c1", name: "Bébé Dragon" },
    { id: "c2", name: "Petit Ninja" },
    { id: "c3", name: "Mini Sorcier" },
    { id: "c4", name: "Petit Guerrier" },
  ];

  // State local des cartes sélectionnées
  const [selectedCards, setSelectedCards] = useState({
    attack: null,
    defense: null,
  });

  // État pour indiquer si le match est prêt (les 2 joueurs ont choisi)
  const [matchReady, setMatchReady] = useState(false);

  // Charger les données du match en temps réel depuis Firestore
  useEffect(() => {
    if (!matchId) return;

    const matchDocRef = doc(db, "matches", matchId);
    const unsubscribe = onSnapshot(matchDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // On met à jour nos choix si ce n'est pas nous qui a changé
        // Ici on ne fait pas la distinction joueur1/joueur2 pour simplifier, à toi d’adapter en fonction de ta logique
        if (data.players && data.players[user.uid]) {
          setSelectedCards(data.players[user.uid].cards);
        }

        // Vérifier si tous les joueurs ont choisi leurs cartes
        if (data.players) {
          const allChosen = Object.values(data.players).every(
            (p) => p.cards.attack && p.cards.defense
          );
          setMatchReady(allChosen);
        }
      }
    });

    return () => unsubscribe();
  }, [matchId, user.uid]);

  // Enregistrer dans Firestore à chaque changement de sélection locale
  useEffect(() => {
    if (!matchId) return;

    // On prépare l'objet à enregistrer
    const matchDocRef = doc(db, "matches", matchId);

    const saveData = async () => {
      // Lecture du doc pour merger les données des joueurs
      const docSnap = await getDoc(matchDocRef);
      let playersData = {};
      if (docSnap.exists()) {
        playersData = docSnap.data().players || {};
      }

      // Met à jour seulement notre sélection
      playersData[user.uid] = {
        userId: user.uid,
        email: user.email,
        cards: selectedCards,
      };

      await setDoc(
        matchDocRef,
        {
          players: playersData,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    };

    // Ne sauvegarde que si on a choisi les 2 cartes
    if (selectedCards.attack && selectedCards.defense) {
      saveData();
    }
  }, [selectedCards, matchId, user.uid, user.email]);

  const handleDrop = (cardId, position) => {
    const card = unlockedCards.find((c) => c.id === cardId);
    if (!card) return;

    setSelectedCards((prev) => {
      let newSelected = { ...prev };
      // Retirer la carte si elle est déjà sélectionnée à l’autre position
      if (prev.attack?.id === cardId) newSelected.attack = null;
      if (prev.defense?.id === cardId) newSelected.defense = null;

      newSelected[position] = card;
      return newSelected;
    });
  };

  const availableCards = unlockedCards.filter(
    (card) =>
      card.id !== selectedCards.attack?.id && card.id !== selectedCards.defense?.id
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <h2>Choisissez vos joueurs</h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <DropZone position="defense" card={selectedCards.defense} onDrop={handleDrop} />
        <DropZone position="attack" card={selectedCards.attack} onDrop={handleDrop} />
      </div>

      <h3>Vos cartes débloquées</h3>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: 10,
          backgroundColor: "#ddd",
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {availableCards.length === 0 && <p>Aucune carte disponible.</p>}
        {availableCards.map((card) => (
          <DraggableCard key={card.id} card={card} />
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          disabled={!selectedCards.attack || !selectedCards.defense || !matchReady}
          onClick={() => alert("Match lancé !")}
          style={{ padding: "10px 20px", fontWeight: "bold" }}
        >
          Lancer le match
        </button>
        {!matchReady && (
          <p style={{ marginTop: 10, color: "red" }}>
            En attente que l’autre joueur choisisse ses cartes...
          </p>
        )}
      </div>
    </DndProvider>
  );
}
