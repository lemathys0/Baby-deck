import React, { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

import BabyDeckContent from "./BabyDeckContent";
import ProfileMenu from "./ProfileMenu";

const Auth = ({ theme = "light", onLogin }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (onLogin) {
        onLogin(firebaseUser);
      }
    });
    return unsubscribe;
  }, [onLogin]);

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
      await setDoc(doc(db, "users", uid), {
        cards: [],
        pseudo: "",
        avatar: "",
        totalCards: 32,
        email: email.toLowerCase(),  // <-- Ajout de l'email ici
      });
      alert("Inscription réussie !");
      setIsRegistering(false);
      setEmail("");
      setPassword("");
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
        onChange={(e) => setEmail(e.target.value.toLowerCase())}
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
