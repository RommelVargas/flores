(function(){
  const svgNS = "http://www.w3.org/2000/svg";
  const root = document.getElementById('garden-root');
  const rand = (a,b) => Math.random()*(b-a)+a;
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  // Exclusivamente tonos amarillos para todo el ramo
  const grads = ['petalGradA','petalGradB'];

  /* ============ Geometría de pétalos y hojas ============ */
  function petalPath(L, W){
    const jx = rand(-2,2), jy = rand(-2,2);
    return `M0,0 C ${-W+jx},${-L*0.4} ${-W*0.7},${-L} 0,${-L*0.95+jy} `
         + `C ${W*0.7},${-L} ${W-jx},${-L*0.4} 0,0 Z`;
  }

  function buildRing(parent, count, length, width, radiusOffset, gradId, jitter, rotOffset){
    const ring = document.createElementNS(svgNS,'g');
    for(let i=0;i<count;i++){
      const angle = (360/count)*i + (rotOffset||0) + rand(-jitter,jitter);
      const L = length*rand(0.88,1.12), W = width*rand(0.85,1.15);
      const petal = document.createElementNS(svgNS,'path');
      petal.setAttribute('d', petalPath(L,W));
      petal.setAttribute('fill', `url(#${gradId})`);
      petal.setAttribute('stroke','rgba(110,65,10,0.18)');
      petal.setAttribute('stroke-width','0.6');
      petal.setAttribute('class','petal');
      petal.setAttribute('transform', `rotate(${angle}) translate(0,${-radiusOffset})`);
      ring.appendChild(petal);
    }
    parent.appendChild(ring);
  }

  function buildLeaf(x,y,angle,scale){
    const L=24*scale, W=11*scale;
    const leaf = document.createElementNS(svgNS,'path');
    const d = `M0,0 C ${W},${-L*0.3} ${W*0.75},${-L*0.85} 0,${-L} `
            + `C ${-W*0.75},${-L*0.85} ${-W},${-L*0.3} 0,0 Z`;
    leaf.setAttribute('d', d);
    leaf.setAttribute('fill','url(#leafGrad)');
    leaf.setAttribute('transform', `translate(${x},${y}) rotate(${angle})`);
    leaf.setAttribute('class','leaf');
    return leaf;
  }

  /* ============ Generador de Tipos de Flores ============ */
  function addCenter(head, radius, fill) {
    const center = document.createElementNS(svgNS,'circle');
    center.setAttribute('r', radius);
    center.setAttribute('fill', fill);
    head.appendChild(center);

    // Dinámico según el ancho de pantalla para ahorrar memoria
    const dotCount = window.innerWidth <= 768 ? 3 : 7;
    for(let i=0; i<dotCount; i++){
      const dot = document.createElementNS(svgNS,'circle');
      const a = rand(0,360), r = rand(1, radius*0.75);
      dot.setAttribute('cx', Math.cos(a)*r);
      dot.setAttribute('cy', Math.sin(a)*r);
      dot.setAttribute('r', radius*0.15);
      dot.setAttribute('fill', '#3a220a');
      dot.setAttribute('opacity', '0.45');
      head.appendChild(dot);
    }
  }

  function buildFlowerHead(f) {
    const head = document.createElementNS(svgNS,'g');
    head.setAttribute('class','flower-head-breathe');
    head.style.setProperty('--breathe-dur', rand(6,9).toFixed(2)+'s');
    head.style.setProperty('--breathe-delay', rand(0,3).toFixed(2)+'s');

    const glow = document.createElementNS(svgNS,'circle');
    glow.setAttribute('r', 30 * f.scale);
    glow.setAttribute('fill','url(#glowGrad)');
    head.appendChild(glow);

    if (f.type === 'girasol') {
      buildRing(head, f.petals, 26*f.scale, 13*f.scale, 4*f.scale, f.gradId, 12, 0);
      buildRing(head, f.petals-2, 18*f.scale, 9.5*f.scale, 2*f.scale, f.gradId, 10, 180/f.petals);
      buildRing(head, Math.max(4,f.petals-4), 11*f.scale, 6*f.scale, 0, 'petalGradInner', 10, 0);
      addCenter(head, 5.5*f.scale, 'url(#centerGrad)');
    }
    else if (f.type === 'margarita') {
      buildRing(head, f.petals, 22*f.scale, 8*f.scale, 3*f.scale, f.gradId, 6, 0);
      addCenter(head, 6.5*f.scale, 'url(#centerGrad)');
    }
    else if (f.type === 'ancha') {
      buildRing(head, f.petals, 23*f.scale, 15*f.scale, 2*f.scale, f.gradId, 8, 0);
      buildRing(head, f.petals, 15*f.scale, 10*f.scale, 0, f.gradId, 8, 180/f.petals);
      addCenter(head, 4.5*f.scale, 'url(#centerGrad)');
    }

    return head;
  }

  /* ============ Construcción con Tallo ============ */
  function buildBouquetFlower(f, growDelay) {
    const anchor = document.createElementNS(svgNS,'g');
    anchor.setAttribute('class', `flower-anchor flower`);
    anchor.style.transformBox = 'view-box';
    anchor.style.transformOrigin = `${f.baseX}px ${f.baseY}px`;
    anchor.style.setProperty('--grow-delay', growDelay.toFixed(2)+'s');

    const sway = document.createElementNS(svgNS,'g');
    sway.setAttribute('class','flower-sway');
    sway.style.transformBox = 'view-box';
    sway.style.transformOrigin = `${f.baseX}px ${f.baseY}px`;
    sway.style.setProperty('--sway-dur', rand(4.5,7.5).toFixed(2)+'s');
    sway.style.setProperty('--sway-delay', rand(0,3).toFixed(2)+'s');

    const dx = f.headX - f.baseX, dy = f.headY - f.baseY;
    const c1x = f.baseX + dx*0.1,            c1y = f.baseY - 50;
    const c2x = f.baseX + dx*0.8 + rand(-10,10), c2y = f.baseY + dy*0.6;

    const stem = document.createElementNS(svgNS,'path');
    stem.setAttribute('d', `M${f.baseX},${f.baseY} C ${c1x},${c1y} ${c2x},${c2y} ${f.headX},${f.headY}`);
    stem.setAttribute('fill','none');
    stem.setAttribute('stroke','url(#stemGrad)');
    stem.setAttribute('stroke-width', 3.5 * f.scale);
    stem.setAttribute('stroke-linecap','round');
    sway.appendChild(stem);

    if(Math.random() < 0.15) {
      const dir = dx >= 0 ? 1 : -1;
      sway.appendChild(buildLeaf(f.baseX+dx*0.5, f.baseY+dy*0.5, dir*rand(25,45), f.scale*0.8));
    }

    const headWrapper = document.createElementNS(svgNS, 'g');
    headWrapper.setAttribute('transform', `translate(${f.headX},${f.headY})`);

    const head = buildFlowerHead(f);
    head.style.transformBox = 'fill-box';
    head.style.transformOrigin = 'center';

    headWrapper.appendChild(head);
    sway.appendChild(headWrapper);

    anchor.appendChild(sway);
    return anchor;
  }

  /* ============ Listón ============ */
  function buildRibbon(wx, wy){
    const g = document.createElementNS(svgNS,'g');
    g.setAttribute('class','ribbon');

    function loop(mirror){
      const p = document.createElementNS(svgNS,'path');
      const d = `M${wx},${wy-6}
                 C ${wx+mirror*60},${wy-45} ${wx+mirror*70},${wy+20} ${wx+mirror*10},${wy+28}
                 C ${wx-mirror*2},${wy+20} ${wx-mirror*2},${wy-2} ${wx},${wy-6} Z`;
      p.setAttribute('d', d);
      p.setAttribute('fill','url(#ribbonGrad)');
      p.setAttribute('stroke','rgba(120,75,20,0.3)');
      p.setAttribute('stroke-width','0.8');
      return p;
    }
    function tail(mirror){
      const p = document.createElementNS(svgNS,'path');
      const d = `M${wx+mirror*6},${wy+10}
                 C ${wx+mirror*18},${wy+50} ${wx+mirror*5},${wy+85} ${wx+mirror*20},${wy+120}
                 L ${wx+mirror*6},${wy+105}
                 L ${wx-mirror*5},${wy+120}
                 C ${wx-mirror*3},${wy+85} ${wx-mirror*8},${wy+50} ${wx},${wy+10} Z`;
      p.setAttribute('d', d);
      p.setAttribute('fill','url(#ribbonGrad)');
      p.setAttribute('stroke','rgba(120,75,20,0.3)');
      p.setAttribute('stroke-width','0.8');
      return p;
    }

    g.appendChild(tail(-1));
    g.appendChild(tail(1));
    g.appendChild(loop(-1));
    g.appendChild(loop(1));
    const knot = document.createElementNS(svgNS,'circle');
    knot.setAttribute('cx', wx); knot.setAttribute('cy', wy);
    knot.setAttribute('r', 16);
    knot.setAttribute('fill','url(#ribbonGrad)');
    knot.setAttribute('stroke','rgba(120,75,20,0.35)');
    knot.setAttribute('stroke-width','1');
    g.appendChild(knot);
    return g;
  }

  /* ============ Distribución Masiva Responsiva ============ */
  const wx = 720, wy = 690;
  const flowersData = [];

  // Fórmula de densidad: Calcula el ancho de la ventana actual.
  // Limita a un máximo de 180 (PCs grandes) y un mínimo de 60 (celulares muy estrechos).
  let totalFlowers = Math.floor(window.innerWidth / 8);
  if (totalFlowers > 180) totalFlowers = 180;
  if (totalFlowers < 60) totalFlowers = 60;

  // Calculamos un factor multiplicador (de 0 a 1) para escalar también las partículas
  const scaleFactor = totalFlowers / 180;

  for(let i=0; i<totalFlowers; i++) {
    const angle = rand(-55, 55);
    const rad = angle * Math.PI / 180;

    const dist = Math.sqrt(Math.random()) * 320 + 30;
    const headX = wx + Math.sin(rad) * dist;
    const headY = wy - Math.cos(rad) * dist * 1.05;

    const baseX = wx + rand(-25, 25);
    const baseY = wy + rand(-10, 10);

    const r = Math.random();
    let type, scale, grad, petals;

    if (r < 0.45) {
      type = 'girasol'; scale = rand(0.7, 1.3); grad = pick(grads); petals = pick([9, 10, 11]);
    } else if (r < 0.75) {
      type = 'margarita'; scale = rand(0.5, 0.9); grad = pick(grads); petals = Math.floor(rand(12, 16));
    } else {
      type = 'ancha'; scale = rand(0.6, 1.0); grad = pick(grads); petals = pick([6, 7, 8]);
    }

    const delay = 0.2 + (dist / 350) * 1.8;
    flowersData.push({ baseX, baseY, headX, headY, type, scale, gradId: grad, petals, angle, delay });
  }

  flowersData.sort((a, b) => a.headY - b.headY);

  flowersData.forEach(f => {
    root.appendChild(buildBouquetFlower(f, f.delay));
  });

  root.appendChild(buildRibbon(wx, wy));

  const decoDefs = document.querySelector('#garden-svg defs');
  if (decoDefs) {
    const decoObj = { type: 'girasol', scale: 1, gradId: 'petalGradA', petals: 10 };
    const decoHeadWrapper = document.createElementNS(svgNS, 'g');
    const decoFlower = buildFlowerHead(decoObj);
    decoFlower.style.transformBox = 'fill-box';
    decoFlower.style.transformOrigin = 'center';
    decoFlower.removeAttribute('class');
    decoFlower.id = 'deco-flower';
    decoFlower.classList.remove('flower-head-breathe');

    decoHeadWrapper.appendChild(decoFlower);
    decoDefs.appendChild(decoHeadWrapper);
  }

  /* ============ Partículas (Escalado Proporcional) ============ */
  const firefliesCount = Math.floor(25 * scaleFactor);
  const petalsCount = Math.floor(15 * scaleFactor);
  const sparklesCount = Math.floor(25 * scaleFactor);

  const fireflyBox = document.getElementById('fireflies');
  for(let i=0;i<firefliesCount;i++){
    const f = document.createElement('div');
    f.className = 'firefly';
    f.style.left = rand(4,96)+'%';
    f.style.top = rand(30,80)+'%';
    f.style.setProperty('--fdur', rand(7,13).toFixed(2)+'s');
    f.style.setProperty('--fdelay', rand(0,8).toFixed(2)+'s');
    f.style.setProperty('--fx', rand(-40,40)+'px');
    f.style.setProperty('--fy', rand(-50,-10)+'px');
    if(fireflyBox) fireflyBox.appendChild(f);
  }

  const petalBox = document.getElementById('petals-fall');
  for(let i=0;i<petalsCount;i++){
    const p = document.createElement('div');
    p.className = 'falling-petal';
    p.style.left = rand(0,100)+'%';
    p.style.setProperty('--pdur', rand(11,18).toFixed(2)+'s');
    p.style.setProperty('--pdelay', rand(0,14).toFixed(2)+'s');
    p.style.setProperty('--px', rand(-80,80)+'px');
    if(petalBox) petalBox.appendChild(p);
  }

  const sparkleBox = document.getElementById('sparkles');
  for(let i=0;i<sparklesCount;i++){
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left = rand(5,95)+'%';
    s.style.top = rand(25,72)+'%';
    s.style.setProperty('--tdur', rand(2.5,5).toFixed(2)+'s');
    s.style.setProperty('--tdelay', rand(0,5).toFixed(2)+'s');
    if(sparkleBox) sparkleBox.appendChild(s);
  }

  /* ============ Vistas ============ */
  const viewFlowers = document.getElementById('view-flowers');
  const viewNote = document.getElementById('view-note');
  const btnOpen = document.getElementById('btn-open');
  const btnBack = document.getElementById('btn-back');

  if(btnOpen && viewFlowers && viewNote) {
    btnOpen.addEventListener('click', ()=>{
      viewFlowers.classList.add('hidden');
      viewNote.classList.remove('hidden');
    });
  }

  if(btnBack && viewFlowers && viewNote) {
    btnBack.addEventListener('click', ()=>{
      viewNote.classList.add('hidden');
      viewFlowers.classList.remove('hidden');
    });
  }

  const flash = document.getElementById('flash');
  if(flash) {
    setTimeout(()=>{ flash.classList.add('on'); }, 3500);
  }
})();
