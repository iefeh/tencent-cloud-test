import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { RefObject, useEffect } from 'react';
import { TGALoader } from 'three/examples/jsm/Addons';

export class ModelViewer {
  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private model!: THREE.Group<THREE.Object3DEventMap>;
  private renderer!: THREE.WebGLRenderer;
  private controls!: TrackballControls;
  private rafId = 0;
  private renderCallback!: () => void;

  constructor(private container: HTMLElement, private source: string, private texture?: string) {
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
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 500);
    return camera;
  }

  initLight() {
    // 半球光
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    // hemisphereLight.position.set(0, 200, 0);
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

      fbxLoader.load(
        this.source,
        (loadedModel) => {
          if (this.texture) {
            const textureLoader = new TGALoader();
            const textureNormal = textureLoader.load(this.texture);

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
            max: { y },
          } = box.expandByObject(loadedModel);
          loadedModel.position.y = -y / 2;
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
    const controls = new TrackballControls(this.camera, this.renderer.domElement);
    controls.noZoom = true;
    controls.noPan = true;
    controls.rotateSpeed = 24;
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

export default function useModelView(containerRef: RefObject<HTMLDivElement>, source: string, texture?: string) {
  useEffect(() => {
    if (!containerRef.current) return;

    const modelViewer = new ModelViewer(containerRef.current, source, texture);

    modelViewer.init();
    modelViewer.render();

    return () => modelViewer.dispose();
  });
}
