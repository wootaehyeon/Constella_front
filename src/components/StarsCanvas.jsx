import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';


// ⭐ 별들 구성
const Stars = () => {
  const starsRef = useRef();
  const starGeo = useRef(new THREE.BufferGeometry()).current;
  const starCount = 5000;

  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) {
    positions[i] = THREE.MathUtils.randFloatSpread(1000); // -500 ~ 500
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.8,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0003;
      starsRef.current.rotation.x += 0.0001;
    }
  });

  return <points ref={starsRef} geometry={starGeo} material={material} />;
};


// 🌠 유성 1개 (선 형태로 움직임)
const Meteor = ({ startTime }) => {
  const ref = useRef();
  const [visible, setVisible] = useState(true);

  const start = new THREE.Vector3(
    -300 + Math.random() * 600, // x: -300 ~ 300
    200 + Math.random() * 100,  // y: 200 ~ 300
    -100
  );
  const end = start.clone().add(new THREE.Vector3(80, -120, 0)); // 궤적

  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime() - startTime;
    if (elapsed > 1.2) {
      setVisible(false);
      return;
    }
    if (ref.current) {
      ref.current.position.x += 3;
      ref.current.position.y -= 5;
      material.opacity = 1 - elapsed / 1.2;
    }
  });

  if (!visible) return null;

  return <line ref={ref} geometry={geometry} material={material} />;
};


// 🌠 유성 여러 개 관리
const Meteors = () => {
  const [meteors, setMeteors] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMeteors((prev) => [...prev, { id: Date.now(), time: performance.now() / 1000 }]);
    }, 2000); // 4초 간격 생성

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {meteors.map((m) => (
        <Meteor key={m.id} startTime={m.time} />
      ))}
    </>
  );
};


// 🎬 전체 캔버스 구성
const StarsCanvas = () => {
  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
      }}
      camera={{ position: [0, 0, 1] }}
    >
      <color attach="background" args={['black']} />
      <Stars />
      <Meteors />
    </Canvas>
  );
};

export default StarsCanvas;
