/* Upper Belvedere as line geometry. Simplified massing, from the Web Gallery of Art
   description: a raised middle pavilion (Marble Hall) with a curved-gable vestibule,
   two-storey wings, and octagonal domed corner pavilions; 29 bays in seven sections. */
const FL = 1.25; // storey height
const PAV = [
  { id: 'drift',    type: 'oct',    x: -12.25, r: 2.1, h: 2.5, dome: 1.55 },
  { id: 'roadmap',  type: 'box',    x: -8.8,  w: 3,   d: 7, h: 2.9, roof: 1.05 },
  { id: 'issues',   type: 'box',    x: -4.9,  w: 4.8, d: 6, h: 2.5, roof: 0.75 },
  { id: 'overview', type: 'center', x: 0,     w: 5,   d: 9, h: 3.7, roof: 1.45 },
  { id: 'prs',      type: 'box',    x: 4.9,   w: 4.8, d: 6, h: 2.5, roof: 0.75 },
  { id: 'ci',       type: 'box',    x: 8.8,   w: 3,   d: 7, h: 2.9, roof: 1.05 },
  { id: 'health',   type: 'oct',    x: 12.25, r: 2.1, h: 2.5, dome: 1.55 },
];

function Lines() {
  const p = [];
  return {
    p,
    s(a, b) { p.push(a[0], a[1], a[2], b[0], b[1], b[2]); },
    poly(pts, close = true) { const n = pts.length; for (let i = 0; i < (close ? n : n - 1); i++) this.s(pts[i], pts[(i + 1) % n]); },
  };
}
function geo(p) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); return g; }
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// A window in facade coordinates (u along the wall, v up), mapped into 3D.
function win(L, map, cu, v0, v1, hw, arch) {
  const pts = [[cu - hw, v0], [cu + hw, v0]];
  if (arch) {
    const yc = v1 - hw;
    pts.push([cu + hw, yc]);
    for (let i = 1; i < 6; i++) { const a = (i / 6) * Math.PI; pts.push([cu + Math.cos(a) * hw, yc + Math.sin(a) * hw]); }
    pts.push([cu - hw, yc]);
  } else pts.push([cu + hw, v1], [cu - hw, v1]);
  L.poly(pts.map(([u, v]) => map(u, v)));
}

function boxWalls(c, low, up, tallUpper) {
  const X = c.w / 2, Z = c.d / 2;
  const rect = (y) => [[-X, y, -Z], [X, y, -Z], [X, y, Z], [-X, y, Z]];
  low.poly(rect(0)); low.poly(rect(FL));
  up.poly(rect(c.h)); up.poly(rect(c.h - 0.2));
  for (const [x, z] of [[-X, -Z], [X, -Z], [X, Z], [-X, Z]]) { low.s([x, 0, z], [x, FL, z]); up.s([x, FL, z], [x, c.h, z]); }
  const n = Math.round(c.w), bw = c.w / n;
  for (const z of [Z, -Z]) {
    const map = (u, v) => [u, v, z];
    for (let i = 0; i < n; i++) {
      const cu = -X + bw * (i + 0.5);
      win(low, map, cu, 0.28, FL - 0.22, 0.2, true);
      if (tallUpper) win(up, map, cu, FL + 0.35, c.h - 0.45, 0.24, true);
      else win(up, map, cu, FL + 0.3, c.h - 0.45, 0.2, false);
    }
  }
}

// Vestibule in front of the middle pavilion: three arched doors, curved segmental gable.
function vestibule(c, low, up) {
  const Z = c.d / 2, D = 1.5, X = 1.7, top = 2.9, peak = 3.55;
  const zf = Z + D;
  low.s([-X, 0, zf], [X, 0, zf]);
  for (const x of [-X, X]) { low.s([x, 0, Z], [x, 0, zf]); low.s([x, 0, zf], [x, FL, zf]); low.s([x, FL, Z], [x, FL, zf]); up.s([x, FL, zf], [x, top, zf]); up.s([x, top, Z], [x, top, zf]); }
  low.s([-X, FL, zf], [X, FL, zf]);
  const map = (u, v) => [u, v, zf];
  for (const cu of [-1.1, 0, 1.1]) win(low, map, cu, 0, FL - 0.12, 0.34, true);
  win(up, map, 0, FL + 0.3, top - 0.25, 0.48, true);
  const sag = peak - top, R = (X * X + sag * sag) / (2 * sag), cy = peak - R, a0 = Math.asin(X / R);
  const arc = (z) => { const pts = []; for (let i = 0; i <= 12; i++) { const a = -a0 + (2 * a0 * i) / 12; pts.push([R * Math.sin(a), cy + R * Math.cos(a), z]); } return pts; };
  const f = arc(zf), b = arc(Z);
  up.poly(f, false); up.poly(b, false);
  for (let i = 0; i <= 12; i += 3) up.s(f[i], b[i]);
}

function octVerts(r, y) { const v = []; for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + (k * Math.PI) / 4; v.push([r * Math.cos(a), y, r * Math.sin(a)]); } return v; }

function octWalls(c, low, up) {
  for (const y of [0, FL]) low.poly(octVerts(c.r, y));
  for (const y of [c.h, c.h - 0.2]) up.poly(octVerts(c.r, y));
  const b = octVerts(c.r, 0);
  for (const [x, , z] of b) { low.s([x, 0, z], [x, FL, z]); up.s([x, FL, z], [x, c.h, z]); }
  for (let k = 0; k < 8; k++) {
    const a = b[k], d = b[(k + 1) % 8];
    const mx = (a[0] + d[0]) / 2, mz = (a[2] + d[2]) / 2, len = Math.hypot(d[0] - a[0], d[2] - a[2]);
    const ux = (d[0] - a[0]) / len, uz = (d[2] - a[2]) / len;
    const map = (u, v) => [mx + ux * u, v, mz + uz * u];
    win(low, map, 0, 0.28, FL - 0.22, 0.22, true);
    win(up, map, 0, FL + 0.3, c.h - 0.45, 0.22, false);
  }
}

function hipRoof(c, L, mansard) {
  const o = 0.15, X = c.w / 2 + o, Z = c.d / 2 + o, y = c.h;
  let base = [[-X, y, -Z], [X, y, -Z], [X, y, Z], [-X, y, Z]];
  L.poly(base);
  if (mansard) {
    const mid = [[-X + 0.55, y + 0.62 * c.roof, -Z + 0.55], [X - 0.55, y + 0.62 * c.roof, -Z + 0.55], [X - 0.55, y + 0.62 * c.roof, Z - 0.55], [-X + 0.55, y + 0.62 * c.roof, Z - 0.55]];
    L.poly(mid);
    for (let i = 0; i < 4; i++) L.s(base[i], mid[i]);
    for (let t = 0.5; t < 2 * X - 0.2; t += 0.5) { L.s([-X + t, y, Z], lerp3(mid[3], mid[2], t / (2 * X))); L.s([-X + t, y, -Z], lerp3(mid[0], mid[1], t / (2 * X))); }
    for (let t = 0.5; t < 2 * Z - 0.2; t += 0.5) { L.s([X, y, -Z + t], lerp3(mid[1], mid[2], t / (2 * Z))); L.s([-X, y, -Z + t], lerp3(mid[0], mid[3], t / (2 * Z))); }
    base = mid;
  }
  const bw = base[1][0] - base[0][0], bd = base[3][2] - base[0][2], top = y + c.roof;
  let e;
  if (bw >= bd) { const rl = (bw - bd) / 2; e = [[-rl, top, 0], [rl, top, 0], [rl, top, 0], [-rl, top, 0]]; }
  else { const rl = (bd - bw) / 2; e = [[0, top, -rl], [0, top, -rl], [0, top, rl], [0, top, rl]]; }
  L.s(e[0], e[2]);
  for (let i = 0; i < 4; i++) L.s(base[i], e[i]);
  for (const t of [0.34, 0.67]) L.poly(base.map((b, i) => lerp3(b, e[i], t)));
}

function dome(c, L) {
  const rings = [];
  for (let i = 0; i <= 6; i++) {
    const t = (i / 6) * 0.86;
    rings.push(octVerts(c.r * 1.04 * Math.cos((t * Math.PI) / 2), c.h + c.dome * Math.sin((t * Math.PI) / 2)));
  }
  rings.forEach((r) => L.poly(r));
  for (let k = 0; k < 8; k++) L.poly(rings.map((r) => r[k]), false);
  const yt = rings[6][0][1], lb = octVerts(0.3, yt), lt = octVerts(0.3, yt + 0.45);
  L.poly(lt);
  for (let k = 0; k < 8; k++) { L.s(lb[k], lt[k]); L.s(lt[k], [0, yt + 0.75, 0]); }
}

function floorGrid(c, L, y) {
  if (c.type === 'oct') {
    const r = c.r * 0.86;
    for (let x = -r + 0.4; x < r; x += 0.4) { const z = Math.sqrt(r * r - x * x); L.s([x, y, -z], [x, y, z]); }
  } else {
    const X = c.w / 2 - 0.15, Z = c.d / 2 - 0.15;
    for (let x = -X + 0.4; x < X; x += 0.4) L.s([x, y, -Z], [x, y, Z]);
  }
}

// Lines are drawn as screen-space quads: WebGL lines are 1 device pixel and alias into dots on phones.
const LINE = { uRes: { value: new THREE.Vector2(1, 1) }, uWidth: { value: 2 } };
function setLineSize(w, h, dpr) { LINE.uRes.value.set(w * dpr, h * dpr); LINE.uWidth.value = 1.6 * dpr; }
const LINE_VS = `attribute vec3 b; attribute vec2 side; uniform vec2 uRes; uniform float uWidth; varying float vEdge; varying float vAW; varying float vW; varying float vLen;
void main() {
  vec4 pa = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 pb = projectionMatrix * modelViewMatrix * vec4(b, 1.0);
  vec2 sa = pa.xy / pa.w * uRes * 0.5, sb = pb.xy / pb.w * uRes * 0.5;
  vec2 d = sb - sa; float len = length(d); d = len > 1e-4 ? normalize(d) : vec2(1.0, 0.0);
  float hw = uWidth * 0.5;
  vec4 p = side.x < 0.5 ? pa : pb;
  vec2 off = vec2(-d.y, d.x) * side.y * (hw + 1.0) + d * (side.x < 0.5 ? -hw : hw);
  p.xy += off / (uRes * 0.5) * p.w;
  vEdge = side.y * (hw + 1.0);
  // Distance along the line in pixels. Multiplied by w here and divided in the fragment shader to undo perspective interpolation.
  vAW = (side.x < 0.5 ? -hw : len + hw) * p.w; vW = p.w; vLen = len;
  gl_Position = p;
}`;
// Each end fades from full to zero across one line width, centred on the endpoint. Where two lines meet,
// their two half-faded ends add up to one line, so additive blending glows where lines stack but leaves no dot at a joint.
const LINE_FS = `uniform vec3 uColor; uniform float uOpacity; uniform float uWidth; varying float vEdge; varying float vAW; varying float vW; varying float vLen;
void main() {
  float hw = uWidth * 0.5, along = vAW / vW;
  float cap = clamp(min(along, vLen - along) / (2.0 * hw) + 0.5, 0.0, 1.0);
  float a = uOpacity * cap * clamp(hw + 0.5 - abs(vEdge), 0.0, 1.0);
  gl_FragColor = vec4(uColor, a);
}`;
function withColor(m) {
  m.color = m.uniforms.uColor.value;
  Object.defineProperty(m, 'opacity', { get() { return this.uniforms.uOpacity.value; }, set(v) { if (this.uniforms) this.uniforms.uOpacity.value = v; } });
  return m;
}
function lineMat() {
  return withColor(new THREE.ShaderMaterial({ uniforms: { uRes: LINE.uRes, uWidth: LINE.uWidth, uColor: { value: new THREE.Color(1, 1, 1) }, uOpacity: { value: 0.5 } }, vertexShader: LINE_VS, fragmentShader: LINE_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
}
function segs(p, mat) {
  if (p.isBufferGeometry) p = p.attributes.position.array;
  const n = p.length / 6, A = new Float32Array(n * 12), B = new Float32Array(n * 12), SD = new Float32Array(n * 8), I = new Uint32Array(n * 6);
  const sides = [0, -1, 0, 1, 1, -1, 1, 1];
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) { A[i * 12 + k * 3 + j] = p[i * 6 + j]; B[i * 12 + k * 3 + j] = p[i * 6 + 3 + j]; }
    SD.set(sides, i * 8);
    I.set([4 * i, 4 * i + 2, 4 * i + 1, 4 * i + 1, 4 * i + 2, 4 * i + 3], i * 6);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(A, 3)); g.setAttribute('b', new THREE.BufferAttribute(B, 3)); g.setAttribute('side', new THREE.BufferAttribute(SD, 2));
  g.setIndex(new THREE.BufferAttribute(I, 1));
  const m = new THREE.Mesh(g, mat); m.frustumCulled = false;
  return m;
}
// X-ray surfaces: faint where seen face-on, bright where seen edge-on, adding up through each layer.
const XRAY_VS = `varying vec3 vN; varying vec3 vV;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const XRAY_FS = `uniform vec3 uColor; uniform float uOpacity; varying vec3 vN; varying vec3 vV;
void main() { float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); float a = uOpacity * (0.16 + 0.84 * pow(f, 2.2)); gl_FragColor = vec4(uColor * a, a); }`;
function xrayMat() {
  return withColor(new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color(1, 1, 1) }, uOpacity: { value: 0.3 } }, vertexShader: XRAY_VS, fragmentShader: XRAY_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
}
function solid(geo, mat) { const g = geo.index ? geo.toNonIndexed() : geo; g.computeVertexNormals(); return new THREE.Mesh(g, mat); }
function tris(list) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(list.flat(), 3)); return g; }
// Roof surfaces matching hipRoof and dome.
function roofSolid(c) {
  const t = [];
  const band = (lo, hi) => { for (let i = 0; i < lo.length; i++) { const j = (i + 1) % lo.length; t.push(lo[i], lo[j], hi[j], lo[i], hi[j], hi[i]); } };
  if (c.type === 'oct') {
    const rings = [];
    for (let i = 0; i <= 6; i++) { const q = (i / 6) * 0.86; rings.push(octVerts(c.r * 1.04 * Math.cos((q * Math.PI) / 2), c.h + c.dome * Math.sin((q * Math.PI) / 2))); }
    for (let i = 0; i < 6; i++) band(rings[i], rings[i + 1]);
    const yt = rings[6][0][1]; band(rings[6], rings[6].map(() => [0, yt + 0.02, 0]));
    return tris(t);
  }
  const o = 0.15, X = c.w / 2 + o, Z = c.d / 2 + o, y = c.h;
  let base = [[-X, y, -Z], [X, y, -Z], [X, y, Z], [-X, y, Z]];
  if (c.type === 'center') {
    const m = 0.55, ym = y + 0.62 * c.roof, mid = [[-X + m, ym, -Z + m], [X - m, ym, -Z + m], [X - m, ym, Z - m], [-X + m, ym, Z - m]];
    band(base, mid); base = mid;
  }
  const bw = base[1][0] - base[0][0], bd = base[3][2] - base[0][2], top = y + c.roof;
  let e;
  if (bw >= bd) { const rl = (bw - bd) / 2; e = [[-rl, top, 0], [rl, top, 0], [rl, top, 0], [-rl, top, 0]]; }
  else { const rl = (bd - bw) / 2; e = [[0, top, -rl], [0, top, -rl], [0, top, rl], [0, top, rl]]; }
  band(base, e);
  return tris(t);
}
function prism(c, y0, y1) {
  let g;
  if (c.type === 'oct') { g = new THREE.CylinderGeometry(c.r, c.r, y1 - y0, 8, 1, true); g.rotateY(Math.PI / 8); }
  else g = new THREE.BoxGeometry(c.w, y1 - y0, c.d);
  g.translate(0, (y0 + y1) / 2, 0);
  return g;
}
function fillMat() { return new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }); }

function buildPalace() {
  const root = new THREE.Group();
  const hulls = [];
  const pavs = PAV.map((c) => {
    const g = new THREE.Group(); g.position.x = c.x; root.add(g);
    const low = Lines(), up = Lines(), roofL = Lines(), gridL = Lines();
    if (c.type === 'oct') { octWalls(c, low, up); dome(c, roofL); }
    else { boxWalls(c, low, up, c.type === 'center'); hipRoof(c, roofL, c.type === 'center'); }
    if (c.type === 'center') vestibule(c, low, up);
    floorGrid(c, gridL, FL + 0.02);

    const wallMat = lineMat(), roofMat = lineMat(), roomLineMat = lineMat(), roomFillMat = fillMat();
    const shellMat = xrayMat(), roofShellMat = xrayMat();
    const lowObj = new THREE.Group();
    lowObj.add(segs(low.p, wallMat), solid(prism(c, 0, FL), shellMat));
    if (c.type === 'center') lowObj.add(solid(new THREE.BoxGeometry(3.4, 2.9, 1.5).translate(0, 1.45, c.d / 2 + 0.75), shellMat));
    const upper = new THREE.Group();
    upper.add(segs(up.p, wallMat), solid(prism(c, FL, c.h), shellMat));
    g.add(lowObj, upper);

    // Roof hinges on its back eave.
    const back = c.type === 'oct' ? c.r : c.d / 2 + 0.15;
    const roofGeo = geo(roofL.p); roofGeo.translate(0, -c.h, back);
    const roofSurf = roofSolid(c); roofSurf.translate(0, -c.h, back);
    const roofPivot = new THREE.Group(); roofPivot.position.set(0, c.h, -back); roofPivot.add(segs(roofGeo, roofMat), solid(roofSurf, roofShellMat));
    const roofLift = new THREE.Group(); roofLift.add(roofPivot); g.add(roofLift);

    // Room: the upper storey.
    const rh = c.h - FL - 0.06, cy = FL + 0.03 + rh / 2;
    let roomGeo;
    if (c.type === 'oct') { roomGeo = new THREE.CylinderGeometry(c.r * 0.94, c.r * 0.94, rh, 8, 1); roomGeo.rotateY(Math.PI / 8); }
    else roomGeo = new THREE.BoxGeometry(c.w - 0.18, rh, c.d - 0.18);
    roomGeo.translate(0, cy, 0);
    const room = new THREE.Group();
    room.add(new THREE.Mesh(roomGeo, roomFillMat));
    room.add(segs(new THREE.EdgesGeometry(roomGeo), roomLineMat));
    room.add(segs(gridL.p, roomLineMat));
    upper.add(room);

    let hullGeo = c.type === 'oct' ? new THREE.CylinderGeometry(c.r, c.r, c.h + c.dome, 8) : new THREE.BoxGeometry(c.w, c.h + c.roof, c.d + (c.type === 'center' ? 3 : 0));
    hullGeo.translate(0, (c.h + (c.dome || c.roof)) / 2, c.type === 'center' ? 1.5 : 0);
    const hull = new THREE.Mesh(hullGeo, new THREE.MeshBasicMaterial({ visible: false }));
    hull.userData.id = c.id; g.add(hull); hulls.push(hull);

    const top = new THREE.Vector3(c.x, c.h + 0.2, 0);
    const mid = new THREE.Vector3(c.x, cy, 0);
    return { ...c, g, upper, lowObj, roofPivot, roofLift, room, wallMat, roofMat, roomLineMat, roomFillMat, shellMat, roofShellMat, top, mid };
  });

  // Sala Terrena: ground floor of the middle pavilion, four Atlas pillars.
  // The four pillars carry a groin-vaulted ceiling (Wikipedia: "a vaulted ceiling supported by four Atlas pillars").
  const salaL = Lines(), sc = PAV[3];
  const spring0 = FL - 0.42, crown = FL - 0.04;
  // Pillar profile, [height share, radius]: plinth, body, shoulders, head, capital.
  const prof = [[0, 0.22], [0.12, 0.22], [0.16, 0.15], [0.45, 0.17], [0.7, 0.24], [0.8, 0.2], [0.86, 0.11], [0.93, 0.13], [0.97, 0.3], [1, 0.3]];
  for (const [x, z] of [[-1, -1.6], [1, -1.6], [-1, 1.6], [1, 1.6]]) {
    const rings = prof.map(([f, r]) => octVerts(r, f * spring0).map(([a, y, c]) => [a + x, y, c + z]));
    rings.forEach((r) => salaL.poly(r));
    for (let k = 0; k < 8; k += 2) salaL.poly(rings.map((r) => r[k]), false);
  }
  const xs = [-2.42, -1, 1, 2.42], zs = [-4.42, -1.6, 1.6, 4.42];
  const arc = (a, b) => { const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([a[0] + (b[0] - a[0]) * t, spring0 + (crown - spring0) * Math.sin(Math.PI * t), a[2] + (b[2] - a[2]) * t]); } salaL.poly(pts, false); };
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const [x0, x1, z0, z1] = [xs[i], xs[i + 1], zs[j], zs[j + 1]];
    arc([x0, 0, z0], [x1, 0, z0]); arc([x0, 0, z0], [x0, 0, z1]);
    arc([x0, 0, z0], [x1, 0, z1]); arc([x1, 0, z0], [x0, 0, z1]);
    if (i === 2) arc([x1, 0, z0], [x1, 0, z1]);
    if (j === 2) arc([x0, 0, z1], [x1, 0, z1]);
  }
  floorGrid({ type: 'box', w: sc.w, d: sc.d }, salaL, 0.02);
  const salaMat = lineMat();
  const sala = segs(salaL.p, salaMat);
  root.add(sala);

  // Terrace and the pool in front of the building.
  const gl = Lines();
  gl.poly([[-15.6, 0, -5.5], [15.6, 0, -5.5], [15.6, 0, 7.5], [-15.6, 0, 7.5]]);
  gl.poly([[-9, 0, 10], [9, 0, 10], [9, 0, 17], [-9, 0, 17]]);
  gl.poly([[-8.7, 0, 10.3], [8.7, 0, 10.3], [8.7, 0, 16.7], [-8.7, 0, 16.7]]);
  for (let x = -14; x <= 14; x += 2) gl.s([x, 0, 7.5], [x, 0, 8.2]);
  const groundMat = lineMat();
  const ground = segs(gl.p, groundMat);
  root.add(ground);

  return { root, pavs, hulls, sala, salaMat, ground, groundMat };
}

// Critically damped spring: retargeting mid-motion keeps velocity, so fast re-triggers never jump.
function spring(s, target, dt, k = 70) { const c = 2 * Math.sqrt(k); s.v += (k * (target - s.x) - c * s.v) * dt; s.x += s.v * dt; return s.x; }
const S = (x = 0) => ({ x, v: 0 });
const damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  r.setClearColor(0x030508, 1);
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  return r;
}

function toScreen(v, cam, w, h) { const p = v.clone().project(cam); return [(p.x * 0.5 + 0.5) * w, (-p.y * 0.5 + 0.5) * h, p.z]; }
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
