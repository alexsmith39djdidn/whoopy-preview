/* Фигуры из частиц — рубрика «Что думаем» и шапки разборов.
   Вынесено из home.js 24.09.2026: тот же холст теперь стоит и
   в начале каждой статьи, чтобы карточка и страница были одной вещью. */
/* ── Что думаем — макет 22.09.2026 ── */

/* ── Холст рубрики «Что думаем» ───────────────────────────────
   Вариант А — облако частиц (выбор Саши, 04.09.2026), но частицы
   не висят россыпью: они собираются в фигуру. Россыпь красива и
   ничего не говорит; фигура из тех же частиц говорит ровно то,
   про что мысль, и остаётся при этом облаком, а не иконкой.

   Какая фигура — сказано в разметке, атрибутом data-shape на
   самом холсте. Фон всегда чёрный: рубрика живёт тёмным окном,
   как все окна сайта.

   Три вещи, без которых это не работает на телефоне:
   · частиц столько, сколько влезает по площади, а не жёстким
     числом — иначе на узкой карточке выходит вдвое гуще;
   · холст живёт, только пока карточка на экране: мыслей будет
     не две, а десять, и десять вечных requestAnimationFrame —
     это разряженный телефон за чтение одной страницы;
   · при повороте телефона холст пересобирается, иначе картинка
     растягивается и мылится.
   Кто просил меньше движения — получает один собранный кадр. */

(function(){
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Фигуры рисуются примитивами в квадрате 100×100 и потом
     разбираются на точки. Сложный контур тут не нужен и вреден:
     частицы съедают мелочь, а узнаётся только крупная форма. */
  const SHAPES = {
    /* связи: центр и спутники на нитях — про то, что работа
       компании не набор кусков, а то, что между ними */
    net(c){
      c.strokeStyle = '#fff'; c.fillStyle = '#fff';
      const hub = [50, 50], sat = [[16,24],[84,20],[12,74],[88,68],[50,90],[50,10]];
      c.lineWidth = 6.5;
      sat.forEach(([x,y]) => { c.beginPath(); c.moveTo(...hub); c.lineTo(x,y); c.stroke(); });
      sat.forEach(([x,y]) => { c.beginPath(); c.arc(x,y,11,0,7); c.fill(); });
      c.beginPath(); c.arc(hub[0],hub[1],19,0,7); c.fill();
    },
    /* память как вещь: коробка, которая стоит на месте и когда
       человек ушёл. Рисуется рёбрами, а не заливкой — залитая
       фигура из частиц читается пятном, контур читается формой */
    cube(c){
      c.lineWidth = 7; c.strokeStyle = '#fff'; c.lineJoin = 'round';
      const cx = 50, cy = 50, w = 30, h = 17, d = 22;
      c.beginPath();                       /* крышка */
      c.moveTo(cx, cy-d-h); c.lineTo(cx+w, cy-d); c.lineTo(cx, cy-d+h); c.lineTo(cx-w, cy-d); c.closePath();
      c.stroke();
      c.beginPath();                       /* бока */
      c.moveTo(cx-w, cy-d); c.lineTo(cx-w, cy+d-4); c.lineTo(cx, cy+d+h-4); c.lineTo(cx+w, cy+d-4); c.lineTo(cx+w, cy-d);
      c.stroke();
      c.beginPath();                       /* переднее ребро */
      c.moveTo(cx, cy-d+h); c.lineTo(cx, cy+d+h-4);
      c.stroke();
    },
    /* ступени: три блока лесенкой — вводим по одному делу за раз,
       каждый следующий шаг стоит на предыдущем */
    steps(c){
      c.fillStyle = '#fff';
      c.beginPath(); c.roundRect(10, 64, 26, 26, 5); c.fill();
      c.beginPath(); c.roundRect(37, 64, 26, 26, 5); c.fill();
      c.beginPath(); c.roundRect(37, 37, 26, 26, 5); c.fill();
      c.beginPath(); c.roundRect(64, 64, 26, 26, 5); c.fill();
      c.beginPath(); c.roundRect(64, 37, 26, 26, 5); c.fill();
      c.beginPath(); c.roundRect(64, 10, 26, 26, 5); c.fill();
    },
    /* запрет: замок — корпус и дужка; мысль про «нельзя»,
       которое живёт дольше своей причины */
    lock(c){
      c.strokeStyle = '#fff'; c.fillStyle = '#fff';
      c.lineWidth = 11; c.lineCap = 'round';
      c.beginPath(); c.moveTo(32, 50); c.lineTo(32, 36);
      c.arc(50, 36, 18, Math.PI, 0); c.lineTo(68, 50); c.stroke();
      c.beginPath(); c.roundRect(20, 48, 60, 42, 8); c.fill();
    }
  };

  function fit(canvas){
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return null;
    canvas.width  = Math.round(box.width  * dpr);
    canvas.height = Math.round(box.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return {ctx, w: box.width, h: box.height};
  }

  /* точки фигуры: рисуем её в невидимом холсте и снимаем сетку.
     Шаг сетки растёт вместе с окном — плотность одна на любом
     размере, а не «на телефоне каша, на десктопе решето». */
  function targets(shape, w, h){
    const side = Math.min(w, h) * .66;
    const step = Math.max(3, side / 36);
    const off = document.createElement('canvas');
    off.width = off.height = Math.round(side);
    const c = off.getContext('2d');
    c.scale(side/100, side/100);
    (SHAPES[shape] || SHAPES.net)(c);
    const px = c.getImageData(0, 0, off.width, off.height).data;
    const pts = [], x0 = (w - side)/2, y0 = (h - side)/2;
    for (let y = 0; y < off.height; y += step)
      for (let x = 0; x < off.width; x += step)
        /* редкие пропуски: ровная сетка читается растром, чуть
           прореженная — облаком, севшим в форму. Сильнее прореживать
           нельзя, контур рассыпается в кашу — проверено глазами */
        if (px[((y|0) * off.width + (x|0)) * 4 + 3] > 110 && Math.random() > .07)
          pts.push([x0 + x, y0 + y]);
    return pts;
  }

  function build(canvas){
    const s = fit(canvas);
    if (!s) return null;
    const {w, h} = s;
    const pts = targets(canvas.dataset.shape, w, h);
    /* свободные частицы вокруг фигуры: без них фигура выглядит
       наклейкой, с ними остаётся облаком. Их мало и они тусклые —
       на четверти они забивали контур собой */
    const free = Math.round(pts.length * .13);
    const dots = pts.map(([tx, ty]) => ({
      tx, ty,
      x: Math.random()*w, y: Math.random()*h,
      r: .9 + Math.random()*1.9,
      a: .42 + Math.random()*.55,
      ph: Math.random()*Math.PI*2,
      am: .5 + Math.random()*.9
    })).concat(Array.from({length: free}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-.5)*.16, vy: (Math.random()-.5)*.16,
      r: .6 + Math.random()*1.3,
      a: .10 + Math.random()*.18
    })));
    return {...s, dots, t: 0};
  }

  function draw(st){
    const {ctx, w, h, dots} = st;
    st.t += .016;
    ctx.fillStyle = '#0E0E10';
    ctx.fillRect(0, 0, w, h);
    for (const d of dots){
      if (d.tx === undefined){                 /* свободная: плывёт */
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
      } else {                                  /* своя: тянется к месту и дышит */
        const bx = d.tx + Math.cos(st.t + d.ph) * d.am;
        const by = d.ty + Math.sin(st.t * .86 + d.ph) * d.am;
        d.x += (bx - d.x) * .055;
        d.y += (by - d.y) * .055;
      }
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(208,110,247,' + d.a + ')';
      ctx.fill();
    }
  }

  const live = new Map();

  function start(cv){
    const r = live.get(cv);
    if (!r || r.raf) return;
    const loop = () => { draw(r.st); r.raf = requestAnimationFrame(loop); };
    r.raf = requestAnimationFrame(loop);
  }
  function stop(cv){
    const r = live.get(cv);
    if (!r || !r.raf) return;
    cancelAnimationFrame(r.raf); r.raf = 0;
  }
  function mount(cv){
    const st = build(cv);
    if (!st) return;
    live.set(cv, {st, raf: 0});
    /* без движения показываем фигуру уже собранной, а не разлетевшейся */
    if (still) { st.dots.forEach(d => { if (d.tx !== undefined) { d.x = d.tx; d.y = d.ty; } }); }
    draw(st);
  }

  const all = [...document.querySelectorAll('canvas[data-shape]')];
  all.forEach(mount);

  if (!still && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(
      es => es.forEach(e => e.isIntersecting ? start(e.target) : stop(e.target)),
      {rootMargin: '120px'}
    );
    all.forEach(c => io.observe(c));
  }

  /* Наведение на карточку: фигура рассыпается и собирается заново.
     Заведено 24.09.2026 по слову Саши «сделать интереснее» — холст
     отвечает руке, а не просто дышит. */
  if (!still) all.forEach(cv => {
    const host = cv.closest('a, .ahero') || cv;
    host.addEventListener('mouseenter', () => {
      const r = live.get(cv); if (!r) return;
      const {w, h} = r.st;
      r.st.dots.forEach(d => { if (d.tx !== undefined) {
        const a = Math.random()*Math.PI*2, k = 40 + Math.random()*Math.max(w, h)*.35;
        d.x = d.tx + Math.cos(a)*k; d.y = d.ty + Math.sin(a)*k; } });
      start(cv);
    });
  });

  let t;
  addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => all.forEach(c => { stop(c); mount(c); if (!still) start(c); }), 180);
  }, {passive: true});
})();
