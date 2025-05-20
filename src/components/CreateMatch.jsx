import React, { useState, useEffect } from "react";
import useOnlineFriends from "../hooks/useOnlineFriends";
import BabyDeckContent from "./BabyDeckContent";

const CreateMatch = ({ user }) => {
  const { onlineFriends, loading } = useOnlineFriends(user);

  const [selectedFriend, setSelectedFriend] = useState(null);

  // Joueurs et rôles
  const [player1, setPlayer1] = useState(null);
  const [player1Role, setPlayer1Role] = useState("attack");

  const [player2, setPlayer2] = useState(null);
  const [player2Role, setPlayer2Role] = useState("defense");

  const [matchStarted, setMatchStarted] = useState(false);
  const [score, setScore] = useState({ player1: 0, player2: 0 });

  // Reset à chaque sélection d’ami
  useEffect(() => {
    setPlayer1(null);
    setPlayer2(null);
    setPlayer1Role("attack");
    setPlayer2Role("defense");
    setMatchStarted(false);
    setScore({ player1: 0, player2: 0 });
  }, [selectedFriend]);

  // Simuler le deck de l’ami sélectionné
  const friendDeck = selectedFriend
    ? [
        { id: "f1", name: "Joueur Ami 1" },
        { id: "f2", name: "Joueur Ami 2" },
      ]
    : [];

  // Simulation du score auto (exemple)
  useEffect(() => {
    if (!matchStarted) return;
    if (score.player1 >= 10 || score.player2 >= 10) return;

    const interval = setInterval(() => {
      setScore((prev) => {
        const newScore = { ...prev };
        if (Math.random() < 0.5) newScore.player1++;
        else newScore.player2++;
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
          <li key={friend.uid}>
            <button onClick={() => setSelectedFriend(friend)}>
              {friend.email}
            </button>
          </li>
        ))}
      </ul>

      {selectedFriend && (
        <>
          <h3>Sélectionnez vos joueurs</h3>
          <div style={{ display: "flex", gap: 40 }}>
            <div>
              <h4>Votre Baby Deck</h4>
              <BabyDeckContent
                user={user}
                onSelectPlayer={setPlayer1}
                selectedPlayerId={player1?.id}
              />
              <div>
                <label>
                  <input
                    type="radio"
                    checked={player1Role === "attack"}
                    onChange={() => {
                      setPlayer1Role("attack");
                      setPlayer2Role("defense");
                    }}
                  />
                  Attaquant
                </label>
                <label style={{ marginLeft: 10 }}>
                  <input
                    type="radio"
                    checked={player1Role === "defense"}
                    onChange={() => {
                      setPlayer1Role("defense");
                      setPlayer2Role("attack");
                    }}
                  />
                  Défenseur
                </label>
              </div>
            </div>

            <div>
              <h4>{selectedFriend.email} Baby Deck</h4>
              {friendDeck.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPlayer2(p)}
                  style={{
                    padding: 8,
                    border: player2?.id === p.id ? "2px solid blue" : "1px solid gray",
                    cursor: "pointer",
                    marginBottom: 6,
                  }}
                >
                  {p.name}
                </div>
              ))}
              <div>
                <label>
                  <input
                    type="radio"
                    checked={player2Role === "attack"}
                    onChange={() => {
                      setPlayer2Role("attack");
                      setPlayer1Role("defense");
                    }}
                  />
                  Attaquant
                </label>
                <label style={{ marginLeft: 10 }}>
                  <input
                    type="radio"
                    checked={player2Role === "defense"}
                    onChange={() => {
                      setPlayer2Role("defense");
                      setPlayer1Role("attack");
                    }}
                  />
                  Défenseur
                </label>
              </div>
            </div>
          </div>

          <button
            disabled={!player1 || !player2}
            onClick={() => setMatchStarted(true)}
            style={{ marginTop: 20, padding: "10px 20px", fontWeight: "bold" }}
          >
            Démarrer le match
          </button>
        </>
      )}

      {matchStarted && (
        <div style={{ marginTop: 30 }}>
          <h3>Match en cours</h3>
          <p>
            {player1?.name || "Votre joueur"} ({player1Role}) : {score.player1}
          </p>
          <p>
            {player2?.name || "Joueur ami"} ({player2Role}) : {score.player2}
          </p>
          {(score.player1 >= 10 || score.player2 >= 10) && (
            <h4>
              Match terminé!{" "}
              {score.player1 > score.player2 ? "Vous avez gagné 🎉" : "Votre ami a gagné 😞"}
            </h4>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateMatch;
