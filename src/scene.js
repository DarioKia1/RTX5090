import * as THREE from 'https://esm.sh/three@0.170.0';

const green = 0x76b900;

function makeRenderer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);
  return renderer;
}

function box(parent, size, position, material, bevel = 0) {
  const geometry = new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (bevel) {
    const edges = new THREE.EdgesGeometry(geometry);
    mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: bevel, transparent: true, opacity: 0.32 })));
  }
  parent.add(mesh);
  return mesh;
}

function makeFan(parent, x, y, z, color, scale = 1) {
  const fan = new THREE.Group();
  fan.position.set(x, y, z);
  fan.scale.setScalar(scale);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.31, 0.025, 8, 48),
    new THREE.MeshStandardMaterial({ color: 0x53605a, metalness: 0.7, roughness: 0.3 })
  );
  fan.add(ring);
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 0.04, 24),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.08, metalness: 0.45, roughness: 0.38 })
  );
  hub.rotation.x = Math.PI / 2;
  fan.add(hub);
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(-0.02, 0.08);
  bladeShape.bezierCurveTo(0.03, 0.1, 0.13, 0.12, 0.21, 0.27);
  bladeShape.bezierCurveTo(0.17, 0.32, 0.08, 0.3, 0.02, 0.24);
  bladeShape.bezierCurveTo(-0.03, 0.2, -0.05, 0.13, -0.02, 0.08);
  const bladeGeometry = new THREE.ShapeGeometry(bladeShape, 12);
  for (let i = 0; i < 7; i += 1) {
    const blade = new THREE.Mesh(
      bladeGeometry,
      new THREE.MeshStandardMaterial({ color: 0x29302c, metalness: 0.42, roughness: 0.48, side: THREE.DoubleSide })
    );
    blade.position.z = 0.018;
    blade.rotation.z = (Math.PI * 2 * i) / 7;
    fan.add(blade);
  }
  parent.add(fan);
  return fan;
}

function cableCurveTube(curve) {
  return new THREE.TubeGeometry(curve, 24, 0.025, 8, false);
}

function setupScene(container) {
  const renderer = makeRenderer(container);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xc9f0d1, 0x111513, 2.8));
  const key = new THREE.DirectionalLight(0xffffff, 4.7);
  key.position.set(4, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const rim = new THREE.PointLight(green, 9, 12);
  rim.position.set(-3, 0.5, 2.5);
  scene.add(rim);
  const fill = new THREE.PointLight(0xdde8df, 3, 9);
  fill.position.set(3, -1.5, 4);
  scene.add(fill);
  const camera = new THREE.PerspectiveCamera(36, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(4.5, 3.3, 6.4);
  camera.lookAt(0, 0, 0);
  return { renderer, scene, camera };
}

export class PcScene {
  constructor(container) {
    this.container = container;
    const { renderer, scene, camera } = setupScene(container);
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.animationFrames = new Set();
    this.sequenceTimers = [];
    this.camera.position.set(4.5, 3.3, 6.4);
    this.camera.lookAt(0, 0, 0);
    this.group = new THREE.Group();
    scene.add(this.group);
    this.materials = {
      accent: new THREE.MeshStandardMaterial({ color: green, emissive: green, emissiveIntensity: 0.3, metalness: 0.3, roughness: 0.35 }),
      black: new THREE.MeshStandardMaterial({ color: 0x202521, metalness: 0.58, roughness: 0.34 }),
      frame: new THREE.MeshStandardMaterial({ color: 0x3b443d, metalness: 0.68, roughness: 0.3 }),
      caseFrame: new THREE.MeshStandardMaterial({ color: 0x3b443d, metalness: 0.68, roughness: 0.3 }),
      board: new THREE.MeshStandardMaterial({ color: 0x17211a, metalness: 0.4, roughness: 0.6 }),
      glass: new THREE.MeshStandardMaterial({ color: 0x29352d, transparent: true, opacity: 0.1, metalness: 0.12, roughness: 0.22, side: THREE.DoubleSide })
    };
    this.buildModel();
    this.rotation = { x: -0.07, y: -0.46 };
    this.group.rotation.set(this.rotation.x, this.rotation.y, 0);
    this.drag = null;
    this.zoom = 6.4;
    this.bindControls();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.animate = () => {
      this.frame = requestAnimationFrame(this.animate);
      if (!this.drag) this.group.rotation.y += 0.0012;
      this.renderer.render(this.scene, this.camera);
    };
    this.animate();
  }

  buildModel() {
    const { black, frame, caseFrame, board, glass } = this.materials;
    const caseGroup = new THREE.Group();
    this.group.add(caseGroup);
    this.caseGroup = caseGroup;
    box(caseGroup, [2.28, 3.08, 0.12], [0, 0, -0.72], black, 0x657069);
    box(caseGroup, [0.1, 3.08, 1.35], [-1.09, 0, 0], caseFrame);
    box(caseGroup, [0.1, 3.08, 1.35], [1.09, 0, 0], caseFrame);
    box(caseGroup, [2.28, 0.1, 1.35], [0, 1.49, 0], caseFrame);
    box(caseGroup, [2.28, 0.1, 1.35], [0, -1.49, 0], caseFrame);
    for (const x of [-0.82, 0.82]) box(caseGroup, [0.38, 0.12, 0.42], [x, -1.58, 0.02], black);
    box(caseGroup, [0.42, 0.035, 0.25], [0.68, 1.55, 0.28], black);
    box(caseGroup, [0.055, 0.025, 0.055], [0.55, 1.56, 0.28], this.materials.accent);
    for (let index = 0; index < 2; index += 1) box(caseGroup, [0.035, 0.012, 0.09], [0.73 + index * 0.09, 1.56, 0.28], frame);
    this.glassMesh = box(caseGroup, [1.98, 2.78, 0.018], [0, 0, 0.7], glass);
    box(caseGroup, [0.12, 3.08, 0.1], [1.12, 0, -0.65], caseFrame);
    box(caseGroup, [0.12, 3.08, 0.1], [1.12, 0, 0.65], caseFrame);
    box(caseGroup, [0.12, 0.1, 1.3], [1.12, 1.49, 0], caseFrame);
    box(caseGroup, [0.12, 0.1, 1.3], [1.12, -1.49, 0], caseFrame);
    this.frontGlassMesh = box(caseGroup, [0.018, 2.78, 1.15], [1.2, 0, 0], glass);
    this.boardMesh = box(caseGroup, [1.56, 2.17, 0.09], [-0.12, 0, 0.03], board, 0x314238);
    box(caseGroup, [0.22, 1.14, 0.16], [-0.78, 0.45, 0.16], frame);
    box(caseGroup, [0.79, 0.62, 0.19], [-0.13, 0.44, 0.18], black, 0x718078);
    box(caseGroup, [0.72, 0.08, 0.22], [-0.12, 0.44, 0.35], frame);
    box(caseGroup, [0.74, 0.08, 0.22], [-0.12, 0.24, 0.35], frame);
    this.cpuMaterial = new THREE.MeshStandardMaterial({ color: 0x202521, metalness: 0.75, roughness: 0.3 });
    this.cpuBlock = box(caseGroup, [0.52, 0.36, 0.13], [-0.1, 0.43, 0.3], this.cpuMaterial, 0x69756c);
    box(caseGroup, [0.66, 0.16, 0.12], [-0.68, 0.89, 0.18], frame);
    box(caseGroup, [0.66, 0.16, 0.12], [-0.68, 0.65, 0.18], frame);
    box(caseGroup, [0.12, 1.34, 0.09], [0.48, 0.05, 0.16], frame);
    box(caseGroup, [0.8, 0.045, 0.1], [-0.1, -0.78, 0.17], frame);
    this.gpuGroup = new THREE.Group();
    this.gpuGroup.position.set(-0.1, -0.43, 0.38);
    caseGroup.add(this.gpuGroup);
    this.gpuMaterial = new THREE.MeshStandardMaterial({ color: 0x171a18, metalness: 0.72, roughness: 0.28 });
    this.gpuBody = box(this.gpuGroup, [1.54, 0.32, 0.58], [0, 0, 0], this.gpuMaterial, 0x6a746b);
    box(this.gpuGroup, [1.34, 0.04, 0.5], [0, -0.19, 0], frame);
    box(this.gpuGroup, [1.32, 0.035, 0.5], [0, 0.19, 0], frame);
    box(this.gpuGroup, [0.08, 0.04, 0.46], [-0.74, -0.16, 0], new THREE.MeshStandardMaterial({ color: 0xc19d53, metalness: 0.84, roughness: 0.28 }));
    box(this.gpuGroup, [0.34, 0.025, 0.018], [0, 0.1, 0.302], this.materials.accent);
    this.gpuFans = [-0.49, 0, 0.49].map((x) => makeFan(this.gpuGroup, x, 0, 0.3, green, 0.52));
    box(caseGroup, [0.22, 0.44, 0.12], [-0.9, -0.43, 0.25], frame);
    box(caseGroup, [0.16, 0.04, 0.56], [-0.92, -0.55, 0.38], new THREE.MeshStandardMaterial({ color: 0xc19d53, metalness: 0.8 }));
    this.gpuLength = 1.54;
    this.memoryModules = [];
    this.ramMaterials = [];
    for (let i = 0; i < 4; i += 1) {
      const material = new THREE.MeshStandardMaterial({ color: green, emissive: green, emissiveIntensity: 0.08, metalness: 0.38, roughness: 0.42 });
      const module = box(caseGroup, [0.1, 0.72, 0.09], [0.48 + i * 0.13, 0.43, 0.31], material);
      this.memoryModules.push(module);
      this.ramMaterials.push(material);
    }
    this.storageDrive = box(caseGroup, [0.58, 0.1, 0.06], [0.37, -0.02, 0.24], frame);
    box(caseGroup, [0.28, 0.035, 0.015], [0.38, -0.02, 0.28], black);
    this.fans = [
      makeFan(caseGroup, 0.96, 0.91, 0.12, green, 0.72),
      makeFan(caseGroup, 0.96, 0, 0.12, green, 0.72),
      makeFan(caseGroup, 0.96, -0.91, 0.12, green, 0.72),
      makeFan(caseGroup, -0.55, 0.91, 0.43, green, 0.58),
      makeFan(caseGroup, -0.55, -0.91, 0.43, green, 0.58)
    ];
    this.fans.slice(0, 3).forEach((fan) => { fan.rotation.y = Math.PI / 2; });
    this.coolerFan = makeFan(caseGroup, -0.13, 0.42, 0.63, green, 0.52);
    this.radiator = box(caseGroup, [1.38, 0.13, 0.48], [-0.12, 1.23, 0.22], black, 0x4f5c53);
    this.radiator.userData.component = 'cooler';
    this.psuBody = box(caseGroup, [0.78, 0.28, 0.72], [-0.16, -1.18, 0.06], black, 0x4f5c53);
    makeFan(caseGroup, -0.16, -1.18, 0.43, 0x566357, 0.48);
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.1, -1.1, 0.34),
      new THREE.Vector3(0.3, -0.92, 0.42),
      new THREE.Vector3(0.46, -0.64, 0.46),
      new THREE.Vector3(0.35, -0.52, 0.46)
    ]);
    const cable = new THREE.Mesh(cableCurveTube(cableCurve), new THREE.MeshStandardMaterial({ color: 0x555d55, metalness: 0.15, roughness: 0.7 }));
    caseGroup.add(cable);
    for (let index = 0; index < 6; index += 1) {
      box(caseGroup, [0.012, 0.13, 0.02], [0.78, 0.64 - index * 0.18, 0.12], frame);
    }
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x080a09, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.65;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  playBuildSequence() {
    const sequence = ['case', 'motherboard', 'cpu', 'ram', 'storage', 'cooler', 'fans', 'gpu', 'psu'];
    sequence.forEach((key, index) => {
      const timer = setTimeout(() => this.playComponentEntry(key, 720), index * 560);
      this.sequenceTimers.push(timer);
    });
  }

  createAssemblyPart(key) {
    const part = new THREE.Group();
    const selected = this.currentParts?.[key];
    const metal = new THREE.MeshStandardMaterial({ color: 0x727c73, metalness: 0.72, roughness: 0.34 });
    const targets = {
      motherboard: [-0.12, 0, 0.14], cpu: [-0.13, 0.43, 0.35], ram: [0.67, 0.43, 0.31],
      storage: [0.44, -0.04, 0.25], cooler: [-0.13, 1.23, 0.27], psu: [-0.16, -1.18, 0.06]
    };

    if (key === 'gpu') {
      const gpu = this.gpuGroup.clone(true);
      gpu.position.copy(this.gpuGroup.position);
      return { part: gpu, target: gpu.position.clone(), shared: true };
    }
    if (key === 'case') {
      const shell = selected?.finish === 'white' ? new THREE.MeshStandardMaterial({ color: 0xb9c0ba, metalness: 0.7, roughness: 0.3 }) : this.materials.caseFrame;
      box(part, [2.28, 3.08, 0.12], [0, 0, -0.56], this.materials.black, 0x657069);
      box(part, [0.1, 3.08, 1.24], [-1.09, 0, 0], shell);
      box(part, [0.1, 3.08, 1.24], [1.09, 0, 0], shell);
      box(part, [2.28, 0.1, 1.24], [0, 1.49, 0], shell);
      box(part, [2.28, 0.1, 1.24], [0, -1.49, 0], shell);
      box(part, [1.98, 2.78, 0.018], [0, 0, 0.62], this.materials.glass);
      part.scale.setScalar(selected?.size === 'ATX' ? 0.9 : 1);
      return { part, target: new THREE.Vector3(0, 0, 0), shared: false };
    }
    if (key === 'fans') {
      const count = selected?.count ?? 3;
      const positions = count === 2
        ? [[0, 0.5], [0, -0.5]]
        : count === 5
          ? [[-0.42, 0.62], [0.42, 0.62], [-0.42, -0.62], [0.42, -0.62], [0, 0]]
          : [[0, 0.9], [0, 0], [0, -0.9]];
      positions.forEach(([x, y]) => makeFan(part, x, y, 0, green, count === 5 ? 0.5 : 0.62));
      return { part, target: new THREE.Vector3(0.7, 0, 0.43), shared: false };
    }
    if (key === 'cooler') {
      if (selected?.id === 'air') {
        box(part, [0.58, 0.72, 0.3], [0, 0, 0], metal);
        box(part, [0.68, 0.52, 0.12], [0, 0, 0.18], this.materials.black);
        makeFan(part, 0, 0, 0.26, green, 0.48);
      } else {
        const radiatorWidth = selected?.id === 'aio420' ? 1.42 : 1.25;
        box(part, [radiatorWidth, 0.16, 0.46], [0, 0, 0], this.materials.black, 0x657069);
        const fanSize = selected?.id === 'aio420' ? 0.42 : 0.37;
        const count = 3;
        for (let index = 0; index < count; index += 1) makeFan(part, -0.42 + index * 0.42, 0.12, 0.23, green, fanSize);
      }
    } else if (key === 'motherboard') {
      const boardColor = selected?.socket === 'LGA1851' ? 0x252a30 : 0x17211a;
      box(part, [selected?.size === 'E-ATX' ? 1.58 : 1.4, 2.1, 0.08], [0, 0, 0], new THREE.MeshStandardMaterial({ color: boardColor, metalness: 0.4, roughness: 0.6 }), 0x314238);
      box(part, [0.52, 0.48, 0.1], [-0.05, 0.42, 0.09], metal);
      box(part, [0.15, 0.72, 0.1], [0.54, 0.34, 0.08], this.materials.frame);
      for (let index = 0; index < 3; index += 1) box(part, [0.16, 0.08, 0.06], [-0.5, 0.7 - index * 0.25, 0.1], metal);
    } else if (key === 'cpu') {
      const cpuColor = selected?.socket === 'LGA1851' ? 0x999d97 : 0x555d58;
      box(part, [0.48, 0.48, 0.13], [0, 0, 0], new THREE.MeshStandardMaterial({ color: cpuColor, metalness: 0.75, roughness: 0.28 }), 0xc3cbc3);
      box(part, [0.31, 0.31, 0.02], [0, 0, 0.075], this.materials.black);
      box(part, [0.19, 0.018, 0.008], [0, -0.09, 0.09], this.materials.accent);
    } else if (key === 'ram') {
      const count = selected?.modules ?? 2;
      const height = selected?.id === 'ddr5-96' ? 0.82 : selected?.type === 'DDR4' ? 0.62 : 0.72;
      const ramColor = selected?.type === 'DDR4' ? 0x87938b : green;
      for (let index = 0; index < count; index += 1) {
        box(part, [0.1, height, 0.09], [-0.1 + index * 0.2, 0, 0], new THREE.MeshStandardMaterial({ color: ramColor, emissive: ramColor, emissiveIntensity: 0.2, metalness: 0.3, roughness: 0.35 }));
        box(part, [0.07, 0.025, 0.095], [-0.1 + index * 0.2, -height / 2, 0], metal);
      }
    } else if (key === 'storage') {
      const width = selected?.id === 'nvme-4' ? 0.92 : selected?.id === 'nvme-2g4' ? 0.64 : 0.78;
      box(part, [width, 0.15, 0.06], [0, 0, 0], metal);
      box(part, [width * 0.58, 0.07, 0.01], [0.03, 0, 0.035], this.materials.black);
      box(part, [0.1, 0.025, 0.015], [-width * 0.28, 0, 0.04], this.materials.accent);
    } else if (key === 'psu') {
      const width = selected?.capacity === 1200 ? 0.88 : selected?.capacity === 850 ? 0.65 : 0.76;
      box(part, [width, 0.36, 0.68], [0, 0, 0], this.materials.black, 0x657069);
      makeFan(part, 0, 0, 0.35, 0x68736a, 0.43);
    }
    return { part, target: new THREE.Vector3(...targets[key]), shared: false };
  }

  playComponentEntry(key, duration = 860) {
    const { part, target, shared } = this.createAssemblyPart(key);
    if (!part || !target) return;
    const origin = target.clone().add(new THREE.Vector3(2.8, 1.25, 2.1));
    const endScale = part.scale.clone();
    part.position.copy(origin);
    part.scale.copy(endScale).multiplyScalar(0.82);
    this.group.add(part);
    const start = performance.now();
    let frame;
    const animatePart = (now) => {
      if (frame) this.animationFrames.delete(frame);
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      part.position.lerpVectors(origin, target, eased);
      part.position.y += Math.sin(progress * Math.PI) * 0.35;
      part.rotation.y = (1 - eased) * 0.48;
      part.scale.copy(endScale).multiplyScalar(0.82 + eased * 0.18);
      if (progress < 1) {
        frame = requestAnimationFrame(animatePart);
        this.animationFrames.add(frame);
      } else {
        this.group.remove(part);
        if (!shared) part.traverse((child) => child.geometry?.dispose());
      }
    };
    frame = requestAnimationFrame(animatePart);
    this.animationFrames.add(frame);
  }

  bindControls() {
    const container = this.container;
    this.onDown = (event) => {
      if (event.button !== 0) return;
      this.drag = { x: event.clientX, y: event.clientY };
      container.setPointerCapture(event.pointerId);
    };
    this.onMove = (event) => {
      if (!this.drag) return;
      const dx = event.clientX - this.drag.x;
      const dy = event.clientY - this.drag.y;
      this.rotation.y += dx * 0.008;
      this.rotation.x = Math.max(-0.55, Math.min(0.45, this.rotation.x + dy * 0.006));
      this.group.rotation.set(this.rotation.x, this.rotation.y, 0);
      this.drag = { x: event.clientX, y: event.clientY };
    };
    this.onUp = () => { this.drag = null; };
    this.onWheel = (event) => {
      event.preventDefault();
      this.zoom = Math.max(4.4, Math.min(8.7, this.zoom + event.deltaY * 0.006));
      this.camera.position.setLength(this.zoom);
    };
    container.addEventListener('pointerdown', this.onDown);
    container.addEventListener('pointermove', this.onMove);
    container.addEventListener('pointerup', this.onUp);
    container.addEventListener('pointercancel', this.onUp);
    container.addEventListener('wheel', this.onWheel, { passive: false });
  }

  updateBuild(parts) {
    this.currentParts = parts;
    const gpu = parts.gpu;
    const gpuColor = gpu?.accent ?? green;
    this.materials.accent.color.setHex(gpuColor);
    this.materials.accent.emissive.setHex(gpuColor);
    this.fans.forEach((fan) => {
      fan.children[1].material.color.setHex(gpuColor);
      fan.children[1].material.emissive.setHex(gpuColor);
    });
    const gpuLength = gpu?.tier === '5090-fe' ? 1.68 : gpu?.tier === '5090-aib' ? 1.78 : 1.46;
    const fanCount = gpu?.fanCount ?? 2;
    this.gpuGroup.scale.x = gpuLength / this.gpuLength;
    this.gpuMaterial.color.setHex(gpu?.tier === '5080-fe' ? 0x292c29 : 0x171a18);
    this.gpuFans.forEach((fan, index) => {
      fan.visible = fanCount === 3 || index < 2;
      fan.position.x = fanCount === 3 ? [-0.49, 0, 0.49][index] : [-0.39, 0.39, 0][index];
      fan.scale.setScalar(fanCount === 3 ? 0.52 : gpu?.tier === '5080-fe' ? 0.56 : 0.62);
      fan.children[1].material.color.setHex(gpuColor);
      fan.children[1].material.emissive.setHex(gpuColor);
    });
    const ramCount = parts.ram?.modules ?? 4;
    const ramHeight = parts.ram?.id === 'ddr5-96' ? 0.82 : parts.ram?.type === 'DDR4' ? 0.62 : 0.72;
    this.memoryModules.forEach((module, index) => {
      module.visible = index < ramCount;
      module.scale.y = ramHeight / 0.72;
    });
    const ramColor = parts.ram?.type === 'DDR4' ? 0x87938b : gpuColor;
    this.ramMaterials.forEach((material) => {
      material.color.setHex(ramColor);
      material.emissive.setHex(ramColor);
    });
    const caseFanCount = parts.fans?.count ?? 3;
    this.fans.forEach((fan, index) => { fan.visible = index < caseFanCount; });
    this.boardMesh.material.color.setHex(parts.motherboard?.socket === 'LGA1851' ? 0x252a30 : 0x17211a);
    this.boardMesh.scale.x = parts.motherboard?.size === 'E-ATX' ? 1 : 0.92;
    this.cpuMaterial.color.setHex(parts.cpu?.socket === 'LGA1851' ? 0x555d5b : 0x202521);
    this.cpuBlock.scale.setScalar(parts.cpu?.id === '9800x3d' ? 0.92 : 1);
    this.storageDrive.scale.x = parts.storage?.id === 'nvme-4' ? 1.2 : parts.storage?.id === 'nvme-2g4' ? 0.84 : 1;
    this.radiator.visible = parts.cooler?.id !== 'air';
    this.radiator.scale.x = parts.cooler?.id === 'aio420' ? 1.12 : 1;
    this.coolerFan.scale.setScalar(parts.cooler?.id === 'air' ? 0.68 : 0.52);
    this.psuBody.scale.x = parts.psu?.capacity === 1200 ? 1.1 : parts.psu?.capacity === 850 ? 0.86 : 1;
    this.caseGroup.scale.setScalar(parts.case?.size === 'ATX' ? 0.9 : 1);
    if (parts.case?.finish === 'white') this.materials.caseFrame.color.setHex(0xb9c0ba);
    else this.materials.caseFrame.color.setHex(0x3b443d);
  }

  resize() {
    const { clientWidth: width, clientHeight: height } = this.container;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.animationFrames.forEach((frame) => cancelAnimationFrame(frame));
    this.sequenceTimers.forEach((timer) => clearTimeout(timer));
    this.resizeObserver.disconnect();
    this.container.removeEventListener('pointerdown', this.onDown);
    this.container.removeEventListener('pointermove', this.onMove);
    this.container.removeEventListener('pointerup', this.onUp);
    this.container.removeEventListener('pointercancel', this.onUp);
    this.container.removeEventListener('wheel', this.onWheel);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
