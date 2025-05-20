import React, { useState, useEffect } from "react";
import useOnlineFriends from "../hooks/useOnlineFriends";

const BabyDeckDragDrop = ({ cards, onChangeSelection }) => {
  const [attackCard, setAttackCard] = useState(null);
  const [defenseCard, setDefenseCard] = useState(null);

  const onDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const onDropAttack = (e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    setAttackCard(card);
    if (defenseCard?.id === cardId) setDefenseCard(null);
  };

  const onDropDefense = (e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    setDefenseCard(card);
    if (attackCard?.id === cardId) setAttackCard(null);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  // Envoie la sélection à CreateMatch
  useEffect(() => {
    onChangeSelection({
      attack: attackCard,
      defense: defenseCard,
    });
  }, [attackCard, defenseCard, onChangeSelection]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "350px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 20,
        }}
      >
        <div
          onDrop={onDropDefense}
          onDragOver={onDragOver}
          style={{
            width: "48%",
            height: "150px",
            border: "2px dashed blue",
            borderRadius: 8,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: 16,
            userSelect: "none",
          }}
        >
          {defenseCard ? defenseCard.name : "Défense (glissez ici)"}
        </div>
        <div
          onDrop={onDropAttack}
          onDragOver={onDragOver}
          style={{
            width: "48%",
            height: "150px",
            border: "2px dashed red",
            borderRadius: 8,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: 16,
            userSelect: "none",
          }}
        >
          {attackCard ? attackCard.name : "Attaque (glissez ici)"}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #ccc",
          paddingTop: 10,
          overflowX: "auto",
          display: "flex",
          gap: 10,
          height: 70,
        }}
      >
        {cards.map((card) => {
          const isSelected =
            card.id === attackCard?.id || card.id === defenseCard?.id;
          return (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => onDragStart(e, card)}
              style={{
                padding: 10,
                border: "1px solid gray",
                borderRadius: 6,
                cursor: isSelected ? "not-allowed" : "grab",
                minWidth: 80,
                textAlign: "center",
                backgroundColor: isSelected ? "#ddd" : "#fff",
                opacity: isSelected ? 0.6 : 1,
                userSelect: "none",
              }}
            >
              {card.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CreateMatch = ({ user }) => {
  const { onlineFriends, loading } = useOnlineFriends(user);

  const [selectedFriend, setSelectedFriend] = useState(null);

  // Ton baby deck - à remplacer par ta vraie data !
  const [userCards, setUserCards] = useState([
    { id: "c1", name: "Joueur A" },
    { id: "c2", name: "Joueur B" },
    { id: "c3", name: "Joueur C" },
    { id: "c4", name: "Joueur D" },
  ]);

  // Pour l’ami, simuler un baby deck aussi
  const friendDeck = selectedFriend
    ? [
        { id: "f1", name: "Joueur Ami 1" },
        { id: "f2", name: "Joueur Ami 2" },
        { id: "f3", name: "Joueur Ami 3" },
      ]
    : [];

  // Sélections baby deck
  const [userSelection, setUserSelection] = useState({ attack: null, defense: null });
  const [friendSelection, setFriendSelection] = useState({ attack: null, defense: null });

  // Match states
  const [matchStarted, setMatchStarted] = useState(false);
  const [score, setScore] = useState({ user: 0, friend: 0 });

  // Reset sélection quand ami change
  useEffect(() => {
    setUserSelection({ attack: null, defense: null });
    setFriendSelection({ attack: null, defense: null });
    setMatchStarted(false);
    setScore({ user: 0, friend: 0 });
  }, [selectedFriend]);

  // Simulation score
  useEffect(() => {
    if (!matchStarted) return;
    if (score.user >= 10 || score.friend >= 10) return;

    const interval = setInterval(() => {
      setScore((prev) => {
        const newScore = { ...prev };
        if (Math.random() < 0.5) newScore.user++;
        else newScore.friend++;
        return newScore;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [matchStarted, score]);

  return (
    <div>
      <h3>Choisissez un ami en ligne :</h3>
      {loading && <p>Chargement des amis...</p>}
      {!loading && onlineFriends.length === 0 && <p>Aucun ami en ligne pour l'instant.</p>}
      <ul>
        {onlineFriends.map((friend) => (
          <li key={friend.uid} style={{ marginBottom: 8 }}>
            <button
              onClick={() => setSelectedFriend(friend)}
              style={{
                padding: "6px 12px",
                cursor: "pointer",
                backgroundColor: selectedFriend?.uid === friend.uid ? "#4caf50" : "#eee",
                color: selectedFriend?.uid === friend.uid ? "#fff" : "#000",
                borderRadius: 4,
                border: "none",
              }}
            >
              {friend.email}
            </button>
          </li>
        ))}
      </ul>

      {selectedFriend && (
        <>
          <h3>Sélectionnez vos joueurs dans votre Baby Deck</h3>
          <BabyDeckDragDrop
            cards={userCards}
            onChangeSelection={setUserSelection}
          />

          <h3 style={{ marginTop: 40 }}>
            {selectedFriend.email} sélectionne ses joueurs (simulé)
          </h3>
          <BabyDeckDragDrop
            cards={friendDeck}
            onChangeSelection={setFriendSelection}
          />

          <button
            disabled={
              !userSelection.attack ||
              !userSelection.defense ||
              !friendSelection.attack ||
              !friendSelection.defense
            }
            onClick={() => setMatchStarted(true)}
            style={{
              marginTop: 30,
              padding: "12px 24px",
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: 6,
            }}
          >
            Démarrer le match
          </button>
        </>
      )}

      {matchStarted && (
        <div style={{ marginTop: 30 }}>
          <h3>Match en cours</h3>
          <p>
            Vous : {userSelection.attack.name} (attaque) et {userSelection.defense.name} (défense) -{" "}
            Score : {score.user}
          </p>
          <p>
            {selectedFriend.email} : {friendSelection.attack.name} (attaque) et {friendSelection.defense.name} (défense) -{" "}
            Score : {score.friend}
          </p>
          {(score.user >= 10 || score.friend >= 10) && (
            <h4>
              Match terminé! {score.user > score.friend ? "Vous avez gagné 🎉" : "Votre ami a gagné 😞"}
            </h4>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateMatch;
