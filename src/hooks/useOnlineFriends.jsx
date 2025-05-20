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
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          setOnlineFriends([]);
          setLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        const friends = userData.friends || []; // emails

        if (friends.length === 0) {
          setOnlineFriends([]);
          setLoading(false);
          return;
        }

        // Firestore autorise 10 éléments max dans une clause "in"
        const chunks = [];
        for (let i = 0; i < friends.length; i += 10) {
          chunks.push(friends.slice(i, i + 10));
        }

        const online = [];

        for (const chunk of chunks) {
          const q = query(
            collection(db, "users"),
            where("email", "in", chunk),
            where("isOnline", "==", true)
          );

          const snapshot = await getDocs(q);
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            online.push({
              uid: docSnap.id,
              email: data.email || "Inconnu",
              pseudo: data.pseudo || "",
            });
          });
        }

        setOnlineFriends(online);
      } catch (error) {
        console.error("Erreur chargement amis en ligne :", error);
        setOnlineFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOnlineFriends();
  }, [user]);

  return { onlineFriends, loading };
}
