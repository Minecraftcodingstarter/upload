import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import './App.css';

function ModelViewer({ file }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setUrl(blobUrl);
      return () => URL.revokeObjectURL(blobUrl);
    }
  }, [file]);

  if (!url) return null;

  const Model = () => {
    const gltf = useGLTF(url);
    return <primitive object={gltf.scene} />;
  };

  return (
    <Canvas style={{ height: 400, background: '#eee', marginTop: 20 }}>
      <ambientLight />
      <directionalLight position={[0, 0, 5]} />
      <OrbitControls />
      <Model />
    </Canvas>
  );
}

function App() {
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !file) {
      alert('Bitte eBay-Benutzernamen und Datei angeben.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('file', file);

    try {
      setLoading(true);
      await axios.post(`${backendUrl}/upload`, formData);
      setUploadSuccess(true);
      setUsername('');
    } catch (err) {
      alert('Fehler beim Hochladen: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>3D-Upload für eBay-Verkäufer</h1>
      <form onSubmit={handleSubmit} className="upload-form">
        <label>eBay-Benutzername</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="z. B. max123"
          required
        />

        <label>3D-Modell (GLB, FBX, OBJ...)</label>
        <input
          type="file"
          accept=".glb,.gltf"
          onChange={e => setFile(e.target.files[0])}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Wird hochgeladen...' : 'Jetzt hochladen'}
        </button>
      </form>

      {uploadSuccess && file && (
        <div className="viewer">
          <h2>Vorschau des 3D-Modells:</h2>
          <ModelViewer file={file} />
        </div>
      )}
    </div>
  );
}

export default App;
