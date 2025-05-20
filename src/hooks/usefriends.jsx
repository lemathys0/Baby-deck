import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function useFriends(user) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setFriends([]);
      setLoading(false);
      return;
    }

    const fetchFriends = async () => {
      setLoading(true);
      try {
        // Récupérer le doc user
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          setFriends([]);
          setLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        const friendsEmails = userData.friends || [];

        if (friendsEmails.length === 0) {
          setFriends([]);
          setLoading(false);
          return;
        }

        // Firestore limite à 10 dans "in", on découpe en chunks
        const chunkSize = 10;
        const chunks = [];
        for (let i = 0; i < friendsEmails.length; i += chunkSize) {
          chunks.push(friendsEmails.slice(i, i + chunkSize));
        }

        const allFriends = [];

        for (const chunk of chunks) {
          const q = query(collection(db, "users"), where("email", "in", chunk));
          const snapshot = await getDocs(q);

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            allFriends.push({
              uid: docSnap.id,
              email: data.email || "Inconnu",
              pseudo: data.pseudo || "",
              isOnline: data.isOnline || false,
            });
          });
        }

        setFriends(allFriends);
      } catch (error) {
        console.error("Erreur chargement amis :", error);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  return { friends, loading };
}
