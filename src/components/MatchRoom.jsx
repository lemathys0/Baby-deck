import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  CARD: "card",
};

function DraggableCard({ card, onDropCard }) {
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

export default function MatchRoom({ user }) {
  // Exemple : cartes débloquées par l'utilisateur
  const unlockedCards = [
    { id: "c1", name: "Bébé Dragon" },
    { id: "c2", name: "Petit Ninja" },
    { id: "c3", name: "Mini Sorcier" },
    { id: "c4", name: "Petit Guerrier" },
  ];

  // États des cartes sélectionnées (attaque / défense)
  const [selectedCards, setSelectedCards] = useState({
    attack: null,
    defense: null,
  });

  // Fonction appelée quand on drop une carte sur une zone
  const handleDrop = (cardId, position) => {
    // Trouver la carte à partir de son id
    const card = unlockedCards.find((c) => c.id === cardId);
    if (!card) return;

    // On autorise une seule carte par position
    setSelectedCards((prev) => {
      // Si la carte est déjà sélectionnée à l’autre position, on la retire de là-bas
      let newSelected = { ...prev };
      if (prev.attack?.id === cardId) newSelected.attack = null;
      if (prev.defense?.id === cardId) newSelected.defense = null;

      // On place la carte sur la nouvelle position
      newSelected[position] = card;
      return newSelected;
    });
  };

  // Carte disponibles = toutes cartes - celles déjà sélectionnées
  const availableCards = unlockedCards.filter(
    (card) =>
      card.id !== selectedCards.attack?.id && card.id !== selectedCards.defense?.id
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <h2>Choisissez vos joueurs</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <DropZone
          position="defense"
          card={selectedCards.defense}
          onDrop={handleDrop}
        />
        <DropZone
          position="attack"
          card={selectedCards.attack}
          onDrop={handleDrop}
        />
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
          disabled={!selectedCards.attack || !selectedCards.defense}
          onClick={() => alert(`Match lancé avec:\nAttaque: ${selectedCards.attack.name}\nDéfense: ${selectedCards.defense.name}`)}
          style={{ padding: "10px 20px", fontWeight: "bold" }}
        >
          Lancer le match
        </button>
      </div>
    </DndProvider>
  );
}
