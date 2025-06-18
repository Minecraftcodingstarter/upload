import React, { useState } from 'react';
import axios from 'axios';
import ThreePreview from './ThreePreview';

function App() {
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !file) {
      alert('Bitte Benutzername und Datei angeben.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('file', file);

    try {
      const res = await axios.post(`${backendUrl}/upload`, formData);
      setFileURL(res.data.url);
    } catch (err) {
      alert('Fehler beim Hochladen: ' + err.message);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>3D-Objekt hochladen & anzeigen</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Benutzername:</label><br />
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>3D-Datei auswählen (.glb, .gltf, .obj, .fbx):</label><br />
          <input
            type="file"
            accept=".glb,.gltf,.obj,.fbx"
            onChange={e => setFile(e.target.files[0])}
            required
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>Hochladen</button>
      </form>

      {fileURL && (
        <>
          <div style={{ marginBottom: 20 }}>
            <p>Datei erfolgreich hochgeladen:</p>
            <a href={fileURL} target="_blank" rel="noreferrer">{fileURL}</a>
          </div>
          <div>
            <h3>3D-Vorschau:</h3>
            <ThreePreview modelUrl={fileURL} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
