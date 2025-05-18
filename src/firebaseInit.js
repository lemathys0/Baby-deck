import { db } from "./firebase"; // adapte le chemin

import { collection, addDoc } from "firebase/firestore";

export async function ajouterMessage(texte) {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      texte: texte,
      date: new Date()
    });
    console.log("Message ajouté avec l'ID :", docRef.id);
  } catch (e) {
    console.error("Erreur lors de l'ajout du message :", e);
  }
}
