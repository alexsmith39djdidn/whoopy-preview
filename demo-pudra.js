/* Живая Пудра на странице pudra.html (04.08.2026).
   Диалог разыгрывается сам — медленно, с паузами и «печатает». Скорость
   взята не с потолка: настоящий бот отвечает через 2-4 секунды, и именно
   эта задержка читается как собеседник. Мгновенный ответ выглядит формой.

   Писать ей нельзя (решение Саши 04.08.2026: «только демо, без возможности
   написать»). Раньше поле было, и за ним стоял сценарий по ключевым словам:
   на список вопросов он отвечал прилично, а на первый же вопрос вне списка
   выдавал себя. Показанный разговор честнее недоигранного — обещание
   «поговорите с ней», которое не выдерживает второго вопроса, обходится
   дороже, чем стоит сама возможность.

   ВАЖНО ПРО ЧЕСТНОСТЬ: здесь нет ни модели, ни базы клиента. Это запись
   разговора, и подпись под блоком говорит об этом прямо. Реплики Пудры —
   только то, что настоящая Пудра действительно делает: считает доставку,
   присылает QR по СБП, сама проверяет платёж, кладёт заказ в базу.        */

(function () {
  var chat = document.getElementById('demoChat');
  if (!chat) return;

  var slow = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollDown() {
    chat.scrollTo({ top: chat.scrollHeight, behavior: slow ? 'auto' : 'smooth' });
  }

  function bubble(who, text) {
    var el = document.createElement('div');
    el.className = 'msg ' + who;
    el.textContent = text;
    chat.appendChild(el);
    scrollDown();
    return el;
  }

  /* «печатает» живёт ровно столько, сколько занимает ответ: короткая реплика
     — короткая пауза. Так бот не выглядит одинаково задумчивым на «да» и на
     расчёт доставки */
  function typing() {
    var el = document.createElement('div');
    el.className = 'typing';
    el.innerHTML = '<i></i><i></i><i></i>';
    chat.appendChild(el);
    scrollDown();
    return el;
  }

  function pause(text) {
    if (slow) return 240;
    return Math.min(2600, 900 + String(text).length * 22);
  }

  function answer(text, after) {
    var t = typing();
    setTimeout(function () {
      t.remove();
      bubble('us', text);
      if (after) after();
    }, pause(text));
  }

  /* Разговор доведён до конца — до оплаченного заказа, лежащего в базе.
     Оборванный на середине («напишите адрес…») показывал вежливость бота,
     а владельцу нужно увидеть, что дело закрывается без него. */
  var SCRIPT = [
    { who: 'them', text: 'Здравствуйте! Хочу торт на субботу', wait: 900 },
    { who: 'us',   text: 'Здравствуйте. На сколько человек и какая начинка?' },
    { who: 'them', text: 'Человек на десять, шоколадный', wait: 2200 },
    { who: 'us',   text: 'Записала. Заберёте сами или привезти?' },
    { who: 'them', text: 'Привезите на Пресню', wait: 1800 },
    { who: 'us',   text: 'Курьером в субботу — 490 ₽. К оплате 4 890 ₽, отправляю QR.' },
    { who: 'them', text: 'Оплатила', wait: 2600 },
    { who: 'us',   text: 'Вижу оплату. Заказ уже у кондитера — напишу, когда будет готов.' }
  ];

  function play(i) {
    if (i >= SCRIPT.length) return;
    var step = SCRIPT[i];
    if (step.who === 'them') {
      setTimeout(function () {
        bubble('them', step.text);
        play(i + 1);
      }, slow ? 300 : (step.wait || 1200));
    } else {
      answer(step.text, function () { play(i + 1); });
    }
  }

  /* Старт не с загрузки страницы, а когда блок увидели: иначе разговор
     кончится до того, как посетитель до него доскроллит */
  var seen = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting && !seen) {
        seen = true;
        play(0);
        io.disconnect();
      }
    });
  }, { threshold: 0.35 });
  io.observe(chat);
})();

/* Конвейер главных функций: анимации внутри панелей включаются, только пока
   панель на экране. Три бесконечных цикла, крутящихся за пределами окна, —
   это впустую сожжённая батарея у человека, который читает другой абзац. */
(function () {
  var items = document.querySelectorAll('.belt-item');
  if (!items.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      en.target.classList.toggle('live', en.isIntersecting);
    });
  }, { threshold: 0.4 });
  items.forEach(function (el) { io.observe(el); });
})();
