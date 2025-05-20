import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  signOut,
} from "firebase/auth";
import { db } from "../firebase";

const ProfileMenu = ({ user, theme = "light", onLogout }) => {
  const [pseudo, setPseudo] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePasswordMode, setChangePasswordMode] = useState(false);

  const [editProfileMode, setEditProfileMode] = useState(false);
  const [tempPseudo, setTempPseudo] = useState("");
  const [tempAvatar, setTempAvatar] = useState("");

  const isDark = theme === "dark";
  const auth = getAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPseudo(data.pseudo || "");
          setAvatar(data.avatar || "");
          setTempPseudo(data.pseudo || "");
          setTempAvatar(data.avatar || "");
          setAvatarError(false);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (user?.uid) fetchUserData();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const saveProfile = async () => {
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        pseudo: tempPseudo,
        avatar: tempAvatar,
      });

      setPseudo(tempPseudo);
      setAvatar(tempAvatar);
      setAvatarError(false);
      setEditProfileMode(false);
      alert("Profil mis à jour !");
    } catch (e) {
      alert("Erreur lors de la mise à jour : " + e.message);
    }
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword) {
      alert("Remplis tous les champs du mot de passe");
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      alert("Mot de passe changé !");
      setOldPassword("");
      setNewPassword("");
      setChangePasswordMode(false);
    } catch (e) {
      if (e.code === "auth/requires-recent-login") {
        alert("Reconnecte-toi pour changer ton mot de passe.");
        await signOut(auth);
        if (onLogout) onLogout();
      } else if (e.code === "auth/wrong-password") {
        alert("Mot de passe actuel incorrect.");
      } else {
        alert("Erreur : " + e.message);
      }
    }
  };

  return (
    <div style={{ position: "relative", textAlign: "right" }}>
      <button
        onClick={() => setMenuOpen((open) => !open)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 24,
          color: isDark ? "#fff" : "#222",
        }}
        aria-label="Ouvrir le menu profil"
      >
        &#8942;
      </button>

      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: "36px",
            right: 0,
            backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9",
            color: isDark ? "#f1f1f1" : "#1e1e1e",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            borderRadius: 12,
            padding: 20,
            width: 300,
            zIndex: 2000,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {!editProfileMode && !changePasswordMode && (
            <>
              <div style={{ textAlign: "center", marginBottom: 15 }}>
                {avatar && !avatarError ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    onError={() => setAvatarError(true)}
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: isDark ? "3px solid #fff" : "3px solid #222",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      backgroundColor: "#bbb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: "#666",
                      margin: "auto",
                    }}
                  >
                    Pas d'avatar
                  </div>
                )}

                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    marginTop: 10,
                    padding: 6,
                    backgroundColor: isDark ? "#2a2a2a" : "#e5e5e5",
                    borderRadius: 8,
                  }}
                >
                  {pseudo || "Aucun pseudo"}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button style={btnStyle()} onClick={() => setEditProfileMode(true)}>
                  ✏️ Modifier le profil
                </button>
                <button style={btnStyle()} onClick={() => setChangePasswordMode(true)}>
                  🔐 Changer le mot de passe
                </button>
                <button style={btnStyle()} onClick={() => window.location.href = "/gamehub"}>
                  🎮 Game Hub
                </button>
                <button
                  style={{
                    ...btnStyle(),
                    backgroundColor: "#e53935",
                    color: "#fff",
                  }}
                  onClick={() => {
                    signOut(auth);
                    if (onLogout) onLogout();
                    setMenuOpen(false);
                  }}
                >
                  🚪 Se déconnecter
                </button>
              </div>
            </>
          )}

          {editProfileMode && (
            <>
              <label>
                <span style={{ fontWeight: 600 }}>Pseudo :</span>
                <input
                  type="text"
                  value={tempPseudo}
                  onChange={(e) => setTempPseudo(e.target.value)}
                  style={inputStyle()}
                />
              </label>

              <div style={{ marginBottom: 10 }}>
                <span style={{ fontWeight: 600 }}>Choisis un avatar :</span>
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4].map((n) => {
                    const avatarPath = `/images/Avatars/avatar${n}.png`;
                    return (
                      <img
                        key={n}
                        src={avatarPath}
                        alt={`Avatar ${n}`}
                        onClick={() => setTempAvatar(avatarPath)}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          cursor: "pointer",
                          objectFit: "cover",
                          border:
                            tempAvatar === avatarPath
                              ? "3px solid #4CAF50"
                              : "2px solid transparent",
                          boxShadow:
                            tempAvatar === avatarPath
                              ? "0 0 6px rgba(0,0,0,0.3)"
                              : "none",
                          transition: "all 0.2s ease",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15 }}>
                <button style={btnStyle()} onClick={saveProfile}>
                  ✅ Enregistrer
                </button>
                <button
                  style={{ ...btnStyle(), backgroundColor: "#e53935", color: "#fff" }}
                  onClick={() => {
                    setEditProfileMode(false);
                    setTempPseudo(pseudo);
                    setTempAvatar(avatar);
                  }}
                >
                  ❌ Annuler
                </button>
              </div>
            </>
          )}

          {changePasswordMode && (
            <>
              <label>
                <span style={{ fontWeight: 600 }}>Ancien mot de passe :</span>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={inputStyle()}
                />
              </label>
              <label>
                <span style={{ fontWeight: 600 }}>Nouveau mot de passe :</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle()}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15 }}>
                <button style={btnStyle()} onClick={changePassword}>
                  ✅ Valider
                </button>
                <button
                  style={{ ...btnStyle(), backgroundColor: "#e53935", color: "#fff" }}
                  onClick={() => setChangePasswordMode(false)}
                >
                  ❌ Annuler
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const btnStyle = () => ({
  padding: "8px 16px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  backgroundColor: "#4CAF50",
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14,
});

const inputStyle = () => ({
  width: "100%",
  padding: 8,
  margin: "6px 0 12px",
  boxSizing: "border-box",
  borderRadius: 4,
  border: "1px solid #ccc",
});

export default ProfileMenu;
