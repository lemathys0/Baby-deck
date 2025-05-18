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
            totalCards: d.totalCards || 32,
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
      await setDoc(doc(db, "users", uid), { cards: [], pseudo: "", avatar: "", totalCards: 32 });
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
        </div>

        <ProfileMenu user={user} theme={theme} onLogout={handleLogout} />

        <BabyDeckContent user={user} />

        <h3 style={{ marginTop: 30, color: theme === "dark" ? "#eee" : "#111" }}>
          📋 Cartes débloquées par les utilisateurs :
        </h3>
        <ul>
          {allUsersCards.map((u) => (
            <li key={u.uid} style={{ marginBottom: 6 }}>
              <strong>{u.pseudo}</strong> - {u.cards.length} / {u.totalCards} cartes
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 320, margin: "30px auto" }}>
      <h3>{isRegistering ? "Inscription" : "Connexion"}</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: 10, width: "100%", padding: "8px" }}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: 10, width: "100%", padding: "8px" }}
      />
      {isRegistering ? (
        <>
          <button onClick={handleRegister} style={{ width: "100%", padding: "8px" }}>
            S'inscrire
          </button>
          <p style={{ marginTop: 10 }}>
            Déjà un compte ?{" "}
            <button
              onClick={() => setIsRegistering(false)}
              style={{ color: "blue", background: "none", border: "none", cursor: "pointer" }}
            >
              Connectez-vous
            </button>
          </p>
        </>
      ) : (
        <>
          <button onClick={handleLogin} style={{ width: "100%", padding: "8px" }}>
            Se connecter
          </button>
          <p style={{ marginTop: 10 }}>
            Pas encore de compte ?{" "}
            <button
              onClick={() => setIsRegistering(true)}
              style={{ color: "blue", background: "none", border: "none", cursor: "pointer" }}
            >
              Inscrivez-vous
            </button>
          </p>
        </>
      )}
    </div>
  );
};

export default Auth;
