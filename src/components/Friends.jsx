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
        const friendsEmails = userData.friends || []; // Liste d'emails

        if (friendsEmails.length === 0) {
          setOnlineFriends([]);
          setLoading(false);
          return;
        }

        // Récupérer les amis par email via une requête 'where email in [...]'
        // Attention : Firestore limite à 10 items max dans un 'in' 
        // (si plus de 10 amis, faudra batcher la requête)

        const usersCollection = collection(db, "users");

        // Découper en chunks de 10 si nécessaire
        const chunkSize = 10;
        let online = [];

        for (let i = 0; i < friendsEmails.length; i += chunkSize) {
          const chunk = friendsEmails.slice(i, i + chunkSize);
          const q = query(usersCollection, where("email", "in", chunk));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.isOnline) {
              online.push({
                uid: docSnap.id,
                email: data.email,
                pseudo: data.pseudo || "Inconnu",
              });
            }
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
