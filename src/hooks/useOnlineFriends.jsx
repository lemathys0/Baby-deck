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
          console.warn("User doc not found");
          setOnlineFriends([]);
          setLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        const friends = userData.friends || []; // liste d'emails

        if (friends.length === 0) {
          setOnlineFriends([]);
          setLoading(false);
          return;
        }

        // Découpage en chunks de 10 max (limite Firestore)
        const chunks = [];
        for (let i = 0; i < friends.length; i += 10) {
          chunks.push(friends.slice(i, i + 10));
        }

        let online = [];

        for (const chunk of chunks) {
          const q = query(collection(db, "users"), where("email", "in", chunk));
          const snapshot = await getDocs(q);

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.isOnline) {  // filtre côté client
              online.push({
                uid: docSnap.id,
                email: data.email || "Inconnu",
                pseudo: data.pseudo || "",
              });
            }
          });
        }

        console.log("Amis en ligne trouvés :", online);
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
