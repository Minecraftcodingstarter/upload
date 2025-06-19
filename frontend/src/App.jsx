import React, { useState } from 'react';
import axios from 'axios';
import ThreePreview from './ThreePreview';

export default function App() {
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [modelUrl, setModelUrl] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !file) {
      alert('Bitte Benutzername und Datei angeben!');
      return;
    }

    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('file', file);

    try {
      const res = await axios.post(`${backendUrl}/upload`, formData);
      if (res.data.url) {
        setModelUrl(res.data.url);
      } else {
        alert('Keine Datei-URL vom Server erhalten.');
      }
    } catch (err) {
      alert('Upload-Fehler: ' + err.message);
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'Arial' }}>
      <h2>3D Datei Upload & Vorschau</h2>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            Benutzername<br />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: 8, fontSize: 16 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>
            3D Datei (.glb, .gltf, .obj, .fbx)<br />
            <input
              type="file"
              accept=".glb,.gltf,.obj,.fbx"
              onChange={onFileChange}
              required
            />
          </label>
        </div>

        <button
          type="submit"
          style={{ padding: '10px 20px', fontSize: 16, cursor: 'pointer' }}
        >
          Hochladen & Anzeigen
        </button>
      </form>

      {modelUrl && (
        <>
          <h3>Vorschau</h3>
          <ThreePreview modelUrl={modelUrl} />
          <p>
            <a href={modelUrl} target="_blank" rel="noopener noreferrer">Modell im neuen Tab öffnen</a>
          </p>
        </>
      )}
    </div>
  );
}
