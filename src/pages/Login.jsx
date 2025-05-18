import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Connexion BabyDeck</h2>

      {!user ? (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: 'block', margin: '1rem 0', padding: '0.5rem' }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: 'block', margin: '1rem 0', padding: '0.5rem' }}
          />

          <button onClick={handleLogin} style={{ marginRight: '1rem' }}>Se connecter</button>
          <button onClick={handleRegister}>S'inscrire</button>

          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      ) : (
        <>
          <p>Connecté en tant que : <strong>{user.email}</strong></p>
          <button onClick={handleLogout}>Se déconnecter</button>
        </>
      )}
    </div>
  );
};

export default Login;
