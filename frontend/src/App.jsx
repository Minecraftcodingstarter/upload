import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ThreePreview from './ThreePreview';

function App() {
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [modelUrl, setModelUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!file || !username) return;

    const uploadFile = async () => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('file', file);

        console.log('Starte Upload:', file.name);

        const res = await axios.post(`${backendUrl}/upload`, formData);
        console.log('Upload erfolgreich:', res.data);

        if (res.data.url) {
          setModelUrl(res.data.url);
        } else {
          alert('Upload erfolgreich, aber keine URL erhalten.');
          setModelUrl('');
        }
      } catch (error) {
        alert('Fehler beim Upload: ' + error.message);
        console.error(error);
        setModelUrl('');
      } finally {
        setUploading(false);
      }
    };

    uploadFile();
  }, [file, username, backendUrl]);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>3D-Objekt Upload & Vorschau</h1>

      <div style={{ marginBottom: 15 }}>
        <label>
          Benutzername:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            required
            style={{ marginLeft: 10 }}
            placeholder="Dein Benutzername"
          />
        </label>
      </div>

      <div style={{ marginBottom: 15 }}>
        <label>
          3D-Datei auswählen (.glb, .gltf, .obj, .fbx):
          <input
            type="file"
            accept=".glb,.gltf,.obj,.fbx"
            onChange={(e) => setFile(e.target.files[0])}
            required
            style={{ marginLeft: 10 }}
          />
        </label>
      </div>

      {uploading && <p>Upload läuft ... bitte warten.</p>}

      {!uploading && modelUrl && (
        <>
          <p>Datei erfolgreich hochgeladen und geladen:</p>
          <a href={modelUrl} target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: 20 }}>
            {modelUrl}
          </a>

          <ThreePreview modelUrl={modelUrl} />
        </>
      )}
    </div>
  );
}

export default App;
