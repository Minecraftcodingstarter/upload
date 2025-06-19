import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function ThreePreview({ modelUrl }) {
  const containerRef = useRef();

  useEffect(() => {
    if (!modelUrl) return;

    // Szene, Kamera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0); // transparent

    // Container vorbereiten
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Licht
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(light);

    // Modell laden
    const ext = modelUrl.split('.').pop().toLowerCase();
    let loader;

    if (ext === 'obj') loader = new OBJLoader();
    else if (ext === 'fbx') loader = new FBXLoader();
    else if (ext === 'glb' || ext === 'gltf') loader = new GLTFLoader();
    else {
      console.error('Unsupported file format:', ext);
      return;
    }

    loader.load(
      modelUrl,
      (loaded) => {
        let model = loaded;
        if (loaded.scene) model = loaded.scene; // GLTF

        // Objekt zentrieren
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        scene.add(model);

        // Kamera so setzen, dass alles sichtbar ist
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const cameraZ = (maxDim / 2) / Math.tan(fov / 2) * 1.5;

        camera.position.set(0, 0, cameraZ);
        camera.near = cameraZ / 100;
        camera.far = cameraZ * 100;
        camera.updateProjectionMatrix();

        controls.target.set(0, 0, 0);
        controls.update();

        // Render-Schleife
        const animate = () => {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();
      },
      undefined,
      (error) => {
        console.error('Fehler beim Laden:', error);
      }
    );

    // Aufräumen
    return () => {
      renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [modelUrl]);

  return (
    <div
      ref={containerRef}
      style={{
        width: 400,
        height: 400,
        border: '1px solid #ccc',
        marginTop: 20,
      }}
    />
  );
}
