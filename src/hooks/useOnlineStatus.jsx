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
        const friends = userData.friends || []; // Liste d'emails

        if (friends.length === 0) {
          setOnlineFriends([]);
          setLoading(false);
          return;
        }

        // Firestore limite "in" à 10 éléments max, donc on découpe si besoin
        const chunkedFriends = [];
        for (let i = 0; i < friends.length; i += 10) {
          chunkedFriends.push(friends.slice(i, i + 10));
        }

        const online = [];

        // Pour chaque chunk d'emails, faire une requête "where in"
        for (const chunk of chunkedFriends) {
          const q = query(
            collection(db, "users"),
            where("email", "in", chunk),
            where("isOnline", "==", true)
          );
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            online.push({
              uid: docSnap.id,
              email: data.email || "Pas d'email",
              pseudo: data.pseudo || "Inconnu",
            });
          });
        }

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
