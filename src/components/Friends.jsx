import React, { useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import useOnlineFriends from "../hooks/useOnlineFriends";

export default function Friends({ user }) {
  const { onlineFriends, loading } = useOnlineFriends(user);

  const [emailToAdd, setEmailToAdd] = useState("");
  const [status, setStatus] = useState("");

  const handleAddFriend = async () => {
    const email = emailToAdd.toLowerCase().trim();

    if (!email) {
      setStatus("Veuillez saisir un email.");
      return;
    }
    if (email === user.email.toLowerCase()) {
      setStatus("Tu ne peux pas t'ajouter toi-même.");
      return;
    }

    try {
      // Vérifier que l'email existe dans la base users
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setStatus("Cet email n'existe pas dans la base.");
        return;
      }

      // Ajouter l'email dans la liste d'amis de l'utilisateur connecté
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        friends: arrayUnion(email),
      });

      setStatus(`L'ami ${email} a été ajouté !`);
      setEmailToAdd("");
    } catch (error) {
      console.error("Erreur lors de l'ajout d'ami :", error);
      setStatus("Erreur lors de l'ajout d'ami.");
    }
  };

  return (
    <div>
      <h2>Amis en ligne :</h2>

      {loading ? (
        <p>Chargement des amis en ligne...</p>
      ) : onlineFriends.length === 0 ? (
        <p>Aucun ami en ligne pour le moment.</p>
      ) : (
        <ul>
          {onlineFriends.map((friend) => (
            <li key={friend.uid}>
              {friend.pseudo} ({friend.email})
            </li>
          ))}
        </ul>
      )}

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
