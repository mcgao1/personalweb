(function () {
  const body = document.body;
  const universe = document.getElementById('universe');
  const planetSurface = document.getElementById('planet-surface');
  const mainCharacter = document.getElementById('main-character');
  const hint = document.getElementById('hint');
  const tooltip = document.getElementById('tooltip');
  const replayBtn = document.getElementById('replay-intro');
  const note = document.getElementById('monster-note');
  const noteCopy = document.getElementById('note-copy');
  const noteHit = noteCopy.parentElement;
  const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
  let chinese = document.documentElement.lang === 'zh-Hans';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function translatedNotes() {
    return [
      SiteLanguage.text("Sometimes I think we might have met somewhere else already. Something that flashes through your mind could be happening in another layer of space. Usually the two carry on separately. Then something sparks in your head, or a feeling comes on too strong, and they brush against each other. Maybe they overlap just enough for you to catch a sight, a sound, or a smell you can’t place.", "我有时候想，我们说不定已经在别的空间碰过面。脑子里一闪而过的事，可能正在另一层空间里发生。平时两边各过各的，偶尔脑子里啪地闪了一下，或者某种情绪来得太猛，两层空间就擦到一起。也许只重合了那么一小块，刚好够你看见一个画面，听到一点声音，或者闻到一股不知道从哪儿来的气味。"),
      SiteLanguage.text("Nothing much happens in my imaginary golden age. I get on a tram at dusk and watch the neon lights go by. I know I’m wasting time. I still want the tram to go two more stops.", "我想象中的黄金时代，其实也没什么大事。傍晚坐上电车，霓虹灯一路闪过去。明知道在浪费时间，还是希望这车多开两站。"),
      SiteLanguage.text("As a kid I thought blue and white tie-dye was a little boring. Then someone put a vase of yellow peonies on the table, and suddenly that cloth was beautiful. I’d love to see the moment the threads come out, when the fabric still holds all those creases.", "小时候嫌扎染只有蓝和白，后来桌上摆了一瓶黄芍药，才发现那块布原来那么好看。更想看的是拆线那一下，布上还留着刚才被扎紧的褶子。"),
      SiteLanguage.text("Working on my thesis was the first time I’d read about Kunming so formally, in academic papers. Somewhere along the way I realised I was a little homesick.", "写论文的时候，第一次在文献里这么正式地读昆明。读着读着，才发现自己有点想家了。"),
      SiteLanguage.text("I came across ‘tourism carrying capacity’ while studying and wondered if people have one too. How many things, how many words, and how many ‘no, it’s fine, go on’s can a person fit into one day?", "背书背到「旅游容量」，突然想知道人有没有一种类似的容量。一天能装多少事，多少话，以及多少句「没事，你继续说」。"),
      SiteLanguage.text("The new computer is a little too clean. I went looking for one file and ended up reading something I wrote years ago. Still no file. Apparently I used to have a lot of fun writing.", "新电脑干净得有点过分。只是想找一份文件，最后翻出几年前的小作文。文件还是没找到，倒是发现那时候的我写东西挺来劲。"),
      SiteLanguage.text("A song changes one pronoun. One line ago I was listening to somebody else’s story. Now it feels like the singer’s talking to me. A tiny word with a knack for stealing the scene.", "一首歌只换了一个代词，原来还在听别人的故事，下一句就好像唱到我这里来了。这么小一个词，挺会抢戏的。"),
      SiteLanguage.text("Eight and a half hours. In my head it takes less than eight seconds to go by.", "八个半小时，脑子一过也仅仅是八秒不到的回忆。"),
      SiteLanguage.text("Sometimes I wish I could borrow that easy confidence of someone who goes out in old shoes. I’ve already lost a few minutes just deciding whether to change mine.", "有时候真想借一点那种穿旧鞋出门也很自在的劲儿。我出门前光是想要不要换双鞋，就已经耽误了好几分钟。"),
      SiteLanguage.text("At my computer, I sort through news articles and put each emotion in a column. A song comes on and I sit there staring for a while. When it’s my turn, I can’t say which column I’d go in.", "对着电脑改代码，新闻一条条地筛，情绪也一条条地分。中途听到一首歌，坐在那里愣了半天。轮到我自己的时候，倒说不出该分到哪一栏。"),
      SiteLanguage.text("Brown leather boots, florals, checks, stripes. Each looks fairly composed on its own. Put them together and they start arguing. I stood there looking at the pile for a while and still wanted to wear all of it.", "咖色皮靴、碎花、格子、条纹。单看每一件都挺稳重，摆在一起就开始吵架。我对着这堆衣服看了半天，还是觉得都想穿。"),
      SiteLanguage.text("The perfume is called ‘Fresh Water’. Easy enough to remember. To me, fresh is a breeze coming straight at you on a summer night. To somebody else it might be just out of the shower. So whose fresh is in this bottle?", "香水叫「清新之水」，名字倒是好记。问题是我想到的清新是夏夜迎面的一阵风，别人想到的可能是刚洗完澡。那这一瓶到底算谁的清新？"),
      SiteLanguage.text("A harbour in the rain is hard to pin down. There’s solid ground under my feet, but if I look out long enough I feel myself sway with the boats.", "雨里的港口有点说不清。脚底下明明是结实的地，往外多看几眼，就觉得自己也跟着那些船晃了一下。"),
      SiteLanguage.text("Sometimes I pick up something I barely noticed at the time and call it foreshadowing. Writers get to do that, so I can too. Back then, though, I genuinely had no idea.", "我有时候会把以前完全没留意的事捡回来，当成伏笔。写故事的人可以这么干，我也可以。但当时的我是真的什么都没看出来。"),
      SiteLanguage.text("The drawing in my head is just about ready for the museum. The one on the page is still working on a straight line.", "脑子里那张画都快挂进美术馆了。低头一看，手上这张还在努力画直线。"),
      SiteLanguage.text("A lot of the time, when I want something, when I really, really want it, I actually end up getting it.", "很多时候，我想要一件东西，非常非常想要一件东西，我就真的会得到它。"),
      SiteLanguage.text("Life somewhere new is still a jumble in my head. My taste buds, meanwhile, have already worked out a routine. Sweet, sour, bitter, spicy. I taste them without really thinking about it. Somewhere in there, a life takes shape.", "在异乡生活，脑子还没理出什么头绪，味觉倒是先整理出了一套生活方式。酸甜苦辣不用刻意感知，不经意间尝到了，便是生活。"),
      SiteLanguage.text("I watch a horror film and think about the suspension bridge effect at the same time. My brain is still working out why my heart is racing. My hand’s already turned the volume down. That can come first.", "一边看恐怖片，一边想吊桥效应。脑子还在很认真地分析心跳到底怎么回事，手已经把音量调小了。反正先调小再说。"),
      SiteLanguage.text("Some relationships are perfectly comfortable as they are. It’s usually when someone asks ‘so what are you two?’ that I start giving it serious thought. After a minute or so I usually let it go.", "有些关系待在原来的样子就很舒服。倒是每次有人问「所以你们到底算什么」，我才开始认真考虑这个问题。一般考虑一会儿，又觉得算了。"),
      SiteLanguage.text("I’d almost worked out what happened. Then I thought about it a bit more. Still a little weird, actually.", "我都快把这件事分析明白了。后来又想了想，还是有点邪门。")
    ];
  }
  let notes = translatedNotes();

  const hoverNotes = {
    bachelor: SiteLanguage.text('old notes grew a flower.', "旧笔记长出了一朵花。"),
    master: SiteLanguage.text('this one keeps wandering.', "这一朵还在到处走。"),
    ghost: SiteLanguage.text('not yet.', "还没开放。")
  };

  const leafColors = {
    bachelor: ['#8a5a17', '#b3791f', '#ff7a2b', '#ff9a3d', '#ffd45b', '#ffe19a'],
    master: ['#0d5462', '#128995', '#1eb5c5', '#47d2cd', '#148f43', '#7edc68']
  };

  let remainingNotes = [];
  let noteFadeTimer = null;
  let noteAutoTimer = null;
  let wheelDelta = 0;

  if (reduceMotion) body.classList.add('no-motion');

  function setStage(stage) {
    body.className = reduceMotion ? stage + ' no-motion' : stage;
  }

  function setHint(text) {
    hint.textContent = text;
    hint.classList.toggle('visible', !!text);
  }

  function enterClose() {
    if (body.classList.contains('stage-close')) return;
    setStage('stage-close');
    setHint(SiteLanguage.text('pick a flower to open my work', "挑一朵花，看看里面的项目"));
    body.classList.add('tags-peek');
    clearTimeout(enterClose.peekTimer);
    enterClose.peekTimer = setTimeout(function () { body.classList.remove('tags-peek'); }, 4200);
    note.tabIndex = 0;
    showNote();
  }

  function resetHome() {
    setStage('stage-distant');
    setHint(SiteLanguage.text('come closer', "再靠近一点"));
    hideTooltip();
    stopNotes();
    noteCopy.textContent = '';
    note.tabIndex = -1;
  }

  function stopNotes() {
    clearTimeout(noteFadeTimer);
    clearTimeout(noteAutoTimer);
    note.classList.remove('is-appearing', 'is-fading');
  }

  function drawNote() {
    if (!remainingNotes.length) {
      remainingNotes = [...notes];
      const previousIndex = remainingNotes.indexOf(noteCopy.textContent);
      if (previousIndex !== -1) {
        remainingNotes.splice(previousIndex, 1);
        const index = Math.floor(Math.random() * remainingNotes.length);
        const first = remainingNotes.splice(index, 1)[0];
        remainingNotes.push(noteCopy.textContent);
        return first;
      }
    }

    const index = Math.floor(Math.random() * remainingNotes.length);
    return remainingNotes.splice(index, 1)[0];
  }

  function noteLength(text) {
    return chinese ? text.length * 2.6 : text.length;
  }

  function renderNote(text) {
    const tokens = text.match(chinese ? /[「『（“]?[^\s][，。？！、」』）”……；：]*|\s+/gu : /\S+|\s+/gu);
    const fragment = document.createDocumentFragment();
    let glyphIndex = 0;

    for (const token of tokens) {
      if (!token.trim()) {
        fragment.append(token);
        continue;
      }

      const piece = document.createElement('span');
      piece.className = 'note-piece';
      for (const character of token) {
        const glyph = document.createElement('span');
        glyph.className = 'note-glyph';
        glyph.dataset.cut = glyphIndex++ % 7;
        glyph.textContent = character;
        piece.appendChild(glyph);
      }
      fragment.appendChild(piece);
    }

    noteCopy.replaceChildren(fragment);
    noteCopy.classList.toggle('note-dense', noteLength(text) > 175);
  }

  function staggerLines() {
    const rows = new Map();
    const stripStyles = [[.06, -.16], [1.28, .12], [.42, -.07], [1.88, -.12], [.19, .15], [.94, .05], [.56, -.15]];
    const spread = parseFloat(getComputedStyle(note).getPropertyValue('--note-spread'));

    noteCopy.classList.add('is-measuring');
    for (const piece of noteCopy.children) {
      const { offsetTop, offsetLeft, offsetWidth } = piece;
      if (!rows.has(offsetTop)) rows.set(offsetTop, []);
      rows.get(offsetTop).push({ piece, center: offsetLeft + offsetWidth / 2 });
    }
    noteCopy.classList.remove('is-measuring');

    Array.from(rows.values()).forEach(function (pieces, row) {
      const [indent, slant] = stripStyles[row % stripStyles.length];
      const left = pieces[0].center;
      const span = Math.max(1, pieces.at(-1).center - left);
      pieces.forEach(function ({ piece, center }, index) {
        const position = pieces.length === 1 ? 0 : (center - left) / span * 2 - 1;
        const tilt = slant * 11 + (index % 3 - 1) * .7;
        piece.style.setProperty('--note-row-offset', indent * spread + 'em');
        piece.style.setProperty('--note-piece-lift', (position * slant * spread) + 'em');
        piece.style.setProperty('--note-piece-angle', (tilt * spread) + 'deg');
      });
    });
  }

  function fitNote() {
    if (!noteCopy.textContent) return;

    let low = 13;
    const largest = parseFloat(getComputedStyle(note).fontSize);
    const length = noteLength(noteCopy.textContent);
    const scaled = largest * Math.sqrt(72 / Math.max(72, length));
    let high = Math.floor(Math.min(largest, Math.max(15, largest * .70, scaled)));
    while (low < high) {
      const size = Math.ceil((low + high) / 2);
      noteCopy.style.setProperty('--note-size', size + 'px');
      if (noteCopy.offsetHeight <= note.clientHeight) low = size;
      else high = size - 1;
    }
    noteCopy.style.setProperty('--note-size', low + 'px');
    staggerLines();
  }

  function magnifyNearbyLetters(event) {
    if (reduceMotion || !hoverCapable.matches || event.pointerType === 'touch') return;

    const radius = Math.min(53, Math.max(32, window.innerWidth * .04));
    const rightEdge = mainCharacter.getBoundingClientRect().left - 6;
    const glyphs = [...noteCopy.querySelectorAll('.note-glyph')];
    const scales = glyphs.map(glyph => {
      const { x, y, width, height } = glyph.getBoundingClientRect();
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const distance = Math.hypot(centerX - event.clientX, centerY - event.clientY);
      const proximity = Math.max(0, 1 - distance / radius);
      const clearance = Math.min(centerX - 4, rightEdge - centerX);
      return Math.max(1, Math.min(1 + .45 * proximity ** 2, 2 * clearance / glyph.offsetWidth));
    });

    glyphs.forEach((glyph, index) => {
      const scale = scales[index].toFixed(2);
      const value = scale === '1.00' ? '' : scale;
      if (glyph.style.getPropertyValue('--note-magnification') !== value) {
        glyph.style.setProperty('--note-magnification', value);
      }
    });
  }

  function showNote() {
    stopNotes();
    const text = drawNote();
    renderNote(text);
    fitNote();

    if (!reduceMotion) {
      void noteCopy.offsetWidth;
      note.classList.add('is-appearing');
      scheduleNextNote();
    }
  }

  function scheduleNextNote() {
    clearTimeout(noteAutoTimer);
    if (reduceMotion || !noteCopy.textContent || note.classList.contains('is-fading')) return;
    if (note.matches(':focus-visible') || (hoverCapable.matches && noteHit.matches(':hover'))) return;

    const length = noteLength(noteCopy.textContent);
    const readingTime = Math.min(42000, Math.max(8500, 4200 + length * 100));
    noteAutoTimer = window.setTimeout(nextNote, readingTime);
  }

  function nextNote() {
    if (!body.classList.contains('stage-close') || note.classList.contains('is-fading')) return;
    if (reduceMotion) {
      showNote();
      return;
    }

    noteCopy.style.setProperty('--note-fade-from', getComputedStyle(noteCopy).opacity);
    stopNotes();
    note.classList.add('is-fading');
    noteFadeTimer = window.setTimeout(showNote, 460);
  }

  function showTooltip(text, x, y) {
    tooltip.textContent = text;
    tooltip.style.left = x + 16 + 'px';
    tooltip.style.top = y - 8 + 'px';
    tooltip.classList.add('visible');
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
  }

  function setTemporaryNote() {
    window.clearTimeout(setTemporaryNote.timer);
  }

  function spawnLeaf(x, y, size, palette) {
    const el = document.createElement('div');
    el.className = 'leaf-particle';
    el.style.width = size + 'px';
    el.style.height = (size * 0.55) + 'px';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.background = palette[Math.floor(Math.random() * palette.length)];
    document.body.appendChild(el);
    return el;
  }

  function burstFrom(el, palette) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.28;

    for (let i = 0; i < 44; i++) {
      const leaf = spawnLeaf(cx, cy, 11 + Math.random() * 19, palette);
      const angle = Math.random() * Math.PI * 2;
      const dist = 140 + Math.random() * 390;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 80;
      const rot = Math.random() * 700 - 350;
      const scale = 0.6 + Math.random() * 0.9;
      const anim = leaf.animate([
        { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg) scale(' + scale + ')', opacity: 0 }
      ], { duration: 620 + Math.random() * 280, easing: 'cubic-bezier(0.2,0.7,0.3,1)' });
      anim.onfinish = function () { leaf.remove(); };
    }
  }

  function wireTooltip(el, noteText) {
    el.addEventListener('pointerenter', function (event) {
      if (!body.classList.contains('stage-close')) return;
      showTooltip(el.dataset.label || '', event.clientX, event.clientY);
      setTemporaryNote(noteText);
    });

    el.addEventListener('pointermove', function (event) {
      if (!body.classList.contains('stage-close')) return;
      showTooltip(el.dataset.label || '', event.clientX, event.clientY);
    });

    el.addEventListener('pointerleave', hideTooltip);
  }

  function openFlowerPortal(dest, flower) {
    if (document.querySelector('.flower-portal')) return;

    const { left, top, width, height } = flower.querySelector('.flower-hitzone').getBoundingClientRect();
    const portal = document.createElement('div');
    portal.className = 'flower-portal';
    portal.classList.toggle('bachelor-world', flower.classList.contains('flower-bachelor'));
    portal.setAttribute('aria-hidden', 'true');
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 12;
    portal.style.setProperty('--portal-x', x + 'px');
    portal.style.setProperty('--portal-y', y + 'px');
    portal.style.setProperty('--portal-radius', radius + 'px');
    document.body.appendChild(portal);
    window.setTimeout(function () { window.location.href = dest; }, 650);
  }

  window.addEventListener('pageshow', function () {
    document.querySelector('.flower-portal')?.remove();
  });

  function wireEntry(el, paletteName, noteText) {
    el.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      event.stopPropagation();

      if (!body.classList.contains('stage-close')) {
        enterClose();
        return;
      }

      const dest = SiteLanguage.url(el.getAttribute('href'));
      if (!reduceMotion) {
        openFlowerPortal(dest, el);
      } else {
        window.location.href = dest;
      }
    });
  }

  universe.addEventListener('click', function () {
    if (body.classList.contains('stage-distant')) enterClose();
  });

  planetSurface.addEventListener('click', function (event) {
    if (event.target.closest('.garden-entry') || event.target.closest('.planet-region')) return;
    event.stopPropagation();
    enterClose();
  });

  mainCharacter.addEventListener('click', function (event) {
    event.stopPropagation();
    enterClose();
  });

  document.querySelectorAll('.flower-entry').forEach(function (el) {
    const paletteName = el.classList.contains('flower-bachelor') ? 'bachelor' : 'master';
    const noteText = paletteName === 'bachelor' ? hoverNotes.bachelor : hoverNotes.master;
    wireEntry(el, paletteName, noteText);
  });

  document.querySelectorAll('.planet-region').forEach(function (el) {
    wireTooltip(el, hoverNotes.ghost);
    el.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (!body.classList.contains('stage-close')) {
        enterClose();
        return;
      }
      setTemporaryNote(hoverNotes.ghost);
    });
  });

  replayBtn.addEventListener('click', function () {
    resetHome();
  });

  noteHit.addEventListener('pointerenter', function (event) {
    magnifyNearbyLetters(event);
    scheduleNextNote();
  });
  noteHit.addEventListener('pointermove', magnifyNearbyLetters);
  noteHit.addEventListener('pointerleave', function () {
    for (const glyph of noteCopy.querySelectorAll('.note-glyph[style]')) {
      glyph.style.removeProperty('--note-magnification');
    }
    scheduleNextNote();
  });
  note.addEventListener('focus', scheduleNextNote);
  note.addEventListener('blur', scheduleNextNote);

  note.addEventListener('click', function (event) {
    event.stopPropagation();
    nextNote();
  });

  note.addEventListener('keydown', function (event) {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    nextNote();
  });

  document.addEventListener('site-language-change', function () {
    const currentIndex = notes.indexOf(noteCopy.textContent);
    const remainingIndices = remainingNotes.map(text => notes.indexOf(text));
    notes = translatedNotes();
    remainingNotes = remainingIndices.map(index => notes[index]);
    chinese = document.documentElement.lang === 'zh-Hans';
    setHint(body.classList.contains('stage-close')
      ? SiteLanguage.text('pick a flower to open my work', '挑一朵花，看看里面的项目')
      : SiteLanguage.text('come closer', '再靠近一点'));
    hideTooltip();
    if (currentIndex !== -1) {
      clearTimeout(noteFadeTimer);
      note.classList.remove('is-fading');
      renderNote(notes[currentIndex]);
      fitNote();
      scheduleNextNote();
    }
  });

  const cockpit = document.getElementById('cockpit');
  function enterCockpit() {
    cockpit.scrollTop = 0;
    body.classList.add('cockpit-open');
  }

  document.querySelector('.cockpit-enter').addEventListener('click', enterCockpit);

  window.addEventListener('wheel', function (event) {
    if (body.classList.contains('cockpit-open') && (event.deltaY >= 0 || cockpit.scrollTop > 1)) return;
    wheelDelta += event.deltaY;

    if (wheelDelta < -45) {
      wheelDelta = 0;
      if (body.classList.contains('cockpit-open')) body.classList.remove('cockpit-open');
      else enterClose();
    } else if (wheelDelta > 45 && body.classList.contains('stage-close')) {
      wheelDelta = 0;
      enterCockpit();
    }
  }, { passive: true });

  document.addEventListener('keydown', function (event) {
    if (event.defaultPrevented || event.target.closest?.('a, button, input, select, textarea')) return;
    if (event.key !== ' ' && event.key !== 'Enter') return;
    if (!body.classList.contains('stage-distant')) return;
    event.preventDefault();
    enterClose();
  });

  new ResizeObserver(fitNote).observe(note);
  document.fonts.ready.then(fitNote);
  resetHome();
})();
