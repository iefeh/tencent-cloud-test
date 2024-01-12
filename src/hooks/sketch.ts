import { Scene, WebGLRenderer, PerspectiveCamera, Texture, ShaderMaterial, Mesh, PlaneGeometry, IUniform } from 'three';
import * as THREE from 'three';
import { TimelineMax, Power2 } from 'gsap';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

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

  constructor(
    private container: HTMLElement,
    private images: string[],
    opts: {
      fragment?: string;
      uniforms: { [uniform: string]: IUniform };
      duration?: number;
      easing?: keyof typeof Power2;
    },
  ) {
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

    this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 1000);

    this.camera.position.set(0, 0, 2);
    this.time = 0;
    this.current = 0;
    this.textures = [];

    this.initiate(() => {
      console.log(this.textures);
      this.setupResize();
      this.initSettings();
      this.addObjects();
      this.resize();
      this.play();
    });
  }

  initiate(cb: () => void) {
    const promises: Promise<Texture>[] = [];
    let that = this;
    this.images.forEach((url, i) => {
      let promise = new Promise<Texture>((resolve) => {
        that.textures[i] = new THREE.TextureLoader().load(url, resolve);
      });
      promises.push(promise);
    });

    Promise.all(promises).then(() => {
      cb();
    });
  }

  initSettings() {
    this.settings = { progress: 0.5 };

    Object.keys(this.uniforms).forEach((item) => {
      this.settings[item] = this.uniforms[item].value;
    });
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
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
    this.imageAspect = this.textures[0].image.height / this.textures[0].image.width;
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
  }

  addObjects() {
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
        texture1: { value: this.textures[0] },
        texture2: { value: this.textures[1] },
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
    if (this.isRunning) return;
    this.isRunning = true;
    let len = this.textures.length;
    let nextTexture = this.textures[(this.current + 1) % len];
    this.material.uniforms.texture2.value = nextTexture;
    let tl = new TimelineMax();
    tl.to(this.material.uniforms.progress, this.duration, {
      value: 1,
      ease: Power2[this.easing],
      onComplete: () => {
        console.log('FINISH');
        this.current = (this.current + 1) % len;
        this.material.uniforms.texture1.value = nextTexture;
        this.material.uniforms.progress.value = 0;
        this.isRunning = false;
      },
    });
  }

  jumpTo(index: number) {
    if (this.isRunning) return;
    this.isRunning = true;
    let nextTexture = this.textures[index];
    this.material.uniforms.texture2.value = nextTexture;
    let tl = new TimelineMax();
    tl.to(this.material.uniforms.progress, this.duration, {
      value: 1,
      ease: Power2[this.easing],
      onComplete: () => {
        console.log('FINISH');
        this.current = index;
        this.material.uniforms.texture1.value = nextTexture;
        this.material.uniforms.progress.value = 0;
        this.isRunning = false;
      },
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

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

export default function useSketch<T>(images: string[]) {
  const nodeRef = useRef<T & HTMLElement>(null);
  const sketch = useRef<Sketch>();

  function initSketch() {
    if (!nodeRef.current) return;

    sketch.current = new Sketch(nodeRef.current, images, {
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

  useLayoutEffect(() => {
    if (sketch.current || !nodeRef.current) return;

    try {
      initSketch();
    } catch (error) {
      console.log(error);
    }
  }, []);

  return { nodeRef, sketch };
}
