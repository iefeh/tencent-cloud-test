import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { ExposureShader } from 'three/examples/jsm/shaders/ExposureShader';
import { RefObject, useEffect, useRef, useState } from 'react';
import { OrbitControls, TGALoader } from 'three/examples/jsm/Addons';

export class ModelViewer {
  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private model!: THREE.Group<THREE.Object3DEventMap>;
  private renderer!: THREE.WebGLRenderer;
  private controls!: TrackballControls | OrbitControls;
  private rafId = 0;
  private mixer?: THREE.AnimationMixer;
  private lastEl = 0;
  private composer!: EffectComposer;
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
    const composer = new EffectComposer(this.renderer);
    composer.addPass(new RenderPass(this.scene, this.camera));

    const exposurePass = new ShaderPass(ExposureShader);
    exposurePass.uniforms.exposure.value = this.modelInfo.exposure || 5.6; // 设置曝光度，值越高，亮度越高
    composer.addPass(exposurePass);
    this.composer = composer;
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
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Light) {
        this.scene.remove(obj);
      }
    });

    const amLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(amLight);
  }

  loadModel() {
    return new Promise<THREE.Group<THREE.Object3DEventMap>>((resolve) => {
      const manager = new THREE.LoadingManager();
      manager.addHandler(/\.tga$/i, new TGALoader());
      manager.addHandler(/\.png$/i, new THREE.TextureLoader());
      const { source, texture } = this.modelInfo;

      let loader: FBXLoader | GLTFLoader | null = null;
      const isFBX = source.toLowerCase().endsWith('fbx');
      let isGLTF = false;
      if (isFBX) {
        loader = new FBXLoader(manager);
      } else {
        isGLTF = source.toLowerCase().endsWith('glb');
        if (isGLTF) {
          loader = new GLTFLoader(manager);
        }
      }

      if (!loader) return null;

      loader.load(
        source,
        (res) => {
          let loadedModel: THREE.Group<THREE.Object3DEventMap> | null = null;

          if (isFBX) {
            loadedModel = res as any;
          } else if (isGLTF) {
            loadedModel = (res as GLTF).scene;
          }

          if (!loadedModel) return;

          if (texture) {
            let textureLoader: THREE.TextureLoader;
            if (texture.match(/\.tga$/i)) {
              textureLoader = new TGALoader();
            } else {
              textureLoader = new THREE.TextureLoader();
            }
            const textureNormal = textureLoader.load(texture);

            loadedModel.traverse((v: any) => {
              if (!v.isMesh) return;
              const newMaterial = v.material.clone();
              v.material = newMaterial;
              v.material.map = textureNormal;
              v.material.map = newMaterial.map;
              // v.material.shininess = 80;
              v.material.metalness = 0;
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

          if (this.modelInfo.playAni) {
            this.mixer = new THREE.AnimationMixer(loadedModel);
            loadedModel.animations.forEach((ani) => {
              const action = this.mixer?.clipAction(ani);
              action?.play();
              action?.setLoop(THREE.LoopRepeat, Infinity);
            });
          }

          resolve(loadedModel);
        },
        undefined,
        (err) => {
          console.log('load error:', err);
        },
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
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.toneMappingExposure = 10.0;

    //曝光
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(renderer.domElement);
    return renderer;
  }

  initControls() {
    let controls: TrackballControls | OrbitControls;
    const { isTrackballControlls } = this.modelInfo;
    if (isTrackballControlls) {
      controls = new TrackballControls(this.camera, this.renderer.domElement);
      controls.noPan = true;
      controls.noZoom = true;
    } else {
      controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.enablePan = false;
      controls.enableZoom = false;
      const { orbitAngle } = this.modelInfo;
      const { minPolarAngle, maxPolarAngle, minAzimuthAngle, maxAzimuthAngle } = orbitAngle || {};
      controls.minPolarAngle = minPolarAngle || 0;
      controls.maxPolarAngle = maxPolarAngle || Math.PI;
      controls.minAzimuthAngle = minAzimuthAngle || Infinity;
      controls.maxAzimuthAngle = maxAzimuthAngle || Infinity;
    }

    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 1;

    controls.keys = ['KeyA', 'KeyS', 'KeyD'];
    return controls;
  }

  render(el = performance.now()) {
    if (this.lastEl === 0) {
      this.lastEl = el;
    }

    this.rafId = requestAnimationFrame(this.renderCallback);
    this.controls.update();
    if (this.mixer) {
      this.mixer.update((el - this.lastEl) * (this.modelInfo.deltaRatio || 1 / 1200));
    }
    this.composer.render();
    // this.renderer.render(this.scene, this.camera);
    this.lastEl = el;
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
