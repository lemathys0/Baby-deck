import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";  // Assure-toi que le chemin est bon

const TestUploadProgress = ({ user }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("Fichier sélectionné :", file.name);
    setFileName(file.name);

    const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        console.log("Progression upload :", progress + "%");
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Erreur upload :", error);
        setUploadProgress(0);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("Upload terminé, URL :", url);
        setDownloadURL(url);
        setUploadProgress(0);
      }
    );
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {fileName && <p>Fichier : {fileName}</p>}

      {uploadProgress > 0 && (
        <div
          style={{
            width: "100%",
            height: 10,
            backgroundColor: "#ccc",
            borderRadius: 5,
            marginTop: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${uploadProgress}%`,
              height: "100%",
              backgroundColor: "#4caf50",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}

      {downloadURL && (
        <img
          src={downloadURL}
          alt="Avatar"
          style={{ marginTop: 10, width: 80, height: 80, borderRadius: "50%" }}
        />
      )}
    </div>
  );
};

export default TestUploadProgress;
