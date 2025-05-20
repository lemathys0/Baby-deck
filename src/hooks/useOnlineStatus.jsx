import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function useOnlineFriends(user) {
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      console.log("Pas d'utilisateur ou UID invalide");
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
          console.log("User doc n'existe pas");
          setOnlineFriends([]);
          setLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        console.log("userData.friends:", userData.friends);

        const friends = userData.friends || [];

        if (friends.length === 0) {
          console.log("Aucun ami dans la liste friends");
          setOnlineFriends([]);
          setLoading(false);
          return;
        }

        const chunkedFriends = [];
        for (let i = 0; i < friends.length; i += 10) {
          chunkedFriends.push(friends.slice(i, i + 10));
        }

        const online = [];

        for (const chunk of chunkedFriends) {
          console.log("Requête Firestore avec emails:", chunk);

          const q = query(
            collection(db, "users"),
            where("email", "in", chunk),
            where("isOnline", "==", true)
          );

          const querySnapshot = await getDocs(q);
          console.log("Nombre d'amis en ligne trouvés dans ce chunk :", querySnapshot.size);

          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            online.push({
              uid: docSnap.id,
              email: data.email || "Pas d'email",
              pseudo: data.pseudo || "Inconnu",
            });
          });
        }

        console.log("Amis en ligne récupérés :", online);

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
