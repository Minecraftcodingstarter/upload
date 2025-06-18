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
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(300, 300);
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // OrbitControls für Maussteuerung
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Licht
    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    scene.add(light);

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
      const cameraZ = (maxDim / 2) / Math.tan(fov / 2) * 1.5; // 1.5 = etwas Abstand

      camera.position.set(0, 0, cameraZ);
      camera.near = cameraZ / 100;
      camera.far = cameraZ * 100;
      camera.updateProjectionMatrix();

      controls.target.set(0, 0, 0);
      controls.update();
    }

    // Dateiendung bestimmen
    const ext = modelUrl.split('.').pop().toLowerCase();

    // Loader auswählen und Modell laden
    let loader;
    if (ext === 'obj') {
      loader = new OBJLoader();
      loader.load(
        modelUrl,
        (obj) => {
          scene.add(obj);
          frameObject(obj);
          animate();
        },
        undefined,
        (error) => {
          console.error('Fehler beim Laden:', error);
        }
      );
    } else if (ext === 'fbx') {
      loader = new FBXLoader();
      loader.load(
        modelUrl,
        (fbx) => {
          scene.add(fbx);
          frameObject(fbx);
          animate();
        },
        undefined,
        (error) => {
          console.error('Fehler beim Laden:', error);
        }
      );
    } else {
      loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          scene.add(gltf.scene);
          frameObject(gltf.scene);
          animate();
        },
        undefined,
        (error) => {
          console.error('Fehler beim Laden:', error);
        }
      );
    }

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

  return <div ref={containerRef} style={{ border: '1px solid #ccc', width: 300, height: 300 }} />;
}