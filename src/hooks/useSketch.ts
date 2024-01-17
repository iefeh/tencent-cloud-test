import { Scene, WebGLRenderer, PerspectiveCamera, Texture, ShaderMaterial, Mesh, PlaneGeometry, IUniform } from 'three';
import * as THREE from 'three';
import { TimelineMax, Power2 } from 'gsap';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SwiperClass } from 'swiper/react';
import { throttle } from 'lodash';
import useTouchBottom from './useTouchBottom';

export class Sketch {
  private width: number;
  private height: number;
  private scene: Scene;
  private vertex: string;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private textures: Texture[];
  private material!: ShaderMaterial;
  private plane!: Mesh;
  private geometry!: PlaneGeometry;
  private uniforms: { [uniform: string]: IUniform };
  private settings!: { [uniform: string]: any };
  private fragment?: string;

  private duration: number;
  private time: number;
  private current: number;
  private easing: keyof typeof Power2 = 'easeInOut';
  private paused = true;
  public isRunning = false;

  private imageAspect = 1;
  private rafId = 0;

  constructor(
    private container: HTMLElement,
    public images: string[],
    opts: {
      fragment?: string;
      uniforms: { [uniform: string]: IUniform };
      duration?: number;
      easing?: keyof typeof Power2;
    },
  ) {
    this.container.innerHTML = '';
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.scene = new Scene();
    this.vertex = `varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}`;
    this.fragment = opts.fragment;
    this.uniforms = opts.uniforms;
    this.renderer = new WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.duration = opts.duration || 1;
    this.easing = opts.easing || 'easeInOut';

    this.container.appendChild(this.renderer.domElement);

    this.camera = new PerspectiveCamera(70, this.width / this.height, 0.001, 1000);

    this.camera.position.set(0, 0, 2);
    this.time = 0;
    this.current = 0;
    this.textures = [];

    this.initImages();
  }

  async initImages() {
    await this.initiate();
    console.log(this.textures);
    this.setupResize();
    this.initSettings();
    this.addObjects();
    this.resize();
    this.play();
  }

  updateImage(index: number, url: string) {
    return new Promise((resolve) => {
      this.images[index] = url;
      this.textures[index] = new THREE.TextureLoader().load(url, () => {
        this.addObjects(this.current, index);
        this.resize(null, index);
        resolve(true);
      });
    });
  }

  initiate() {
    const promises = this.images.map((url, i) => {
      return new Promise((resolve) => {
        this.textures[i] = new THREE.TextureLoader().load(url, resolve);
      });
    });

    return Promise.all(promises);
  }

  initSettings() {
    this.settings = { progress: 0.5 };

    Object.keys(this.uniforms).forEach((item) => {
      this.settings[item] = this.uniforms[item].value;
    });
  }

  setupResize() {
    window.addEventListener('resize', this.resize);
  }

  resize = (e?: Event | null, index = 0) => {
    const { clientWidth } = document.documentElement;
    this.width = this.container.offsetWidth;
    if (clientWidth <= 768) {
      this.width *= 2;
      this.camera.position.set(0.5, 0, 2);
    }
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // image cover
    const img = this.textures[index].image;
    this.imageAspect = img.height / img.width;
    let a1;
    let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

    const dist = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));

    this.plane.scale.x = this.camera.aspect;
    this.plane.scale.y = 1;

    this.camera.updateProjectionMatrix();
  };

  addObjects(prev = 0, next = 1) {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        progress: { value: 0 },
        border: { value: 0 },
        intensity: { value: 0 },
        scaleX: { value: 40 },
        scaleY: { value: 40 },
        transition: { value: 40 },
        swipe: { value: 0 },
        width: { value: 0 },
        radius: { value: 0 },
        texture1: { value: this.textures[prev] },
        texture2: { value: this.textures[next] },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      vertexShader: this.vertex,
      fragmentShader: this.fragment,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 2, 2);
    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  stop() {
    this.paused = true;
  }

  play() {
    this.paused = false;
    this.render();
  }

  next() {
    return this.jumpTo((this.current + 1) % this.textures.length);
  }

  jumpTo(index: number) {
    if (this.isRunning) return;
    this.isRunning = true;
    let nextTexture = this.textures[index];
    this.material.uniforms.texture2.value = nextTexture;
    let tl = new TimelineMax();
    return new Promise((resolve) => {
      tl.to(this.material.uniforms.progress, this.duration, {
        value: 1,
        ease: Power2[this.easing],
        onComplete: () => {
          console.log('FINISH');
          this.current = index;
          this.material.uniforms.texture1.value = nextTexture;
          this.material.uniforms.progress.value = 0;
          this.isRunning = false;
          resolve(true);
        },
      });
    });
  }

  render() {
    if (this.paused) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    // this.material.uniforms.progress.value = this.settings.progress;

    Object.keys(this.uniforms).forEach((item) => {
      this.material.uniforms[item].value = this.settings[item];
    });

    // this.camera.position.z = 3;
    // this.plane.rotation.y = 0.4*Math.sin(this.time)
    // this.plane.rotation.x = 0.5*Math.sin(0.4*this.time)

    this.rafId = requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  destory() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    this.scene.remove();
    this.renderer.dispose();
  }
}

export default function useSketch<T>(
  images: string[],
  onBeforeSketch?: (prevIndex: number, nextIndex: number) => void,
  onAfterSketch?: (prevIndex: number, nextIndex: number) => void,
) {
  const nodeRef = useRef<T & HTMLElement>(null);
  const sketch = useRef<Sketch>();
  const swiperRef = useRef<SwiperClass>();
  const [activeIndex, setActiveIndex] = useState(0);
  const { isTouchedBottom } = useTouchBottom();
  const [isAniRunning, setIsAniRunning] = useState(false);

  function updateImages(images: string[]) {
    initSketch(images);
  }

  function initSketch(data = images) {
    if (!nodeRef.current) return;
    if (sketch.current) {
      sketch.current.destory();
    }

    sketch.current = new Sketch(nodeRef.current, data, {
      uniforms: {
        intensity: { value: 0.3 },
      },
      fragment: `
          uniform float time;
          uniform float progress;
          uniform float width;
          uniform float scaleX;
          uniform float scaleY;
          uniform float transition;
          uniform float radius;
          uniform float intensity;
          uniform sampler2D texture1;
          uniform sampler2D texture2;
          uniform sampler2D displacement;
          uniform vec4 resolution;
          varying vec2 vUv;

          void main()	{
            vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);

              vec4 d1 = texture2D(texture1, newUV);
              vec4 d2 = texture2D(texture2, newUV);

              float displace1 = (d1.r + d1.g + d1.b)*0.33;
              float displace2 = (d2.r + d2.g + d2.b)*0.33;
              
              vec4 t1 = texture2D(texture1, vec2(newUV.x + progress * (displace2 * intensity), newUV.y));
              vec4 t2 = texture2D(texture2, vec2(newUV.x + (1.0 - progress) * (displace1 * intensity), newUV.y));

              gl_FragColor = mix(t1, t2, progress);

          }

        `,
    });
  }

  function onSwiperInit(swiper: SwiperClass) {
    swiperRef.current = swiper;
  }

  async function switchSketch(index: number) {
    if (onBeforeSketch) {
      await onBeforeSketch(activeIndex, index);
    }
    setIsAniRunning(true);
    if (activeIndex === 0 && isTouchedBottom) {
      document.documentElement.style.overflow = 'hidden';
    }
    if (activeIndex === 1 && index === 0) {
      setTimeout(() => {
        document.documentElement.style.overflow = 'unset';
      }, 1000);
    }
    setActiveIndex(index);
    await sketch.current?.jumpTo(index);
    swiperRef.current?.slideTo(index, 0);
    if (onAfterSketch) {
      await onAfterSketch(activeIndex, index);
    }
    setIsAniRunning(false);
  }

  function onSlideChange(swiper: SwiperClass) {
    const index = swiper.realIndex;
    if (isAniRunning || index === activeIndex || sketch.current?.isRunning) return;
    switchSketch(index);
  }

  useLayoutEffect(() => {
    if (sketch.current || !nodeRef.current) return;

    try {
      initSketch();
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = 'unset';
    };
  }, []);

  return {
    nodeRef,
    sketch,
    isTouchedBottom,
    activeIndex,
    isAniRunning,
    updateImages,
    switchSketch,
    onSwiperInit,
    onSlideChange,
  };
}
