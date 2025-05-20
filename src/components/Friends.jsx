import React, { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import useFriends from "../hooks/useFriends"; // Ton hook qui récupère TOUS les amis

export default function Friends({ user }) {
  const { friends, loading } = useFriends(user);
  const [emailToAdd, setEmailToAdd] = useState("");
  const [status, setStatus] = useState("");

  const handleAddFriend = async () => {
    setStatus("");

    if (!emailToAdd.trim()) {
      setStatus("Veuillez saisir un email.");
      return;
    }

    if (emailToAdd === user.email) {
      setStatus("Vous ne pouvez pas vous ajouter vous-même.");
      return;
    }

    try {
      // Cherche l'utilisateur par email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailToAdd));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setStatus("Aucun utilisateur trouvé avec cet email.");
        return;
      }

      const friendDoc = querySnapshot.docs[0];
      const friendData = friendDoc.data();
      const friendUID = friendDoc.id;

      // Vérifie si déjà ami
      if (friends.some((f) => f.email === emailToAdd)) {
        setStatus("Cet utilisateur est déjà votre ami.");
        return;
      }

      // Ajoute l'email dans ta liste d'amis
      const myDocRef = doc(db, "users", user.uid);
      await updateDoc(myDocRef, {
        friends: arrayUnion(emailToAdd),
      });

      // Ajoute ton email dans la liste de l'autre utilisateur
      const friendDocRef = doc(db, "users", friendUID);
      await updateDoc(friendDocRef, {
        friends: arrayUnion(user.email),
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
              {friend.pseudo || "Inconnu"} ({friend.email})
            </li>
          ))}
        </ul>
      )}

      {/* Ajouter un ami par email */}
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
