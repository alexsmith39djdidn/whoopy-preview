/* Скрипты главной страницы Whoopy: подсветка точек-оглавления,
   перепечатка заголовка, появление блоков вылетом, приплывающая плашка.
   Вынесены из index.html 04.08.2026 по той же причине, что и стили —
   английская версия должна брать тот же файл, а не его копию. */

/* Здесь жил скрипт красной метки у логотипа: она горела 10 дней с даты
   последнего обновления и гасла сама. Метка убрана 03.08.2026 по слову Саши
   («тут давай без точки»), скрипт ушёл следом — мёртвый код хуже лишней
   точки: он ищет элемент, которого нет, и делает вид, что что-то умеет. */

/* Оглавление точками: подсветка той, в чьём разделе мы сейчас.
   Порог 0.5 экрана сверху — активной становится секция, дошедшая до середины
   вида, а не та, что едва показалась краем. Иначе точка дёргается на стыках. */
(function () {
  var dots = document.getElementById('dots');
  if (!dots) return;
  var links = [].slice.call(dots.querySelectorAll('a'));
  var targets = links.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });

  function paint() {
    var mid = window.innerHeight * 0.5, best = 0;
    targets.forEach(function (el, i) {
      if (el && el.getBoundingClientRect().top <= mid) best = i;
    });
    links.forEach(function (a, i) { a.classList.toggle('on', i === best); });
    // сами точки показываются вместе с плашкой — на первом экране их нет
    dots.classList.toggle('show', window.scrollY > window.innerHeight * 0.6);
  }

  paint();
  addEventListener('scroll', paint, { passive: true });
  addEventListener('resize', paint);
})();

/* Заголовок перепечатывает сам себя: «второй мозг» ⇄ «ИИ».
   Стирание быстрее печати — так живой человек и печатает.
   Долгая пауза на «второй мозг»: это наше слово, «ИИ» — только пояснение к нему. */
(function () {
  var live = document.getElementById('swapLive'), hold = document.querySelector('#swap .hold');
  if (!live) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Слова переехали из кода в разметку (data-words у #swap) 04.08.2026, когда
     появилась английская версия: скрипт у обеих страниц один, и зашитая в него
     русская пара печатала бы «второй мозг» поверх английского заголовка.
     Значение по умолчанию оставлено на случай, если атрибут забыли. */
  var swapBox = document.getElementById('swap');
  var words = ((swapBox && swapBox.dataset.words) || 'второй мозг|ИИ').split('|');
  var i = 0, ch = words[0].length, erasing = true;
  var caret = document.createElement('i');
  caret.className = 'caret';

  function draw(text) {
    live.textContent = text;
    live.appendChild(caret);
  }

  function tick() {
    var word = words[i], next = words[(i + 1) % words.length], delay;
    if (erasing) {
      ch--;
      draw(word.slice(0, ch));
      delay = 55;
      if (ch === 0) { erasing = false; i = (i + 1) % words.length; delay = 260; }
    } else {
      ch++;
      draw(words[i].slice(0, ch));
      delay = 95;
      if (ch === words[i].length) { erasing = true; delay = i === 0 ? 4200 : 1700; }
    }
    setTimeout(tick, delay);
  }
  draw(words[0]);
  setTimeout(tick, 2600);
})();

/* Появление вылетом */
(function () {
  var items = document.querySelectorAll('.rev');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  /* rootMargin снизу здесь стоял (-8%) — чтобы блок появлялся не в момент
     касания нижнего края, а чуть позже. Снят 04.08.2026: он срезал у зоны
     наблюдения 8% высоты ОКНА, и всё, что лежит к концу документа ближе
     этого среза, в зону не попадало никогда. На высоком мониторе (окно
     1267 px → срез 101 px) кнопка «Написать» в подвале, до конца страницы
     от которой 91 px, не появлялась вообще — Саша поймал 04.08. На ноутбуке
     баг не воспроизводится: срез меньше, и кнопка успевает войти в зону.
     Задержку теперь держит один threshold: блок показывается, войдя на 12%
     своей высоты. */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .12 });
  items.forEach(function (el) { io.observe(el); });
  /* Страховка от того же класса поломок: докрутили до самого низа — всё,
     что ещё не показалось, показываем. Наблюдатель мог не сработать не
     только из-за среза. */
  addEventListener('scroll', function () {
    if (innerHeight + scrollY < document.documentElement.scrollHeight - 4) return;
    document.querySelectorAll('.rev:not(.in)').forEach(function (el) { el.classList.add('in'); });
  }, { passive: true });
})();

/* Плашка приплывает, когда первый экран уехал */
(function () {
  var bar = document.getElementById('bar'), hero = document.getElementById('top');
  if (!bar || !hero) return;
  var io = new IntersectionObserver(function (entries) {
    bar.classList.toggle('show', !entries[0].isIntersecting);
  }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' });
  io.observe(hero);
})();

/* ══ Живые карточки — правки Саши 24.09.2026 ══════════════════════
   Всё ниже запускается, только когда карточка на экране, и замолкает,
   когда ушла: страница длинная, и крутить шесть циклов за кадром —
   батарея телефона за просто так. Без движения (reduce) — статичный кадр. */
(function () {
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function onView(el, run) {
    if (still || !('IntersectionObserver' in window)) return;
    var timer = null, on = false;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !on) { on = true; timer = run(); }
        else if (!e.isIntersecting && on) { on = false; if (timer && timer.stop) timer.stop(); }
      });
    }, { threshold: .35 }).observe(el);
  }
  function loop(fn, ms) {
    var id = setInterval(fn, ms); return { stop: function () { clearInterval(id); } };
  }

  /* Продукты: реплики и дела дня появляются по очереди */
  document.querySelectorAll('.three .shot').forEach(function (shot) {
    var steps = [].slice.call(shot.querySelectorAll('.step'));
    if (!steps.length) return;
    if (still || !('IntersectionObserver' in window)) { steps.forEach(function (s) { s.classList.add('on'); var li = s.closest('li'); if (li) li.classList.add('done'); }); return; }
    onView(shot, function () {
      var i = 0;
      function tick() {
        if (i < steps.length) {
          var s = steps[i++]; s.classList.add('on');
          var li = s.closest('li'); if (li && li.parentNode.classList.contains('p-day')) setTimeout(function () { li.classList.add('done'); }, 500);
        } else { steps.forEach(function (s) { s.classList.remove('on'); var li = s.closest('li'); if (li) li.classList.remove('done'); }); i = 0; }
      }
      tick();
      return loop(tick, 1300);
    });
  });

  /* Переписки: реплики набираются по одной, старые уезжают вверх */
  document.querySelectorAll('.chat[data-lines]').forEach(function (chat) {
    var lines = chat.getAttribute('data-lines').split('|').map(function (s) {
      return { us: s.charAt(0) === '>', t: s.slice(1) };
    });
    if (still) return;
    onView(chat, function () {
      chat.classList.add('live');
      chat.innerHTML = '';
      var i = 0, stopped = false, t1, t2;
      function add(el) {
        chat.appendChild(el);
        var m = chat.querySelectorAll('.msg:not(.out)');
        if (m.length > 3) { var old = m[0]; old.classList.add('out'); setTimeout(function () { old.remove(); }, 350); }
      }
      function next() {
        if (stopped) return;
        var l = lines[i % lines.length]; i++;
        var typ = document.createElement('div');
        typ.className = 'msg typing ' + (l.us ? 'us' : 'them');
        typ.innerHTML = '<i></i><i></i><i></i>';
        add(typ);
        t1 = setTimeout(function () {
          typ.classList.remove('typing'); typ.textContent = l.t;
          t2 = setTimeout(next, 1500);
        }, 900);
      }
      next();
      return { stop: function () { stopped = true; clearTimeout(t1); clearTimeout(t2); } };
    });
  });

  /* График смен: пустые клетки закрываются одна за другой */
  document.querySelectorAll('.shift').forEach(function (grid) {
    var gaps = [].slice.call(grid.querySelectorAll('.sh-row:not(.sh-head) i:not(.on):not(.fix)'));
    onView(grid, function () {
      var i = 0;
      return loop(function () {
        if (i < gaps.length) gaps[i++].classList.add('fill');
        else { gaps.forEach(function (g) { g.classList.remove('fill'); }); i = 0; }
      }, 1100);
    });
  });

  /* Главный бот: строка «чем занят» перепечатывается, отдел вспыхивает */
  document.querySelectorAll('.d-now[data-lines]').forEach(function (now) {
    var lines = now.getAttribute('data-lines').split('|');
    var cells = now.closest('.dia').querySelectorAll('.d-c.on');
    onView(now.closest('.shot'), function () {
      var i = 0, stopped = false, t;
      function type(s, k) {
        if (stopped) return;
        var p = s.split('#'), text = p[0], who = +p[1];
        now.textContent = text.slice(0, k);
        if (k < text.length) { t = setTimeout(function () { type(s, k + 1); }, 34); return; }
        if (cells[who]) { cells[who].classList.add('ping'); setTimeout(function () { cells[who].classList.remove('ping'); }, 1400); }
        t = setTimeout(function () { i++; type(lines[i % lines.length], 0); }, 2300);
      }
      type(lines[0], 0);
      return { stop: function () { stopped = true; clearTimeout(t); } };
    });
  });
})();
