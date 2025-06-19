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

    // Szene und Kamera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0); // transparent Hintergrund
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // OrbitControls für Maussteuerung
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Licht
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, -10);
    scene.add(dirLight);

    // Hilfsfunktion: Szene zentrieren und Kamera passend setzen
    function frameObject(object) {
      // BoundingBox berechnen
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Objekt auf Ursprung verschieben
      object.position.sub(center);

      // Abstand berechnen (Faktor kann angepasst werden)
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraZ = (maxDim / 2) / Math.tan(fov / 2) * 1.5; // Abstand zur Kamera

      camera.position.set(0, 0, cameraZ);
      camera.near = cameraZ / 100;
      camera.far = cameraZ * 100;
      camera.updateProjectionMatrix();

      controls.target.set(0, 0, 0);
      controls.update();
    }

    // Loader auswählen je nach Dateiendung
    const ext = modelUrl.split('.').pop().toLowerCase();

    let loader;
    if (ext === 'obj') {
      loader = new OBJLoader();
    } else if (ext === 'fbx') {
      loader = new FBXLoader();
    } else if (ext === 'glb' || ext === 'gltf') {
      loader = new GLTFLoader();
    } else {
      console.error('Unsupported file format:', ext);
      return;
    }

    loader.load(
      modelUrl,
      (model) => {
        if (ext === 'glb' || ext === 'gltf') {
          scene.add(model.scene);
          frameObject(model.scene);
        } else {
          scene.add(model);
          frameObject(model);
        }
        animate();
      },
      undefined,
      (error) => {
        console.error('Fehler beim Laden des Modells:', error);
      }
    );

    // Animationsschleife
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    // Aufräumen bei Komponenten-Unmount
    return () => {
      renderer.dispose();
      containerRef.current.innerHTML = '';
    };
  }, [modelUrl]);

  return (
    <div
      ref={containerRef}
      style={{ border: '1px solid #ccc', width: 300, height: 300 }}
    />
  );
}
