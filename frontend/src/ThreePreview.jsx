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
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Licht
    const light1 = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.8);
    light2.position.set(0, 10, 10);
    scene.add(light1, light2);

    // Modell einpassen
    function frameObject(object) {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      object.position.sub(center); // Zentrieren

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const distance = (maxDim / 2) / Math.tan(fov / 2) * 1.5;

      camera.position.set(0, 0, distance);
      camera.near = distance / 100;
      camera.far = distance * 100;
      camera.updateProjectionMatrix();

      controls.target.set(0, 0, 0);
      controls.update();
    }

    // Modell laden
    const ext = modelUrl.split('.').pop().toLowerCase();

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
        (error) => console.error('Fehler beim Laden von .obj:', error)
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
        (error) => console.error('Fehler beim Laden von .fbx:', error)
      );
    } else if (ext === 'gltf' || ext === 'glb') {
      loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          scene.add(gltf.scene);
          frameObject(gltf.scene);
          animate();
        },
        undefined,
        (error) => console.error('Fehler beim Laden von .gltf/.glb:', error)
      );
    } else {
      console.warn('Nicht unterstützter Dateityp:', ext);
    }

    // Animationsschleife
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    // Aufräumen
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
