import { useEffect } from "react";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function useOnlineStatus(user) {
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);

    const setOnline = async () => {
      try {
        await setDoc(userRef, { isOnline: true }, { merge: true });
      } catch (err) {
        console.error("Erreur setOnline :", err);
      }
    };

    const setOffline = async () => {
      try {
        await updateDoc(userRef, { isOnline: false });
      } catch (err) {
        console.error("Erreur setOffline :", err);
      }
    };

    setOnline();

    // Déconnexion propre quand l’onglet se ferme
    window.addEventListener("beforeunload", setOffline);

    return () => {
      setOffline();
      window.removeEventListener("beforeunload", setOffline);
    };
  }, [user]);
}
