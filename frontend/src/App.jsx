import React, { useState } from 'react';
import axios from 'axios';
import ThreePreview from './ThreePreview';

export default function App() {
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !file) return alert('Benutzername und Datei sind erforderlich.');

    const formData = new FormData();
    formData.append('username', username);
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:3001/upload', formData);
      setFileURL(res.data.url);
    } catch (err) {
      alert('Fehler beim Hochladen: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>3D Upload & Vorschau</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Benutzername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
        />
        <input
          type="file"
          accept=".glb,.gltf,.obj,.fbx"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem', width: '100%' }}>
          Hochladen
        </button>
      </form>

      {fileURL && (
        <div>
          <p>Datei erfolgreich hochgeladen! Vorschau:</p>
          <ThreePreview modelUrl={fileURL} />
        </div>
      )}
    </div>
  );
}