import React, { useState, useEffect } from "react";
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

  // Pour changer le mdp
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePasswordMode, setChangePasswordMode] = useState(false);

  // Pour modifier le profil
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [tempPseudo, setTempPseudo] = useState("");
  const [tempAvatar, setTempAvatar] = useState("");

  const isDark = theme === "dark";
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPseudo(data.pseudo || "");
          setAvatar(data.avatar || "");
          setAvatarError(false);
          setTempPseudo(data.pseudo || "");
          setTempAvatar(data.avatar || "");
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (user?.uid) fetchUserData();
  }, [user]);

  const containerStyle = {
    position: "relative",
    textAlign: "right",
  };

  const buttonStyle = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 24,
    color: isDark ? "#fff" : "#222",
    userSelect: "none",
  };

  const menuStyle = {
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
  };

  const pseudoStyle = {
    fontWeight: "600",
    fontSize: "1.1rem",
    color: isDark ? "#fff" : "#222",
    backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    padding: "6px 12px",
    borderRadius: 8,
    userSelect: "none",
    marginBottom: 10,
    textAlign: "center",
  };

  const avatarStyle = {
    width: 80,
    height: 80,
    borderRadius: "50%",
    marginBottom: 10,
    objectFit: "cover",
    border: isDark ? "2px solid #fff" : "2px solid #222",
    backgroundColor: "#ccc",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  };

  const btnStyle = {
    display: "block",
    width: "100%",
    padding: "8px 12px",
    marginTop: 10,
    backgroundColor: isDark ? "#444" : "#eee",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    color: isDark ? "#eee" : "#222",
  };

  const logoutBtnStyle = {
    ...btnStyle,
    backgroundColor: "#f44336",
    color: "white",
    marginTop: 10,
  };

  // Petite vérification / correction pour les URLs Google Drive
  // Transforme les liens Google Drive en liens directs pour afficher l’image
  // Ex: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // => https://drive.google.com/uc?export=view&id=FILE_ID
  const getValidAvatarUrl = (url) => {
    if (!url) return "";
    const googleDriveMatch = url.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/);
    if (googleDriveMatch) {
      return `https://drive.google.com/uc?export=view&id=${googleDriveMatch[1]}`;
    }
    // sinon retourne l'URL telle quelle
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
      alert("Mot de passe changé avec succès !");
      setOldPassword("");
      setNewPassword("");
      setChangePasswordMode(false);
    } catch (e) {
      if (e.code === "auth/requires-recent-login") {
        alert("Merci de vous reconnecter pour changer votre mot de passe.");
        await signOut(auth);
        if (onLogout) onLogout();
      } else if (e.code === "auth/wrong-password") {
        alert("Mot de passe actuel incorrect.");
      } else {
        alert("Erreur lors du changement de mot de passe : " + e.message);
      }
    }
  };

  return (
    <div style={containerStyle}>
      <button
        onClick={() => setMenuOpen((open) => !open)}
        style={buttonStyle}
        aria-label="Ouvrir le menu profil"
      >
        &#8942;
      </button>

      {menuOpen && (
        <div style={menuStyle}>
          {!editProfileMode && !changePasswordMode && (
            <>
              {avatar && !avatarError ? (
                <img
                  src={getValidAvatarUrl(avatar)}
                  alt="Avatar utilisateur"
                  style={avatarStyle}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div
                  style={{
                    ...avatarStyle,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#666",
                    fontSize: 14,
                  }}
                >
                  Pas d'avatar
                </div>
              )}

              <div style={pseudoStyle}>{pseudo || "Aucun pseudo défini"}</div>

              <button
                style={btnStyle}
                onClick={() => setEditProfileMode(true)}
              >
                Modifier profil
              </button>

              <button
                style={btnStyle}
                onClick={() => setChangePasswordMode(true)}
              >
                Changer mot de passe
              </button>

              <button
                style={logoutBtnStyle}
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
                  style={{
                    width: "100%",
                    padding: 6,
                    margin: "6px 0",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                  }}
                />
              </label>

              <label>
                URL avatar :
                <input
                  type="text"
                  value={tempAvatar}
                  onChange={(e) => setTempAvatar(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 6,
                    margin: "6px 0",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                  }}
                />
              </label>

              <button style={btnStyle} onClick={saveProfile}>
                Sauvegarder
              </button>
              <button
                style={{ ...btnStyle, backgroundColor: "#888", marginTop: 6 }}
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
                  style={{
                    width: "100%",
                    padding: 6,
                    margin: "6px 0",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                  }}
                />
              </label>

              <label>
                Nouveau mot de passe :
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 6,
                    margin: "6px 0",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                  }}
                />
              </label>          <button style={btnStyle} onClick={changePassword}>
            Modifier le mot de passe
          </button>
          <button
            style={{ ...btnStyle, backgroundColor: "#888", marginTop: 6 }}
            onClick={() => setChangePasswordMode(false)}
          >
            Annuler
          </button>
        </>
      )}
    </div>
  )}
</div>);
};

export default ProfileMenu;


