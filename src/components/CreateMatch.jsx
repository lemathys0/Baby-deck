// src/components/CreateMatch.jsx
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import useOnlineFriends from "../hooks/useOnlineFriends";

export default function CreateMatch({ user }) {
  const { onlineFriends, loading } = useOnlineFriends(user);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [status, setStatus] = useState("");

  const handleCreateMatch = async () => {
    if (!selectedFriend) return setStatus("Sélectionnez un ami");

    try {
      const matchRef = await addDoc(collection(db, "matches"), {
        players: {
          [user.uid]: { selectedPlayers: [], roles: {} },
          [selectedFriend.uid]: { selectedPlayers: [], roles: {} }
        },
        status: "waiting",
        scores: {
          [user.uid]: 0,
          [selectedFriend.uid]: 0
        },
        createdAt: serverTimestamp()
      });

      setMatchId(matchRef.id);
      setStatus(`Match créé ! Partagez ce lien avec votre ami : /match/${matchRef.id}`);
    } catch (err) {
      console.error(err);
      setStatus("Erreur lors de la création du match");
    }
  };

  return (
    <div>
      <h3>Choisissez un ami en ligne :</h3>
      {loading && <p>Chargement des amis...</p>}
      {!loading && onlineFriends.length === 0 && <p>Aucun ami en ligne pour l'instant.</p>}

      <ul>
        {onlineFriends.map(friend => (
          <li key={friend.uid}>
            <button onClick={() => setSelectedFriend(friend)}>
              {friend.email} {selectedFriend?.uid === friend.uid && "(sélectionné)"}
            </button>
          </li>
        ))}
      </ul>

      <button onClick={handleCreateMatch} disabled={!selectedFriend}>
        Créer le match
      </button>

      {status && <p>{status}</p>}

      {matchId && (
        <div style={{ marginTop: 20 }}>
          <p>
            Partage ce lien avec ton ami pour qu’il rejoigne le match :{" "}
            <code>/match/{matchId}</code>
          </p>
        </div>
      )}
    </div>
  );
}
