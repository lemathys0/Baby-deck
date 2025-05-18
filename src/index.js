import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ajouterMessage } from "./firebaseInit.js";
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';  // <-- ajoute cet import

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider>
    <UserProvider>          {/* <-- ajoute ce provider */}
      <App />
    </UserProvider>
  </ThemeProvider>
);

ajouterMessage("Salut BabyDeck via npm!");
