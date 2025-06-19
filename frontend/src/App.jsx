import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ThreePreview from './ThreePreview';
import './App.css';

export default function App() {
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [modelUrl, setModelUrl] = useState('');

  // Backend URL aus env oder fallback
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  // Upload automatisch starten, wenn file sich ändert und username gesetzt ist
  useEffect(() => {
    if (!file || !username) return;

    const uploadFile = async () => {
      try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('file', file);

        const res = await axios.post(`${backendUrl}/upload`, formData);
        if (res.data.url) {
          setModelUrl(res.data.url);
        } else {
          alert('Upload erfolgreich, aber keine URL erhalten.');
        }
      } catch (error) {
        alert('Upload fehlgeschlagen: ' + error.message);
      }
    };

    uploadFile();
  }, [file, username]);

  return (
    <div className="app-container">
      <h1>3D-Objekt hochladen & Vorschau</h1>
      <form onSubmit={e => e.preventDefault()}>
        <label>
          Benutzername:
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value.trim())}
            placeholder="z.B. maxmustermann"
            required
          />
        </label>
        <label>
          3D-Datei (obj, fbx, gltf, glb):
          <input
            type="file"
            accept=".glb,.gltf,.obj,.fbx"
            onChange={e => setFile(e.target.files[0])}
            required
          />
        </label>
      </form>
      <div className="preview-wrapper">
        {modelUrl ? (
          <ThreePreview modelUrl={modelUrl} />
        ) : (
          <p>Bitte Benutzername eingeben und 3D-Datei auswählen.</p>
        )}
      </div>
    </div>
  );
}
