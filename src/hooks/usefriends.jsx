import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function useFriends(user) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.uid || !user?.email) {
        setFriends([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Récupère le document de l'utilisateur actuel
        const userRef = collection(db, "users");
        const q = query(userRef, where("email", "==", user.email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setFriends([]);
          return;
        }

        const userData = snapshot.docs[0].data();
        const friendsEmails = userData.friends || [];

        if (friendsEmails.length === 0) {
          setFriends([]);
          return;
        }

        // Firestore limite à 10 éléments dans un "in"
        const chunks = [];
        for (let i = 0; i < friendsEmails.length; i += 10) {
          chunks.push(friendsEmails.slice(i, i + 10));
        }

        const results = [];

        for (const chunk of chunks) {
          const fq = query(collection(db, "users"), where("email", "in", chunk));
          const friendSnap = await getDocs(fq);

          friendSnap.forEach((doc) => {
            const data = doc.data();
            results.push({
              uid: doc.id,
              email: data.email,
              pseudo: data.pseudo || "Inconnu",
              isOnline: data.isOnline || false,
            });
          });
        }

        setFriends(results);
      } catch (error) {
        console.error("Erreur lors du chargement des amis :", error);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  return { friends, loading };
}
