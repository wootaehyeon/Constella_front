import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { useNavigate } from 'react-router-dom';

const GlobeViewer = () => {
  const globeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const container = globeRef.current;
    if (!container) return;

    // 국가별 핀 표시 SVG
    const markerSvg = `<svg viewBox="-4 0 36 36">
      <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
      <circle fill="black" cx="14" cy="14" r="7"></circle>
    </svg>`;

    // 임시 데이터: 사용자 등록된 국가만 핀 표시
    const gData = [
      { lat: 37.5665, lng: 126.9780, size: 20, color: 'red', id: 'KOR' },
      { lat: 48.8566, lng: 2.3522, size: 20, color: 'blue', id: 'FRA' },
      { lat: 34.0522, lng: -118.2437, size: 20, color: 'green', id: 'USA' },
    ];

    // Globe 객체 생성
    const globe = new ThreeGlobe()
      .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')


      .htmlElementsData(gData)
      .htmlElement(d => {
        const el = document.createElement('div');
        el.innerHTML = markerSvg;
        el.style.color = d.color;
        el.style.width = `${d.size}px`;
        el.style.cursor = 'pointer';
        el.onclick = () => navigate(`/entries?country=${d.id}`); // 핀 클릭 시 해당 국가 카드 리스트로 이동
        return el;
      })
      .htmlElementVisibilityModifier((el, isVisible) => {
        el.style.opacity = isVisible ? 1 : 0;
      });

    // Three.js 기본 설정
    const scene = new THREE.Scene();
    scene.add(globe);
    scene.add(new THREE.AmbientLight(0xcccccc, Math.PI));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.6 * Math.PI));

    const camera = new THREE.PerspectiveCamera();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.position.z = 500;

    const webglRenderer = new THREE.WebGLRenderer();
    const labelRenderer = new CSS2DRenderer();

    [webglRenderer, labelRenderer].forEach((renderer, idx) => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (idx > 0) {
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0px';
        renderer.domElement.style.pointerEvents = 'none';
      }
      container.appendChild(renderer.domElement);
    });

    // 마우스 조작을 위한 컨트롤 설정
    const controls = new TrackballControls(camera, webglRenderer.domElement);
    controls.minDistance = 101;
    controls.rotateSpeed = 5;
    controls.zoomSpeed = 0.8;

    globe.setPointOfView(camera);
    controls.addEventListener('change', () => globe.setPointOfView(camera));

    // 애니메이션 루프
    const animate = () => {
      controls.update();
      webglRenderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // 창 크기 조절 대응
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      webglRenderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [navigate]);

  return (
    <div ref={globeRef} style={{ width: '100vw', height: '100vh', position: 'relative' }} />
  );
};

export default GlobeViewer;
