import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const Friends = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [newFriendEmail, setNewFriendEmail] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.uid) return;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFriends(data.friends || []);
      }
    };
    fetchFriends();
  }, [user]);

  const isValidEmail = (email) => {
    // Simple regex pour vérifier la validité de l'email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addFriend = async () => {
    const emailToAdd = newFriendEmail.trim().toLowerCase();

    if (!emailToAdd) {
      alert("Merci d'entrer l'email d'un ami.");
      return;
    }
    if (!isValidEmail(emailToAdd)) {
      alert("Merci d'entrer un email valide.");
      return;
    }
    if (emailToAdd === user.email.toLowerCase()) {
      alert("Tu ne peux pas t'ajouter toi-même !");
      return;
    }
    if (friends.includes(emailToAdd)) {
      alert("Cet ami est déjà dans ta liste.");
      return;
    }

    try {
      // Vérifier que l'utilisateur existe dans la base (via email)
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailToAdd));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("Cet utilisateur n'existe pas.");
        return;
      }

      // Ajouter l'ami
      const userRef = doc(db, "users", user.uid);
      const updatedFriends = [...friends, emailToAdd];
      await updateDoc(userRef, { friends: updatedFriends });
      setFriends(updatedFriends);
      setNewFriendEmail("");
      alert("Ami ajouté !");
    } catch (e) {
      alert("Erreur lors de l'ajout : " + e.message);
    }
  };

  return (
    <div>
      <h2>Mes amis</h2>
      <ul>
        {friends.length === 0 ? (
          <li>Aucun ami ajouté pour le moment.</li>
        ) : (
          friends.map((friendEmail, idx) => <li key={idx}>{friendEmail}</li>)
        )}
      </ul>
      <input
        type="email"
        placeholder="Email de ton ami"
        value={newFriendEmail}
        onChange={(e) => setNewFriendEmail(e.target.value)}
        style={{ padding: 8, width: "70%", marginRight: 8 }}
      />
      <button onClick={addFriend} style={{ padding: "8px 12px" }}>
        Ajouter
      </button>
    </div>
  );
};

export default Friends;
