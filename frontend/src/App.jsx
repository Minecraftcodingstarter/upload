import React, { useState } from 'react';
import axios from 'axios';

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
    <div style={{ padding: 20 }}>
      <h1>3D-Objekt und Benutzername hochladen</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Benutzername:</label><br />
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>3D-Datei auswählen:</label><br />
          <input
            type="file"
            accept=".glb,.gltf,.obj,.fbx"
            onChange={e => setFile(e.target.files[0])}
            required
          />
        </div>
        <button type="submit">Hochladen</button>
      </form>
      {fileURL && (
        <div style={{ marginTop: 20 }}>
          <p>Datei erfolgreich hochgeladen:</p>
          <a href={fileURL} target="_blank" rel="noreferrer">Hier klicken</a>
        </div>
      )}
    </div>
  );
}

export default App;
