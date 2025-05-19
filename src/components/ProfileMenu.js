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

  const getValidAvatarUrl = (url) => {
    if (!url) return "";
    const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/);
    if (match) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return url;
  };

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
            backgroundColor: isDark ? "#222" : "#fff",
            color: isDark ? "#eee" : "#222",
            boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
            borderRadius: 8,
            padding: 15,
            minWidth: 280,
            zIndex: 2000,
          }}
        >
          {!editProfileMode && !changePasswordMode && (
            <>
              {avatar && !avatarError ? (
                <img
                  src={getValidAvatarUrl(avatar)}
                  alt="Avatar"
                  onError={() => setAvatarError(true)}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    marginBottom: 10,
                    objectFit: "cover",
                    border: isDark ? "2px solid #fff" : "2px solid #222",
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: "#ccc",
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 14,
                    color: "#666",
                    margin: "auto",
                  }}
                >
                  Pas d'avatar
                </div>
              )}

              <div
                style={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#eee",
                  padding: "6px 12px",
                  borderRadius: 8,
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                {pseudo || "Aucun pseudo défini"}
              </div>

              <button style={btnStyle()} onClick={() => setEditProfileMode(true)}>
                Modifier profil
              </button>
              <button style={btnStyle()} onClick={() => setChangePasswordMode(true)}>
                Changer mot de passe
              </button>
              <button
                style={{ ...btnStyle(), backgroundColor: "#f44336", color: "#fff" }}
                onClick={() => {
                  signOut(auth);
                  if (onLogout) onLogout();
                  setMenuOpen(false);
                }}
              >
                Se déconnecter
              </button>
            </>
          )}

          {editProfileMode && (
            <>
              <label>
                Pseudo :
                <input
                  type="text"
                  value={tempPseudo}
                  onChange={(e) => setTempPseudo(e.target.value)}
                  style={inputStyle()}
                />
              </label>

              <div style={{ marginBottom: 10 }}>
                <label>
                  Choisis un avatar :
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      marginTop: 6,
                    }}
                  >
                    {[1, 2, 3, 4].map((n) => {
                      const avatarPath = `/images/avatars/avatar${n}.png`;
                      return (
                        <img
                          key={n}
                          src={avatarPath}
                          alt={`Avatar ${n}`}
                          onClick={() => setTempAvatar(avatarPath)}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: "50%",
                            border:
                              tempAvatar === avatarPath
                                ? "3px solid #4CAF50"
                                : "2px solid #ccc",
                            cursor: "pointer",
                          }}
                        />
                      );
                    })}
                  </div>
                </label>

                <label>
                  Ou URL personnalisée :
                  <input
                    type="text"
                    value={tempAvatar}
                    onChange={(e) => setTempAvatar(e.target.value)}
                    style={inputStyle()}
                  />
                </label>
              </div>

              <button style={btnStyle()} onClick={saveProfile}>
                Sauvegarder
              </button>
              <button
                style={{ ...btnStyle(), backgroundColor: "#888", marginTop: 6 }}
                onClick={() => setEditProfileMode(false)}
              >
                Annuler
              </button>
            </>
          )}

          {changePasswordMode && (
            <>
              <label>
                Ancien mot de passe :
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={inputStyle()}
                />
              </label>

              <label>
                Nouveau mot de passe :
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle()}
                />
              </label>

              <button style={btnStyle()} onClick={changePassword}>
                Modifier le mot de passe
              </button>
              <button
                style={{ ...btnStyle(), backgroundColor: "#888", marginTop: 6 }}
                onClick={() => setChangePasswordMode(false)}
              >
                Annuler
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const btnStyle = () => ({
  display: "block",
  width: "100%",
  padding: "8px 12px",
  marginTop: 10,
  backgroundColor: "#eee",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
  color: "#222",
});

const inputStyle = () => ({
  width: "100%",
  padding: 6,
  marginTop: 6,
  marginBottom: 6,
  borderRadius: 4,
  border: "1px solid #ccc",
});

export default ProfileMenu;
