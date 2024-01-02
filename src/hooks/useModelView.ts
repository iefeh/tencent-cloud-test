import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { RefObject, useEffect, useRef, useState } from 'react';
import { OrbitControls, TGALoader } from 'three/examples/jsm/Addons';

export class ModelViewer {
  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private model!: THREE.Group<THREE.Object3DEventMap>;
  private renderer!: THREE.WebGLRenderer;
  private controls!: TrackballControls | OrbitControls;
  private rafId = 0;
  private renderCallback!: () => void;

  constructor(private container: HTMLElement, private modelInfo: ModelInfo) {
    this.renderCallback = this.render.bind(this);
  }

  init() {
    this.scene = this.initScene();
    this.camera = this.initCamera();
    this.initLight();
    this.loadModel();
    this.renderer = this.initRenderer();
    this.controls = this.initControls();
  }

  initScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 600, 3000); //雾化场景
    return scene;
  }

  initCamera() {
    const { clientWidth, clientHeight } = this.container;
    const camera = new THREE.PerspectiveCamera(45, clientWidth / clientHeight, 1, 1000);
    camera.position.set(0, 0, 500);
    return camera;
  }

  initLight() {
    // 半球光
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemisphereLight.position.set(0, 200, 0);
    this.scene.add(hemisphereLight);

    // 点光源
    const light = new THREE.PointLight(0xffff00, 2, 100);
    light.position.set(0, 0, 0);
    this.scene.add(light);
  }

  loadModel() {
    return new Promise<THREE.Group<THREE.Object3DEventMap>>((resolve, reject) => {
      const manager = new THREE.LoadingManager();
      manager.addHandler(/\.tga$/i, new TGALoader());
      const fbxLoader = new FBXLoader(manager);
      const { source, texture } = this.modelInfo;

      fbxLoader.load(
        source,
        (loadedModel) => {
          if (texture) {
            const textureLoader = new TGALoader();
            const textureNormal = textureLoader.load(texture);

            loadedModel.traverse((v: any) => {
              if (!v.isMesh) return;
              const newMaterial = v.material.clone();
              v.material = newMaterial;
              v.material.map = textureNormal;
              v.material.shininess = 80;
            });
          }

          const box = new THREE.Box3();
          const {
            max: { x, y, z },
          } = box.expandByObject(loadedModel);
          const { rotate, offsetPower, zoom = 1 } = this.modelInfo;
          const { x: opx = 0, y: opy = 0, z: opz = 0 } = offsetPower || {};
          loadedModel.position.x = x * opx;
          loadedModel.position.y = y * opy;
          loadedModel.position.z = z * opz;

          const { x: rx = 0, y: ry = 0, z: rz = 0 } = rotate || {};
          loadedModel.rotateX(rx);
          loadedModel.rotateY(ry);
          loadedModel.rotateX(rz);
          loadedModel.scale.set(zoom, zoom, zoom);

          this.scene.add(loadedModel);
          this.model = loadedModel;
          resolve(loadedModel);
        },
        undefined,
        (err) => reject(err),
      );
    });
  }

  initRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); //设置抗锯齿
    //设置屏幕像素比
    renderer.setPixelRatio(window.devicePixelRatio);
    //渲染的尺寸大小
    const { clientHeight, clientWidth } = this.container;
    renderer.setSize(clientWidth, clientHeight);
    //色调映射
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.autoClear = true;
    // this.renderer.outputColorSpace = THREE.sRGBEncoding
    //曝光
    renderer.toneMappingExposure = 3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(renderer.domElement);
    return renderer;
  }

  initControls() {
    let controls;
    const { isTrackballControlls } = this.modelInfo;
    if (isTrackballControlls) {
      controls = new TrackballControls(this.camera, this.renderer.domElement);
      controls.noPan = true;
      controls.noZoom = true;
    } else {
      controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.enableZoom = false;
      controls.maxPolarAngle = Math.PI / 2;
      controls.minAzimuthAngle = -Math.PI * 0.375;
      controls.maxAzimuthAngle = Math.PI * 0.375;
    }

    controls.rotateSpeed = 16;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 1;

    controls.keys = ['KeyA', 'KeyS', 'KeyD'];
    return controls;
  }

  render() {
    this.rafId = requestAnimationFrame(this.renderCallback);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  reset() {
    this.controls.reset();
    this.camera.lookAt(0, 0, 0);
  }

  dispose() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }

    this.scene?.traverse((v) => {
      if (v.type === 'Mesh') {
        (v as any).geometry.dispose();
        (v as any).material.dispose();
      }
    });

    this.container.removeChild(this.renderer.domElement);
    this.scene.clear();
    this.renderer.clear();
    this.renderer.dispose();
    this.camera.clear();
  }
}

export default function useModelView(containerRef: RefObject<HTMLDivElement>, model: ModelInfo) {
  const modelViewer = useRef<ModelViewer>();

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new ModelViewer(containerRef.current, model);

    viewer.init();
    viewer.render();
    modelViewer.current = viewer;

    return () => viewer.dispose();
  });

  return { reset: () => modelViewer.current?.reset() };
}
