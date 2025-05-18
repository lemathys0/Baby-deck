import React, { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

import BabyDeckContent from "./BabyDeckContent";
import ProfileMenu from "./ProfileMenu";

const Auth = ({ theme = "light" }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [allUsersCards, setAllUsersCards] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setAllUsersCards([]);
      return;
    }
    const fetchUsersCards = async () => {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            uid: doc.id,
            pseudo: d.pseudo || "(Pas de pseudo)",
            cards: d.cards || [],
            totalCards: d.totalCards || 2, // Valeur par défaut si pas dans Firestore
          };
        });
        setAllUsersCards(data);
      } catch (e) {
        console.error("Erreur récupération users:", e);
      }
    };
    fetchUsersCards();
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Merci de remplir les deux champs");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      alert("Merci de remplir les deux champs");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, "users", uid), { cards: [], pseudo: "", avatar: "", totalCards: 40 });
      alert("Inscription réussie !");
      setIsRegistering(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      alert(e.message);
    }
  };

  if (user) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p>Connecté en tant que {user.email}</p>
          {/* Bouton déconnexion supprimé ici pour éviter doublon */}
        </div>

        {/* On passe handleLogout à ProfileMenu */}
        <ProfileMenu user={user} theme={theme} onLogout={handleLogout} />

        <BabyDeckContent user={user} />

        <h3 style={{ marginTop: 30, color: theme === "dark" ? "#eee" : "#111" }}>
          📋 Cartes débloquées par les utilisateurs :
        </h3>
        <ul>
          {allUsersCards.map((u) => (
            <li key={u.uid} style={{ marginBottom: 6 }}>
              <strong>{u.pseudo}</strong> : {u.cards.length} / {u.totalCards} cartes débloquées
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 320, margin: "auto" }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 10,
          borderRadius: 5,
          border: "1px solid #ccc",
          backgroundColor: theme === "dark" ? "#333" : "#fff",
          color: theme === "dark" ? "#eee" : "#111",
        }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 10,
          borderRadius: 5,
          border: "1px solid #ccc",
          backgroundColor: theme === "dark" ? "#333" : "#fff",
          color: theme === "dark" ? "#eee" : "#111",
        }}
      />

      {isRegistering ? (
        <>
          <button
            onClick={handleRegister}
            style={{
              width: "100%",
              padding: 10,
              backgroundColor: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            S'inscrire
          </button>
          <p style={{ marginTop: 10, textAlign: "center" }}>
            Déjà un compte ?{" "}
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              style={{
                background: "none",
                border: "none",
                color: theme === "dark" ? "#4caf50" : "#1a73e8",
                cursor: "pointer",
              }}
            >
              Se connecter
            </button>
          </p>
        </>
      ) : (
        <>
          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: 10,
              backgroundColor: "#1a73e8",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            Se connecter
          </button>
          <p style={{ marginTop: 10, textAlign: "center" }}>
            Pas encore de compte ?{" "}
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              style={{
                background: "none",
                border: "none",
                color: theme === "dark" ? "#4caf50" : "#1a73e8",
                cursor: "pointer",
              }}
            >
              S'inscrire
            </button>
          </p>
        </>
      )}
    </div>
  );
};

export default Auth;
