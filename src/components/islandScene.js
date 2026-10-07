import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createMeadowLayout, grassPush } from './islandGrass';

// A self-contained scene: all geometry and materials are created locally.
export function createIslandScene(host, { onHover, onAction, onError, reducedMotion = false, initialNight = false }) {
  const scene = new THREE.Scene();
  const geometries = new Set();
  const materials = new Set();
  let renderer, controls, observer, frame = 0, disposed = false;
  let visible = false, reduced = reducedMotion, time = 0, lastTime = 0;
  let night = initialNight, nightMix = initialNight ? 1 : 0, lamps = true, gust = 0, rippleTime = -1;
  const events = [];
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    events.push(() => target.removeEventListener(type, handler, options));
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    events.forEach(remove => remove());
    controls?.dispose();
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    renderer?.dispose();
    renderer?.domElement.remove();
  };

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    const canvas = renderer.domElement;
    canvas.setAttribute('aria-label', 'Floating island with a cabin, trees, and pond. Drag to rotate; click or tap the cabin, trees, or pond to interact.');
    canvas.setAttribute('role', 'img');
    host.appendChild(canvas);

    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 60);
    camera.position.set(7, 5.8, 8);
    // OrbitControls handles drag and pinch; wheel remains normal page scrolling.
    listen(canvas, 'wheel', event => event.stopImmediatePropagation(), { capture: true, passive: true });
    controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0.25, 0);
    controls.enablePan = false;
    controls.enableDamping = false;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.65;
    controls.minDistance = 9.3;
    controls.maxDistance = 15;
    controls.minPolarAngle = 0.55;
    controls.maxPolarAngle = 1.28;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    controls.update(); controls.saveState();

    const material = (color, extra = {}) => {
      const result = new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra });
      materials.add(result); return result;
    };
    const add = (geometry, mat, parent, position = [0, 0, 0], scale) => {
      geometries.add(geometry);
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(...position);
      if (scale) mesh.scale.set(...scale);
      mesh.castShadow = true; mesh.receiveShadow = true;
      parent.add(mesh); return mesh;
    };
    const box = (size, mat, parent, pos) => add(new THREE.BoxGeometry(...size), mat, parent, pos);
    const island = new THREE.Group(); scene.add(island);
    const rock = material('#756f85');
    const soil = material('#ad896c');
    const grass = material('#94b578');
    const stone = material('#dad4b9');
    const wood = material('#ad734d');
    const trim = material('#f3dcc0');
    const roof = material('#506b7d');
    const foliage = [material('#467b64'), material('#61966c'), material('#7baa75')];
    const trunk = material('#886247');
    const windowMat = material('#ffcd83', { emissive: '#ffb450', emissiveIntensity: 0.8 });

    // Uneven facets give the suspended rock a handmade silhouette.
    const base = new THREE.CylinderGeometry(2.78, 0.75, 1.65, 9, 2);
    const positions = base.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      positions.setXYZ(i, x * (1 + 0.07 * Math.sin(z * 3 + y)), y, z * (1 + 0.06 * Math.sin(x * 2)));
    }
    base.computeVertexNormals();
    add(base, rock, island, [0, -0.88, 0]);
    add(new THREE.CylinderGeometry(2.84, 2.72, 0.2, 32), soil, island, [0, 0, 0]);
    const ground = add(new THREE.CylinderGeometry(2.81, 2.84, 0.17, 32), grass, island, [0, 0.16, 0]);
    add(new THREE.DodecahedronGeometry(0.3, 0), rock, island, [-2.55, -1.3, 0.5]);
    add(new THREE.DodecahedronGeometry(0.19, 0), rock, island, [2.18, -1.85, 0.7]);

    const cabin = new THREE.Group(); cabin.position.set(-0.5, 0.25, -0.55); cabin.userData.action = 'cabin'; island.add(cabin);
    box([1.38, 0.95, 1.12], wood, cabin, [0, 0.49, 0]);
    // Timber gables beneath separate overhanging roof panels.
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-0.88, 0); roofShape.lineTo(0, 0.72); roofShape.lineTo(0.88, 0); roofShape.closePath();
    add(new THREE.ExtrudeGeometry(roofShape, { depth: 1.12, bevelEnabled: false }), wood, cabin, [0, 0.91, -0.56], [0.79, 1, 1]);
    const slope = Math.atan2(0.72, 0.88), roofLength = Math.hypot(0.88, 0.72);
    for (const side of [-1, 1]) {
      const panel = box([roofLength + 0.1, 0.095, 1.48], roof, cabin, [side * 0.44, 1.27, 0]);
      panel.rotation.z = -side * slope;
      for (const z of [-0.75, 0.75]) {
        const fascia = box([roofLength + 0.13, 0.08, 0.075], trim, cabin, [side * 0.44, 1.24, z]);
        fascia.rotation.z = -side * slope;
      }
      for (let row = 1; row < 5; row++) {
        box([0.045, 0.035, 1.46], roof, cabin, [side * row * 0.18, 1.69 - row * 0.147, 0]);
      }
    }
    box([0.12, 0.09, 1.53], roof, cabin, [0, 1.65, 0]);
    const siding = material('#c18c60');
    for (let row = 0; row < 7; row++) {
      const y = 0.15 + row * 0.12;
      for (const z of [-0.568, 0.568]) box([1.29, 0.018, 0.016], siding, cabin, [0, y, z]);
      for (const x of [-0.698, 0.698]) box([0.016, 0.018, 1.1], siding, cabin, [x, y, 0]);
    }
    for (const x of [-0.67, 0.67]) box([0.08, 0.95, 1.16], trim, cabin, [x, 0.48, 0]);
    box([1.45, 0.07, 1.2], trim, cabin, [0, 0.05, 0]);
    box([0.33, 0.65, 0.07], material('#574d48'), cabin, [0.12, 0.35, 0.59]);
    add(new THREE.SphereGeometry(0.035, 8, 6), windowMat, cabin, [0.21, 0.36, 0.64]);
    box([0.37, 0.33, 0.07], windowMat, cabin, [-0.37, 0.59, 0.59]);
    box([0.045, 0.4, 0.09], trim, cabin, [-0.37, 0.59, 0.64]);
    box([0.43, 0.04, 0.09], trim, cabin, [-0.37, 0.59, 0.64]);
    box([0.07, 0.36, 0.42], windowMat, cabin, [0.71, 0.56, 0]);
    box([0.09, 0.4, 0.04], trim, cabin, [0.75, 0.56, 0]);
    box([0.09, 0.04, 0.47], trim, cabin, [0.75, 0.56, 0]);
    // Recessed window frames, shutters and a planted window box.
    for (const x of [-0.59, -0.15]) box([0.045, 0.42, 0.095], trim, cabin, [x, 0.59, 0.635]);
    for (const y of [0.38, 0.8]) box([0.49, 0.045, 0.095], trim, cabin, [-0.37, y, 0.635]);
    for (const z of [-0.25, 0.25]) box([0.095, 0.44, 0.045], trim, cabin, [0.75, 0.56, z]);
    for (const y of [0.34, 0.78]) box([0.095, 0.045, 0.54], trim, cabin, [0.75, y, 0]);
    for (const z of [-0.37, 0.37]) {
      box([0.055, 0.4, 0.16], roof, cabin, [0.735, 0.56, z]);
      for (let i = 0; i < 4; i++) box([0.065, 0.015, 0.14], trim, cabin, [0.745, 0.42 + i * 0.09, z]);
    }
    box([0.22, 0.14, 0.57], wood, cabin, [0.78, 0.26, 0]);
    const blossom = material('#e8a7a2');
    for (let i = 0; i < 4; i++) {
      add(new THREE.IcosahedronGeometry(0.075, 0), foliage[1], cabin, [0.8, 0.35, -0.2 + i * 0.13]);
      add(new THREE.IcosahedronGeometry(0.035, 0), blossom, cabin, [0.82, 0.4, -0.2 + i * 0.13]);
    }
    for (const x of [-0.08, 0.32]) box([0.045, 0.7, 0.09], trim, cabin, [x, 0.36, 0.635]);
    box([0.45, 0.05, 0.1], trim, cabin, [0.12, 0.71, 0.635]);
    for (let i = 0; i < 3; i++) box([0.012, 0.57, 0.015], siding, cabin, [0.01 + i * 0.1, 0.35, 0.635]);
    box([0.7, 0.07, 0.44], roof, cabin, [0.12, 0.88, 0.78]).rotation.x = 0.12;
    for (const x of [-0.19, 0.43]) box([0.045, 0.78, 0.045], wood, cabin, [x, 0.46, 0.92]);
    box([0.82, 0.13, 0.46], wood, cabin, [0.12, 0.075, 0.77]);
    for (let i = 0; i < 6; i++) box([0.012, 0.012, 0.44], siding, cabin, [-0.22 + i * 0.13, 0.145, 0.77]);
    // Small attic vent and masonry courses finish the silhouette.
    add(new THREE.CylinderGeometry(0.115, 0.115, 0.035, 12), trim, cabin, [0, 1.2, 0.58]).rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), roof, cabin, [0, 1.2, 0.605]).rotation.x = Math.PI / 2;
    box([0.3, 0.65, 0.28], stone, cabin, [0.45, 1.31, -0.28]);
    box([0.37, 0.09, 0.35], rock, cabin, [0.45, 1.63, -0.28]);
    for (let i = 0; i < 4; i++) box([0.31, 0.018, 0.29], soil, cabin, [0.45, 1.12 + i * 0.13, -0.28]);
    box([0.73, 0.075, 0.2], stone, cabin, [0.12, 0.035, 1.06]);
    const lamp = new THREE.PointLight('#ffc481', 1, 3.5, 2); lamp.position.set(-0.6, 1.05, 0.35); island.add(lamp);

    const trees = [];
    [[-1.8, -0.6, 0.9], [1.1, -1.2, 1.12], [1.96, -0.25, 0.8], [-1.95, 0.65, 0.64]].forEach(([x, z, scale], index) => {
      const tree = new THREE.Group(); tree.position.set(x, 0.24, z); tree.scale.setScalar(scale); tree.userData.action = 'trees'; island.add(tree); trees.push(tree);
      add(new THREE.CylinderGeometry(0.08, 0.13, 0.9, 7), trunk, tree, [0, 0.45, 0]);
      for (let layer = 0; layer < 3; layer++) add(new THREE.ConeGeometry(0.66 - layer * 0.15, 0.85, 7), foliage[(index + layer) % 3], tree, [0, 0.9 + layer * 0.39, 0]);
    });

    const pond = new THREE.Group(); pond.position.set(0.85, 0.26, 1.0); pond.userData.action = 'pond'; island.add(pond);
    add(new THREE.CylinderGeometry(0.92, 0.94, 0.045, 40), stone, pond, [0, 0, 0], [1, 1, 0.73]);
    const water = material('#54b9bf', { roughness: 0.25, metalness: 0.15, emissive: '#1b5368', emissiveIntensity: 0.15 });
    add(new THREE.CylinderGeometry(0.81, 0.81, 0.05, 40), water, pond, [0, 0.026, 0], [1, 1, 0.73]);
    const lily = material('#548b61');
    for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 16), lily, pond, [-0.36 + i * 0.2, 0.06, 0.3 - i * 0.03]);
    const ripples = [];
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: '#d4ffff', transparent: true, opacity: 0, side: THREE.DoubleSide }); materials.add(mat);
      const ring = add(new THREE.RingGeometry(0.19, 0.205, 48), mat, pond, [0.05, 0.065 + i * 0.001, 0]); ring.rotation.x = -Math.PI / 2; ring.visible = false; ripples.push(ring);
    }
    for (let i = 0; i < 5; i++) {
      const pebble = add(new THREE.CylinderGeometry(0.17, 0.19, 0.07, 7), stone, island, [-0.35 - i * 0.15, 0.28, 0.65 + i * 0.32]); pebble.scale.z = 0.72;
    }
    // A small fence and flowering shrubs make the island feel inhabited.
    for (let i = 0; i < 4; i++) box([0.075, 0.46, 0.075], trim, island, [-0.7 + i * 0.38, 0.45, -2.08]);
    for (const y of [0.38, 0.58]) box([1.22, 0.05, 0.06], trim, island, [-0.13, y, -2.08]);
    const flower = material('#ecb29f');
    for (let i = 0; i < 10; i++) {
      const a = i * 2.4;
      const x = Math.cos(a) * 2.25, z = Math.sin(a) * 2.25;
      add(new THREE.IcosahedronGeometry(0.11, 0), foliage[1], island, [x, 0.31, z], [1.7, 0.85, 1]);
      add(new THREE.IcosahedronGeometry(0.055, 0), flower, island, [x, 0.4, z]);
    }
    // One shared mesh for the meadow, with rooted, curved blades (not individual draw calls).
    const blades = createMeadowLayout().map(blade => ({ ...blade, bendX: 0, bendZ: 0 }));
    const meadowGeometry = new THREE.BufferGeometry();
    const meadowVertices = [], meadowColors = [], meadowIndices = [];
    const bladeLevels = [0, 0, 0.5, 0.5, 0.85, 0.85, 1];
    const bladeWidths = [-0.5, 0.5, -0.34, 0.34, -0.15, 0.15, 0];
    const rootColor = new THREE.Color('#567d43'), tipColor = new THREE.Color('#b2ca77');
    const bladeColor = new THREE.Color();
    blades.forEach((blade, index) => {
      for (let v = 0; v < 7; v++) {
        const width = bladeWidths[v] * blade.width;
        meadowVertices.push(blade.x + Math.cos(blade.angle) * width, 0.245 + bladeLevels[v] * blade.height, blade.z + Math.sin(blade.angle) * width);
        bladeColor.copy(rootColor).lerp(tipColor, bladeLevels[v] * 0.65 + blade.shade * 0.25);
        meadowColors.push(bladeColor.r, bladeColor.g, bladeColor.b);
      }
      for (const v of [0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6]) meadowIndices.push(index * 7 + v);
    });
    meadowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(meadowVertices, 3).setUsage(THREE.DynamicDrawUsage));
    meadowGeometry.setAttribute('color', new THREE.Float32BufferAttribute(meadowColors, 3));
    meadowGeometry.setIndex(meadowIndices); meadowGeometry.computeVertexNormals();
    const meadow = add(meadowGeometry, material('#ffffff', { vertexColors: true, side: THREE.DoubleSide }), island);
    meadow.castShadow = false;
    meadow.frustumCulled = false;
    // Picking uses the terrain underneath, so grass never blocks cabin/pond interactions.
    meadow.raycast = () => {};
    const meadowRest = new Float32Array(meadowVertices);
    let grassPointer = null;

    const clouds = [];
    const cloudMat = material('#f5eee0', { roughness: 1 });
    [[-2.8, 2.8, -1.1, 0.6], [2.3, 2.9, -1.8, 0.48], [1.7, -0.65, 2.5, 0.38]].forEach(([x, y, z, scale]) => {
      const cloud = new THREE.Group(); cloud.position.set(x, y, z); cloud.scale.setScalar(scale); scene.add(cloud); clouds.push({ group: cloud, x });
      [[-0.5, 0, 0, 0.48], [0, 0.16, 0, 0.65], [0.55, 0, 0, 0.45]].forEach(([cx, cy, cz, r]) => {
        const puff = add(new THREE.SphereGeometry(r, 12, 8), cloudMat, cloud, [cx, cy, cz], [1, 0.68, 0.7]); puff.castShadow = false;
      });
    });
    const sky = new THREE.HemisphereLight('#e8f5ff', '#726c87', 2.6); scene.add(sky);
    const sun = new THREE.DirectionalLight('#ffdfb2', 3.5); sun.position.set(-3, 7, 5); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -5; sun.shadow.camera.right = 5; sun.shadow.camera.top = 5; sun.shadow.camera.bottom = -5; sun.shadow.normalBias = 0.035; sun.shadow.bias = -0.0003; sun.shadow.camera.far = 25; scene.add(sun);
    const fill = new THREE.DirectionalLight('#a7c9ff', 1.0); fill.position.set(4, 2, -4); scene.add(fill);
    const starsGeometry = new THREE.BufferGeometry(); geometries.add(starsGeometry);
    const starsPositions = [];
    for (let i = 0; i < 40; i++) { const a = i * 2.399; starsPositions.push(Math.cos(a) * (3.3 + i % 3 * 0.2), 1.6 + (i % 9) * 0.3, Math.sin(a) * 3.6); }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: '#dcecff', size: 0.045, transparent: true, opacity: 0 }); materials.add(starsMat); scene.add(new THREE.Points(starsGeometry, starsMat));

    let hovered = null;
    const actionLabels = { cabin: 'Cabin · toggle lights', trees: 'Trees · send a breeze', pond: 'Pond · make ripples' };
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pick = event => {
      const rect = canvas.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      scene.updateMatrixWorld(); raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(island.children, true)[0];
      grassPointer = hit?.object === ground && hit.point.y > 0.2 ? { x: hit.point.x, z: hit.point.z } : null;
      requestRender();
      let object = hit?.object;
      while (object && !object.userData.action) object = object.parent;
      return object?.userData.action || null;
    };
    const highlight = action => {
      if (hovered === action) return;
      hovered = action;
      wood.emissive.set(action === 'cabin' ? '#3b2218' : '#000000');
      foliage.forEach(mat => mat.emissive.set(action === 'trees' ? '#173b25' : '#000000'));
      water.emissiveIntensity = action === 'pond' ? 0.75 : 0.15;
      canvas.style.cursor = action ? 'pointer' : 'grab';
      onHover(action ? actionLabels[action] : ''); requestRender();
    };
    const act = action => {
      if (action === 'cabin') { lamps = !lamps; onAction(lamps ? 'Cabin lights on. Welcome home.' : 'Cabin lights off. A little quiet.'); }
      if (action === 'trees') { gust = reduced ? 0 : 2.4; foliage.forEach(mat => mat.emissive.set(reduced ? '#173b25' : '#000000')); onAction('A breeze through the pines.'); }
      if (action === 'pond') { rippleTime = reduced ? 0.8 : 0; onAction('Ripples across the pond.'); }
      requestRender();
    };
    let tap = null;
    const pointers = new Set();
    listen(canvas, 'pointerdown', event => {
      pointers.add(event.pointerId);
      if (pointers.size === 1) tap = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
      else if (tap) tap.moved = true;
      highlight(null);
      grassPointer = null;
    });
    listen(canvas, 'pointermove', event => {
      if (tap && Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 6) tap.moved = true;
      if (!pointers.size && event.pointerType !== 'touch') highlight(pick(event));
    });
    listen(canvas, 'pointerup', event => {
      if (tap && tap.id === event.pointerId && !tap.moved && pointers.size === 1) { const action = pick(event); if (action) act(action); }
      pointers.delete(event.pointerId); if (!pointers.size) tap = null;
    });
    listen(canvas, 'pointercancel', event => { pointers.delete(event.pointerId); tap = null; grassPointer = null; requestRender(); });
    listen(canvas, 'pointerleave', () => { grassPointer = null; highlight(null); requestRender(); });
    listen(canvas, 'webglcontextlost', event => { event.preventDefault(); dispose(); onError(); });

    const dayColor = new THREE.Color('#ffdfb2'), moonColor = new THREE.Color('#92b6ff');
    function update(dt) {
      if (!reduced) time += dt;
      const target = night ? 1 : 0;
      nightMix = reduced ? target : THREE.MathUtils.damp(nightMix, target, 5, dt);
      sky.intensity = THREE.MathUtils.lerp(2.6, 0.8, nightMix);
      sun.intensity = THREE.MathUtils.lerp(3.5, 0.9, nightMix);
      sun.color.copy(dayColor).lerp(moonColor, nightMix);
      starsMat.opacity = nightMix * 0.85;
      windowMat.emissiveIntensity = lamps ? 0.7 + nightMix * 2 : 0;
      windowMat.color.set(lamps ? '#ffcd83' : '#344959');
      lamp.intensity = lamps ? 0.7 + nightMix * 2 : 0;
      clouds.forEach(({ group, x }, i) => { group.position.x = x + (reduced ? 0 : Math.sin(time * 0.15 + i) * 0.15); });
      if (!reduced) gust = Math.max(0, gust - dt);
      trees.forEach((tree, i) => { tree.rotation.z = reduced ? 0 : Math.sin(time * 5 + i) * 0.09 * Math.min(gust, 1); });
      const meadowPosition = meadowGeometry.attributes.position;
      blades.forEach((blade, index) => {
        const push = grassPush(blade.x, blade.z, grassPointer);
        const wind = reduced ? 0 : Math.sin(time * 1.8 + blade.x * 2 + blade.z) * (0.018 + Math.min(gust, 1) * 0.055);
        const targetX = push.x + wind, targetZ = push.z + wind * 0.35;
        blade.bendX = reduced ? targetX : THREE.MathUtils.damp(blade.bendX, targetX, 12, dt);
        blade.bendZ = reduced ? targetZ : THREE.MathUtils.damp(blade.bendZ, targetZ, 12, dt);
        for (let v = 0; v < 7; v++) {
          const vertex = index * 7 + v, offset = vertex * 3, curve = bladeLevels[v] ** 2;
          const bend = Math.hypot(blade.bendX, blade.bendZ);
          meadowPosition.setXYZ(vertex, meadowRest[offset] + blade.bendX * curve, meadowRest[offset + 1] - Math.min(blade.height * 0.55, bend * 0.45) * curve, meadowRest[offset + 2] + blade.bendZ * curve);
        }
      });
      meadowPosition.needsUpdate = true;
      if (rippleTime >= 0 && !reduced) rippleTime += dt;
      ripples.forEach((ring, i) => {
        const progress = rippleTime - i * 0.23;
        ring.visible = rippleTime >= 0 && progress > 0 && progress < 1.2;
        if (ring.visible) { ring.scale.setScalar(0.3 + progress * 2.8); ring.material.opacity = (1 - progress / 1.2) * 0.7; }
      });
      if (rippleTime > 1.7) rippleTime = -1;
    }
    function render(timestamp = 0) {
      frame = 0;
      if (disposed || !visible) return;
      const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 1 / 60;
      lastTime = timestamp;
      update(dt); renderer.render(scene, camera);
      if (!reduced) frame = requestAnimationFrame(render);
    }
    function requestRender() { if (!disposed && visible && !frame) frame = requestAnimationFrame(render); }
    controls.addEventListener('change', () => { grassPointer = null; requestRender(); });
    const resize = () => {
      if (disposed) return;
      const width = host.clientWidth, height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height; camera.updateProjectionMatrix(); requestRender();
    };
    observer = new ResizeObserver(resize); observer.observe(host); resize();
    return {
      dispose,
      act,
      setNight(value) { night = value; requestRender(); },
      setReduced(value) { reduced = value; gust = 0; requestRender(); },
      setVisible(value) { visible = value; lastTime = 0; if (!value) { cancelAnimationFrame(frame); frame = 0; } else requestRender(); },
      zoom(direction) {
        const offset = camera.position.clone().sub(controls.target);
        const distance = THREE.MathUtils.clamp(offset.length() * (direction > 0 ? 0.88 : 1.14), controls.minDistance, controls.maxDistance);
        camera.position.copy(controls.target).add(offset.setLength(distance)); controls.update(); requestRender();
      },
      rotate(direction) {
        const offset = camera.position.clone().sub(controls.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), direction * Math.PI / 8);
        camera.position.copy(controls.target).add(offset); controls.update(); requestRender();
      },
      reset() { controls.reset(); highlight(null); requestRender(); },
    };
  } catch (error) { dispose(); throw error; }
}
