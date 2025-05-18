import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AllUsersCards() {
  const [allUsersCards, setAllUsersCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersCards = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));
        setAllUsersCards(usersData);
      } catch (error) {
        console.error("Erreur récupération utilisateurs :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersCards();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h2>Cartes de tous les utilisateurs</h2>
      {allUsersCards.length === 0 && <p>Aucun utilisateur trouvé.</p>}
      <ul>
        {allUsersCards.map(user => (
          <li key={user.uid} style={{ marginBottom: "20px" }}>
            <strong>Utilisateur : </strong> {user.uid} <br />
            <strong>Cartes :</strong>{" "}
            {user.cards && user.cards.length > 0 ? (
              <ul>
                {user.cards.map((card, index) => (
                  <li key={index}>{card}</li>
                ))}
              </ul>
            ) : (
              <span>Aucune carte</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
