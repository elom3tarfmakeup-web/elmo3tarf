import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// روج ثلاثي الأبعاد يطفو في الهيرو — لو الملف مش موجود بيشتغل بديل برمجي
export default function Hero3D() {
  const mount = useRef(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let renderer, scene, camera, model = null, group, raf;
    let disposed = false;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 100);
      camera.position.set(0, 0.6, 5);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(el.clientWidth, el.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 1.6));
      const dir = new THREE.DirectionalLight(0xffd9e4, 2.2);
      dir.position.set(3, 5, 4);
      scene.add(dir);
      const rim = new THREE.DirectionalLight(0xffffff, 1.2);
      rim.position.set(-3, 1, -3);
      scene.add(rim);

      group = new THREE.Group();

      const fallback = () => {
        // بديل برمجي: أنبوبة روج بسيطة
        const mat = new THREE.MeshStandardMaterial({ color: 0x1A1216, roughness: 0.35, metalness: 0.6 });
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 1.6, 48), mat);
        body.position.y = -0.1;
        const gold = new THREE.MeshStandardMaterial({ color: 0xE0A96D, roughness: 0.25, metalness: 0.9 });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.06, 24, 64), gold);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.75;
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.9, 48), mat);
        cap.position.y = 1.35;
        const bullet = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.55, 40), new THREE.MeshStandardMaterial({ color: 0xE84393, roughness: 0.5 }));
        bullet.position.y = 0.95;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.45, 40), new THREE.MeshStandardMaterial({ color: 0xB10C69, roughness: 0.4 }));
        tip.position.y = 1.42;
        group.add(body, ring, cap, bullet, tip);
      };

      const loader = new GLTFLoader();
      loader.load(
        'assets/lipstick.glb',
        (gltf) => {
          if (disposed) return;
          model = gltf.scene;
          model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          group.add(model);
        },
        undefined,
        () => { if (!disposed) fallback(); }
      );
      // مهلة: لو الـ GLB واخد وقت — ارسم البديل فوراً
      setTimeout(() => { if (!disposed && group.children.length === 0) fallback(); }, 3000);

      scene.add(group);

      const onResize = () => {
        if (!el) return;
        const w = el.clientWidth, h = el.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      const clock = new THREE.Clock();
      const animate = () => {
        if (disposed) return;
        raf = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        group.rotation.y = Math.sin(t * 0.35) * 0.4 + t * 0.2;
        group.position.y = Math.sin(t * 0.8) * 0.12;
        group.rotation.x = Math.sin(t * 0.5) * 0.06;
        renderer.render(scene, camera);
      };
      animate();
    } catch (e) {
      console.warn('3D hero failed', e);
    }

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', () => {});
      if (renderer) { renderer.dispose(); if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); }
    };
  }, []);

  return <div className="hero-3d" ref={mount} />;
}
