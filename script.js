/* ===== Utilidades ===== */
const $ = s => document.querySelector(s);
const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fecha = f => new Date(f + "T12:00:00").toLocaleDateString("es-MX", {day:"numeric", month:"long", year:"numeric"});

/* ===== Contenido de cada popup ===== */
const SECCIONES = {
  proyecto: ["El proyecto", () => `
    <p>Wan hu 67 es un equipo de primer semestre de ingeniería del Tecnológico de Monterrey, campus Sinaloa. Nuestro reto: diseñar, simular, probar y lanzar un paracaídas para un cohete de papel de aficionado, con punta impresa en 3D y un motor de unos cuantos newtons.</p>
    <p>Dentro de la punta va un acelerómetro frágil que debe sobrevivir a una caída de unos 10 a 15 metros. El paracaídas cabe en un tubo de unos 3 cm de diámetro y sale expulsado por el motor junto con la punta.</p>
    <h3>Cómo lo hacemos</h3>
    <ol class="pasos">
      <li><b>Diseño.</b> Calculamos el tamaño del paracaídas con las leyes de Newton y la resistencia del aire.</li>
      <li><b>Simulación.</b> Modelamos la caída con ecuaciones diferenciales en Matlab.</li>
      <li><b>Pruebas.</b> Soltamos el paracaídas desde distintas alturas y registramos lo que pasa.</li>
      <li><b>Lanzamiento.</b> El motor tiene tres fases: potencia máxima, humo y expulsión del paracaídas.</li>
    </ol>
    <h3>La leyenda de Wan Hu</h3>
    <p>Según la tradición, Wan Hu fue un funcionario de la dinastía Ming que intentó volar sentado en una silla con decenas de cohetes. La historia no está comprobada, pero es el origen del nombre de nuestro equipo.</p>`],
  videos: ["Videos", () => !VIDEOS.length ? `<p class="vacio">Aún no hay videos. Agréguenlos en data.js.</p>` :
    `<div class="rejilla">${VIDEOS.map((v,i)=>`<div class="tarjeta"><div class="yt play" data-yt="${esc(v.id)}"><img src="https://img.youtube.com/vi/${esc(v.id)}/hqdefault.jpg" alt="Miniatura: ${esc(v.subtitulo)}" loading="lazy"></div><div class="pie"><small>${fecha(v.fecha)}</small>${esc(v.subtitulo)}</div></div>`).join("")}</div>`],
  evidencia: ["Evidencia", () => !FOTOS.length ? `<p class="vacio">Aún no hay fotos. Agréguenlas en data.js.</p>` :
    `<div class="rejilla">${FOTOS.map((f,i)=>`<button class="tarjeta" data-foto="${i}"><img src="${esc(f.archivo)}" alt="${esc(f.subtitulo)}" loading="lazy"><div class="pie"><small>${fecha(f.fecha)}</small>${esc(f.subtitulo)}</div></button>`).join("")}</div>`],
  blog: ["Blog", () => !BLOG.length ? `<p class="vacio">Aún no hay entradas.</p>` :
    BLOG.map(b=>`<article class="entrada"><h3>${esc(b.titulo)}</h3><small>${fecha(b.fecha)}</small>${b.texto.map(p=>`<p>${esc(p)}</p>`).join("")}</article>`).join("")],
  equipo: ["Equipo", () => `<div class="rejilla">${EQUIPO.map(p=>`<div class="persona">${p.foto?`<img src="${esc(p.foto)}" alt="${esc(p.nombre)}">`:`<img src="img/logo.png" alt="">`}<h3>${esc(p.nombre)}</h3>${esc(p.rol)}</div>`).join("")}</div>`]
};

/* ===== Popups ===== */
const velo = $("#velo"), cont = $("#contenido"), ventana = $("#ventana"), lupa = $("#lupa");
let origen = null;
function abrir(clave, boton) {
  const [titulo, fn] = SECCIONES[clave];
  $("#titulo-ventana").textContent = titulo; cont.innerHTML = fn();
  origen = boton; velo.hidden = false; ventana.scrollTop = 0; ventana.focus();
}
function cerrar() { if (!lupa.hidden) { lupa.hidden = true; return; } velo.hidden = true; origen && origen.focus(); }
document.querySelectorAll("[data-abrir]").forEach(b => b.onclick = () => abrir(b.dataset.abrir, b));
$(".cerrar").onclick = cerrar;
velo.addEventListener("click", e => { if (e.target === velo) cerrar(); });
lupa.onclick = () => lupa.hidden = true;
document.addEventListener("keydown", e => { if (e.key === "Escape" && !velo.hidden) cerrar(); });
cont.addEventListener("click", e => {
  const yt = e.target.closest("[data-yt]");
  if (yt) { yt.classList.remove("play"); yt.innerHTML = `<iframe width="100%" height="100%" style="aspect-ratio:16/9;border:0" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt.dataset.yt)}?autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video"></iframe>`; return; }
  const f = e.target.closest("[data-foto]");
  if (f) { const x = FOTOS[f.dataset.foto]; lupa.querySelector("img").src = x.archivo; lupa.querySelector("img").alt = x.subtitulo; lupa.querySelector("p").textContent = fecha(x.fecha) + " · " + x.subtitulo; lupa.hidden = false; }
});

/* ===== Cielo: estrellas, brasas, cohetes y dragones ===== */
const cv = $("#cielo"), g = cv.getContext("2d");
const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
let W, H, estrellas = [], brasas = [], cohetes = [], dragones = [];
const R = (a, b) => a + Math.random() * (b - a);
function medir() {
  const d = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0);
  estrellas = Array.from({length: Math.round(W * H / 3500)}, () => ({x: R(0, W), y: R(0, H), r: R(.4, 1.8), f: R(0, 6.3), v: R(.5, 2)}));
}
function nuevoDragon(dir) { return {dir, t: R(0, 6), y: R(.18, .6) * H, v: R(.7, 1.2), x: dir > 0 ? -300 : W + 300, hue: Math.random() > .3}; }
function dibujaDragon(d) {
  const N = 46, pts = [];
  for (let i = 0; i < N; i++) {
    const x = d.x - d.dir * i * 9, y = d.y + Math.sin(d.t - i * .28) * 38 * (1 + i / N);
    pts.push([x, y]);
  }
  g.lineCap = "round";
  for (let i = N - 1; i > 0; i--) {
    const w = 3 + 15 * Math.sin(Math.PI * Math.min(1, (N - i) / N * .9 + .08));
    g.strokeStyle = i % 4 ? "#c8101e" : "#e8101e"; g.lineWidth = w; g.shadowColor = "#e8101e"; g.shadowBlur = 14;
    g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i - 1][0], pts[i - 1][1]); g.stroke();
    if (i % 3 === 0 && i < N - 6) { g.fillStyle = "#d9a441"; g.beginPath(); g.moveTo(pts[i][0], pts[i][1] - w / 2); g.lineTo(pts[i][0] - d.dir * 6, pts[i][1] - w / 2 - 9); g.lineTo(pts[i][0] + d.dir * 5, pts[i][1] - w / 2); g.fill(); }
  }
  const [hx, hy] = pts[0]; g.shadowBlur = 20; g.fillStyle = "#e8101e";
  g.beginPath(); g.ellipse(hx + d.dir * 8, hy, 20, 12, 0, 0, 6.3); g.fill();
  g.strokeStyle = "#f5f1e6"; g.lineWidth = 2; g.shadowBlur = 0;
  g.beginPath(); g.moveTo(hx, hy - 8); g.quadraticCurveTo(hx - d.dir * 18, hy - 26, hx - d.dir * 34, hy - 14);
  g.moveTo(hx + d.dir * 14, hy + 6); g.quadraticCurveTo(hx + d.dir * 34, hy + 22, hx + d.dir * 52, hy + 8); g.stroke();
  g.fillStyle = "#f5f1e6"; g.beginPath(); g.arc(hx + d.dir * 14, hy - 3, 2.6, 0, 6.3); g.fill();
}
function cuadro() {
  g.clearRect(0, 0, W, H);
  const fondo = g.createRadialGradient(W / 2, H * 1.1, 0, W / 2, H * 1.1, H * 1.1);
  fondo.addColorStop(0, "rgba(232,16,30,.35)"); fondo.addColorStop(1, "rgba(9,5,6,0)"); g.fillStyle = fondo; g.fillRect(0, 0, W, H);
  g.shadowBlur = 0;
  for (const s of estrellas) { s.f += s.v * .03; g.globalAlpha = .45 + .55 * Math.abs(Math.sin(s.f)); g.fillStyle = "#f5f1e6"; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.3); g.fill(); }
  g.globalAlpha = 1;
  if (!quieto) {
    if (brasas.length < 90) brasas.push({x: R(0, W), y: H + 10, vx: R(-.3, .3), vy: R(-2.2, -.6), r: R(1, 3.2), a: 1});
    brasas = brasas.filter(b => b.a > 0); for (const b of brasas) { b.x += b.vx + Math.sin(b.y / 30) * .4; b.y += b.vy; b.a -= .006; g.globalAlpha = Math.max(b.a, 0); g.fillStyle = b.r > 2.2 ? "#ffb347" : "#e8101e"; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.3); g.fill(); }
    g.globalAlpha = 1;
    if (Math.random() < .006 && cohetes.length < 3) cohetes.push({x: R(.1, .9) * W, y: H + 20, vx: R(-.8, .8), cola: []});
    cohetes = cohetes.filter(c => c.y > -40);
    for (const c of cohetes) { c.x += c.vx; c.y -= 5; c.cola.push([c.x, c.y]); if (c.cola.length > 30) c.cola.shift();
      c.cola.forEach(([x, y], i) => { g.globalAlpha = i / 30; g.fillStyle = i % 2 ? "#ffb347" : "#e8101e"; g.beginPath(); g.arc(x + R(-2, 2), y, 1 + i / 8, 0, 6.3); g.fill(); });
      g.globalAlpha = 1; g.fillStyle = "#f5f1e6"; g.fillRect(c.x - 2, c.y - 8, 4, 10);
      if (Math.random() < .02) for (let k = 0; k < 14; k++) brasas.push({x: c.x, y: c.y, vx: R(-3, 3), vy: R(-3, 3), r: R(1, 2.5), a: 1}); }
    if (!dragones.length) dragones = [nuevoDragon(1), nuevoDragon(-1)];
    dragones.forEach((d, i) => { d.x += d.dir * d.v * 1.4; d.t += .05; dibujaDragon(d); if ((d.dir > 0 && d.x > W + 700) || (d.dir < 0 && d.x < -700)) dragones[i] = nuevoDragon(d.dir); });
    g.globalAlpha = 1; g.shadowBlur = 0;
    requestAnimationFrame(cuadro);
  }
}
addEventListener("resize", medir); medir(); cuadro();
