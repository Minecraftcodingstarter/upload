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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 400);
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 20, 10);
    scene.add(directionalLight);

    let object;

    function frameObject(obj) {
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      obj.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraZ = (maxDim / 2) / Math.tan(fov / 2) * 1.5;

      camera.position.set(0, 0, cameraZ);
      camera.near = cameraZ / 100;
      camera.far = cameraZ * 100;
      camera.updateProjectionMatrix();

      controls.target.set(0, 0, 0);
      controls.update();
    }

    // Loader anhand Dateiendung wählen
    const ext = modelUrl.split('.').pop().toLowerCase();

    if (ext === 'obj') {
      const loader = new OBJLoader();
      loader.load(
        modelUrl,
        (obj3d) => {
          object = obj3d;
          scene.add(object);
          frameObject(object);
          animate();
        },
        undefined,
        (err) => {
          console.error('OBJ Laden Fehler:', err);
        }
      );
    } else if (ext === 'fbx') {
      const loader = new FBXLoader();
      loader.load(
        modelUrl,
        (fbx) => {
          object = fbx;
          scene.add(object);
          frameObject(object);
          animate();
        },
        undefined,
        (err) => {
          console.error('FBX Laden Fehler:', err);
        }
      );
    } else {
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          object = gltf.scene;
          scene.add(object);
          frameObject(object);
          animate();
        },
        undefined,
        (err) => {
          console.error('GLTF Laden Fehler:', err);
        }
      );
    }

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    return () => {
      renderer.dispose();
      containerRef.current.innerHTML = '';
      scene.clear();
    };
  }, [modelUrl]);

  return <div ref={containerRef} className="three-container" />;
}
