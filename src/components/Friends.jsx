import React, { useState } from "react";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import useFriends from "../hooks/useFriends"; // Le hook qui récupère tous les amis

export default function Friends({ user }) {
  const { friends, loading } = useFriends(user);

  const [emailToAdd, setEmailToAdd] = useState("");
  const [status, setStatus] = useState("");

  const handleAddFriend = async () => {
    setStatus("");

    if (!emailToAdd) {
      setStatus("Veuillez saisir un email.");
      return;
    }

    if (emailToAdd === user.email) {
      setStatus("Vous ne pouvez pas vous ajouter vous-même.");
      return;
    }

    try {
      // Vérifier que l'email existe bien dans la collection users
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailToAdd));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setStatus("Aucun utilisateur trouvé avec cet email.");
        return;
      }

      // Vérifier si l'email est déjà dans la liste des amis
      if (friends.some((f) => f.email === emailToAdd)) {
        setStatus("Cet utilisateur est déjà votre ami.");
        return;
      }

      // Ajouter l'email dans la liste friends de l'utilisateur
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        friends: arrayUnion(emailToAdd),
      });

      setStatus("Ami ajouté avec succès !");
      setEmailToAdd("");
    } catch (error) {
      console.error("Erreur lors de l'ajout d'ami :", error);
      setStatus("Erreur lors de l'ajout de l'ami.");
    }
  };

  return (
    <div>
      <h2>Mes amis :</h2>

      {loading ? (
        <p>Chargement des amis...</p>
      ) : friends.length === 0 ? (
        <p>Tu n’as aucun ami pour le moment.</p>
      ) : (
        <ul>
          {friends.map((friend) => (
            <li key={friend.uid}>
              {friend.pseudo || "Inconnu"} ({friend.email}){" "}
              {friend.isOnline ? (
                <span style={{ color: "green" }}>● en ligne</span>
              ) : (
                <span style={{ color: "gray" }}>● hors ligne</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Section pour ajouter un ami */}
      <div style={{ marginTop: 30 }}>
        <h3>Ajouter un ami par email :</h3>
        <input
          type="email"
          placeholder="Email de l'ami"
          value={emailToAdd}
          onChange={(e) => setEmailToAdd(e.target.value)}
          style={{ padding: "8px", width: "250px" }}
        />
        <button onClick={handleAddFriend} style={{ marginLeft: 10, padding: "8px 12px" }}>
          Ajouter
        </button>
        {status && <p style={{ marginTop: 10 }}>{status}</p>}
      </div>
    </div>
  );
}
