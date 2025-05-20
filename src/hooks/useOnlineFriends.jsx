import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
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
        const friendsUIDs = userData.friends || []; // supposé liste d'UIDs

        if (friendsUIDs.length === 0) {
          setOnlineFriends([]);
          setLoading(false);
          return;
        }

        // Récupérer les docs des amis
        const friendDocsPromises = friendsUIDs.map((friendUid) => getDoc(doc(db, "users", friendUid)));
        const friendDocs = await Promise.all(friendDocsPromises);

        const online = friendDocs
          .filter((snap) => snap.exists() && snap.data().isOnline)
          .map((snap) => ({
            uid: snap.id,
            email: snap.data().email || "Pas d'email",
            pseudo: snap.data().pseudo || "Inconnu",
          }));

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
