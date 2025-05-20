// src/components/MatchRoom.jsx
import React, { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import BabyDeckContent from "./BabyDeckContent"; // ta liste de cartes joueurs

const MatchRoom = ({ user, matchId }) => {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [roles, setRoles] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    const matchRef = doc(db, "matches", matchId);
    const unsubscribe = onSnapshot(matchRef, docSnap => {
      if (docSnap.exists()) {
        setMatchData(docSnap.data());
        setLoading(false);
      } else {
        setMatchData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [matchId]);

  // Mettre à jour la sélection dans Firestore
  const updateSelection = async (players, roles) => {
    if (!matchData) return;
    const matchRef = doc(db, "matches", matchId);

    const updatedPlayers = {
      ...matchData.players,
      [user.uid]: { selectedPlayers: players, roles }
    };

    await updateDoc(matchRef, { players: updatedPlayers });
  };

  // Sur validation
  const handleReady = async () => {
    if (selectedPlayers.length !== 2) {
      alert("Vous devez sélectionner 2 joueurs");
      return;
    }
    await updateSelection(selectedPlayers, roles);
    setReady(true);

    // Vérifier si l’autre joueur est prêt (a 2 joueurs sélectionnés)
    const otherUid = Object.keys(matchData.players).find(uid => uid !== user.uid);
    if (
      matchData.players[otherUid] &&
      matchData.players[otherUid].selectedPlayers.length === 2
    ) {
      // Mettre à jour status du match à "started"
      const matchRef = doc(db, "matches", matchId);
      await updateDoc(matchRef, { status: "started" });
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!matchData) return <p>Match non trouvé.</p>;

  const isStarted = matchData.status === "started";

  if (isStarted) {
    return (
      <div>
        <h2>Match démarré !</h2>
        {/* TODO : afficher le match en live */}
        <pre>{JSON.stringify(matchData, null, 2)}</pre>
      </div>
    );
  }

  // Récupérer les joueurs sélectionnés pour ce joueur (si déjà fait)
  const mySelection = matchData.players[user.uid] || { selectedPlayers: [], roles: {} };

  return (
    <div>
      <h2>Sélectionnez vos 2 joueurs</h2>

      <BabyDeckContent
        user={user}
        selectedPlayers={mySelection.selectedPlayers}
        onSelectPlayer={(player) => {
          let newSelection = [...selectedPlayers];
          // toggle sélection
          if (newSelection.find(p => p.id === player.id)) {
            newSelection = newSelection.filter(p => p.id !== player.id);
          } else if (newSelection.length < 2) {
            newSelection.push(player);
          }
          setSelectedPlayers(newSelection);
        }}
      />

      <div>
        <h3>Choisissez les rôles :</h3>
        {selectedPlayers.map(player => (
          <div key={player.id}>
            <span>{player.name}</span>
            <select
              value={roles[player.id] || "attack"}
              onChange={e => setRoles({ ...roles, [player.id]: e.target.value })}
            >
              <option value="attack">Attaquant</option>
              <option value="defense">Défenseur</option>
            </select>
          </div>
        ))}
      </div>

      <button onClick={handleReady} disabled={ready || selectedPlayers.length !== 2}>
        {ready ? "En attente de l'autre joueur..." : "Valider la sélection"}
      </button>
    </div>
  );
};

export default MatchRoom;
