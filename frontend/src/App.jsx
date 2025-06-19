import React, { useState } from 'react';
import axios from 'axios';
import ThreePreview from './ThreePreview';

function App() {
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [modelUrl, setModelUrl] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload und direkt Modell anzeigen
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      alert('Bitte Benutzername eingeben.');
      return;
    }

    if (!file) {
      alert('Bitte eine 3D-Datei auswählen.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('file', file);

    try {
      const response = await axios.post(`${backendUrl}/upload`, formData);
      if (response.data && response.data.url) {
        setModelUrl(response.data.url);
      } else {
        alert('Upload erfolgreich, aber keine Datei-URL erhalten.');
      }
    } catch (error) {
      alert('Fehler beim Hochladen: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: 'auto' }}>
      <h1>3D-Objekt Upload und Vorschau</h1>
      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: 10 }}>
          <label>Benutzername:</label><br />
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 8, fontSize: 16 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>3D-Datei auswählen (.glb, .gltf, .obj, .fbx):</label><br />
          <input
            type="file"
            accept=".glb,.gltf,.obj,.fbx"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', fontSize: 16 }}>
          Hochladen & Anzeigen
        </button>
      </form>

      {modelUrl && (
        <div style={{ marginTop: 30 }}>
          <h2>Vorschau</h2>
          <ThreePreview modelUrl={modelUrl} />
          <p>
            <a href={modelUrl} target="_blank" rel="noopener noreferrer">
              Modell in neuem Tab öffnen
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
