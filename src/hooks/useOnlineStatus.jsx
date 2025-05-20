import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function useOnlineFriends(user) {
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setOnlineFriends([]);
      setLoading(false);
      return;
    }

    const fetchOnlineFriends = async () => {
      setLoading(true);
      try {
        // Récupérer le doc user
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          setOnlineFriends([]);
          setLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        const friends = userData.friends || []; // Liste d'emails ou UIDs

        if (friends.length === 0) {
          setOnlineFriends([]);
          setLoading(false);
          return;
        }

        // Pour simplifier, supposons que friends est une liste d'UIDs.
        // On va récupérer leurs docs Firestore
        const friendsRefs = friends.map((friendUid) => doc(db, "users", friendUid));
        const friendsSnaps = await Promise.all(friendsRefs.map((ref) => getDoc(ref)));

        const online = [];

        friendsSnaps.forEach((snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.isOnline) {
              // On stocke ici un objet avec ce que tu veux afficher (email, pseudo...)
              online.push({
                uid: snap.id,
                email: data.email || "Pas d'email",
                pseudo: data.pseudo || "Inconnu",
              });
            }
          }
        });

        setOnlineFriends(online);
      } catch (error) {
        console.error("Erreur fetch online friends :", error);
        setOnlineFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOnlineFriends();
  }, [user]);

  return { onlineFriends, loading };
}
