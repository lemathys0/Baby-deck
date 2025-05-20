import React from "react";
import useOnlineFriends from "../hooks/useOnlineFriends";

export default function Friends({ user }) {
  const { onlineFriends, loading } = useOnlineFriends(user);

  if (loading) return <p>Chargement des amis en ligne...</p>;

  if (onlineFriends.length === 0) {
    return <p>Aucun ami en ligne pour le moment.</p>;
  }

  return (
    <div>
      <h2>Amis en ligne :</h2>
      <ul>
        {onlineFriends.map((friend) => (
          <li key={friend.uid}>
            {friend.pseudo} ({friend.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
