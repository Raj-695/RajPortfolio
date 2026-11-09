(() => {
  const data = window.PORTFOLIO;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const media = id => ({ poster: `assets/posters/${id}.jpg`, preview: `assets/previews/${id}.mp4`, video: `assets/video/${id}.mp4` });
  const pad = n => String(n).padStart(2, '0');
  const fmt = s => (s = Math.max(0, Math.floor(s || 0)), `${Math.floor(s / 60)}:${pad(s % 60)}`);
  const secs = d => d.split(':').reduce((a, n) => a * 60 + +n, 0);
  const SHOW = 8; // reels shown before "Show all"
  document.documentElement.classList.add('js');

  /* ---------- contact ---------- */
  $('#year').textContent = new Date().getFullYear();
  const mail = $('#mail');
  mail.textContent = data.email;
  mail.href = $('#contact-email').href = `mailto:${data.email}`;
  const wa = data.socials.find(s => s.label === 'WhatsApp');
  $('#contact-wa').href = wa.url;
  $('#socials').innerHTML = data.socials.map(s =>
    `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer"><b>${s.label}</b><span>${s.handle}</span><i aria-hidden="true">↗</i></a></li>`).join('');
  const toast = $('#toast');
  const say = msg => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('show'), 1800); };
  $('#copy-email').addEventListener('click', () => {
    (navigator.clipboard ? navigator.clipboard.writeText(data.email) : Promise.reject())
      .then(() => say('Email copied'), () => say(data.email));
  });
  // local time, so clients abroad know when I'll answer
  const clock = $('#clock');
  const clockFmt = new Intl.DateTimeFormat('en-US', { timeZone: data.timezone, hour: 'numeric', minute: '2-digit' });
  const tickClock = () => { clock.innerHTML = `<i class="dot" aria-hidden="true"></i>It’s ${clockFmt.format(new Date())} in ${data.city}, Nepal right now.`; };
  tickClock(); setInterval(tickClock, 30000);

  /* ---------- nav ---------- */
  const nav = $('#nav'), links = $('#nav-links'), menuBtn = $('.menu-btn');
  const setMenu = open => { nav.classList.toggle('menu-open', open); menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const navLinks = $$('a', links);
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('is-here', a.getAttribute('href') === `#${e.target.id}`));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['work', 'animation', 'experience', 'services', 'contact'].forEach(id => spy.observe(document.getElementById(id)));

  /* ---------- numbers + clients ---------- */
  $('#stats').innerHTML = data.stats.map(s =>
    `<li class="reveal"><b data-n="${s.n}">${s.n}</b>${s.plus ? '<sup>+</sup>' : ''}<span>${s.label}</span></li>`).join('');
  $('#clients').innerHTML = data.clients.map(c => `<li><b>${c.name}</b><span>${c.note}</span></li>`).join('');

  /* ---------- work cards ---------- */
  const projects = data.projects;
  const cards = new Map();
  const playIcon = '<svg viewBox="0 0 20 22" aria-hidden="true"><path d="M2 1.5l16.5 9.5L2 20.5z" fill="currentColor"/></svg>';

  projects.forEach((p, i) => {
    const m = media(p.id);
    const card = document.createElement('article');
    card.className = `card ${p.featured ? 'featured' : p.format}`;
    card.dataset.id = p.id; card.dataset.cat = p.cat;
    const frame = `
      <div class="frame" tabindex="0" role="button" aria-label="Play ${p.title}, ${p.client}, ${p.duration}">
        <img src="${m.poster}" alt="" loading="${p.featured || i < 5 ? 'eager' : 'lazy'}" decoding="async">
        <span class="dur">${p.duration}</span>
        <span class="play">${playIcon}</span>
      </div>`;
    const tags = `<ul class="tags">${p.role.split(' · ').map(r => `<li>${r}</li>`).join('')}</ul>`;
    card.innerHTML = p.featured ? `${frame}
      <div class="feat-info">
        <p class="kicker">Featured · Long-form interview</p>
        <h3>${p.title}</h3>
        <p class="client">${p.client}</p>
        <p class="summary">${p.summary}</p>
        ${tags}
        <button type="button" class="btn btn-light feat-play"><span class="tri" aria-hidden="true"></span>Play the first minute</button>
        ${p.excerpt ? `<p class="excerpt">${p.excerpt}</p>` : ''}
      </div>` : `${frame}
      <div class="meta">
        <p class="client">${p.client}${p.sound ? ' · <em>headphones on</em>' : ''}</p>
        <h3>${p.title}</h3>
        <p class="summary">${p.summary}</p>
        ${tags}
      </div>`;
    $(p.featured ? '#featured' : p.group === 'film' ? '#grid-film' : '#grid-reel').append(card);
    cards.set(p.id, card);

    const f = $('.frame', card);
    f.addEventListener('click', () => { if (!card.classList.contains('playing')) play(card, p); });
    f.addEventListener('keydown', e => {
      if (e.target !== f || card.classList.contains('playing')) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(card, p); }
    });
    $('.feat-play', card)?.addEventListener('click', () => play(card, p));
  });

  /* ---------- filters + show all ---------- */
  const grid = $('#grid-reel'), more = $('#more');
  const reelCards = $$('.card', grid);
  let cat = 'all', expanded = false;
  const layout = () => {
    const match = reelCards.filter(c => cat === 'all' || c.dataset.cat === cat);
    reelCards.forEach(c => { c.hidden = true; });
    match.forEach((c, i) => { c.hidden = !expanded && i >= SHOW; });
    const hiddenN = match.length - SHOW;
    more.hidden = expanded || hiddenN <= 0;
    more.textContent = `Show all ${match.length} reels`;
    reelCards.forEach(c => { if (c.hidden) $('video.full', c)?.pause(); });
  };
  $$('#filters .chip').forEach(b => b.addEventListener('click', () => {
    $$('#filters .chip').forEach(o => { o.classList.toggle('is-on', o === b); o.setAttribute('aria-selected', o === b); });
    cat = b.dataset.cat; expanded = cat !== 'all'; layout();
  }));
  more.addEventListener('click', () => { expanded = true; layout(); });
  layout();

  /* ---------- in-card player with editor keys ---------- */
  let active = null; // { card, v }

  function play(card, p) {
    let v = $('video.full', card);
    if (!v) v = buildPlayer(card, p);
    v.play().catch(() => {});
  }

  function buildPlayer(card, p) {
    stopPreview(card);
    const frame = $('.frame', card);
    const v = document.createElement('video');
    v.className = 'full';
    Object.assign(v, { playsInline: true, preload: 'auto', poster: media(p.id).poster, src: media(p.id).video });
    v.setAttribute('aria-label', `${p.title} video`);
    const ui = document.createElement('div');
    ui.className = 'pl';
    ui.innerHTML = `
      <div class="pl-flash" aria-hidden="true"></div>
      <div class="pl-bar">
        <button type="button" class="pl-btn pl-toggle" aria-label="Pause"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="i-play" d="M5 3l12 7-12 7z"/><path class="i-pause" d="M5 3h3.5v14H5zM11.5 3H15v14h-3.5z"/></svg></button>
        <span class="pl-time">0:00 <i>/ ${p.duration}</i></span>
        <div class="pl-scrub"><div class="pl-buf"></div><div class="pl-done"></div><input type="range" min="0" max="1000" value="0" step="1" aria-label="Seek"></div>
        <button type="button" class="pl-btn pl-mute" aria-label="Mute"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z"/><path class="i-on" d="M13 6.5c1.9 1.9 1.9 5.1 0 7M15.3 4.3c3.1 3.1 3.1 8.3 0 11.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path class="i-off" d="M13 7.5l5 5M18 7.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
        <button type="button" class="pl-btn pl-fs" aria-label="Full screen"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></button>
      </div>`;
    frame.append(v, ui);
    card.classList.add('playing');
    frame.removeAttribute('role'); frame.removeAttribute('aria-label');

    const range = $('input', ui), done = $('.pl-done', ui), buf = $('.pl-buf', ui), time = $('.pl-time', ui);
    const toggle = $('.pl-toggle', ui), mute = $('.pl-mute', ui);
    let seeking = false;
    const sync = () => {
      const d = v.duration || secs(p.duration);
      const r = d ? v.currentTime / d : 0;
      done.style.transform = `scaleX(${r})`;
      if (!seeking) range.value = Math.round(r * 1000);
      time.innerHTML = `${fmt(v.currentTime)} <i>/ ${fmt(d)}</i>`;
    };
    v.addEventListener('timeupdate', sync);
    v.addEventListener('progress', () => { if (v.duration && v.buffered.length) buf.style.transform = `scaleX(${v.buffered.end(v.buffered.length - 1) / v.duration})`; });
    v.addEventListener('play', () => {
      $$('video.full').forEach(o => { if (o !== v) o.pause(); });
      active = { card, v };
      card.classList.remove('paused'); toggle.setAttribute('aria-label', 'Pause');
    });
    v.addEventListener('pause', () => { card.classList.add('paused'); toggle.setAttribute('aria-label', 'Play'); v.playbackRate = 1; });
    v.addEventListener('ended', () => card.classList.add('paused'));
    v.addEventListener('volumechange', () => { card.classList.toggle('muted', v.muted); mute.setAttribute('aria-label', v.muted ? 'Unmute' : 'Mute'); });
    v.addEventListener('click', () => { v.paused ? v.play() : v.pause(); });
    v.addEventListener('dblclick', () => fullscreen(card));
    toggle.addEventListener('click', () => { v.paused ? v.play() : v.pause(); });
    mute.addEventListener('click', () => { v.muted = !v.muted; });
    $('.pl-fs', ui).addEventListener('click', () => fullscreen(card));
    range.addEventListener('input', () => { seeking = true; if (v.duration) v.currentTime = range.value / 1000 * v.duration; sync(); });
    range.addEventListener('change', () => { seeking = false; });
    // controls hide while the video plays and the pointer rests
    let idle;
    const wake = () => { card.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => { if (!v.paused) card.classList.add('idle'); }, 2200); };
    frame.addEventListener('pointermove', wake); v.addEventListener('play', wake); frame.addEventListener('focusin', wake);
    return v;
  }

  function fullscreen(card) {
    const f = $('.frame', card), v = $('video.full', card);
    if (document.fullscreenElement) return document.exitFullscreen();
    if (f.requestFullscreen) f.requestFullscreen().catch(() => {});
    else if (v?.webkitEnterFullscreen) v.webkitEnterFullscreen(); // iPhone
  }

  const flash = text => {
    if (!active) return;
    const el = $('.pl-flash', active.card);
    el.textContent = text; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  };
  document.addEventListener('keydown', e => {
    if (!active || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('input:not([type=range]), textarea, select')) return;
    const { v } = active, k = e.key.toLowerCase();
    // only take the keys while the video is on screen
    const r = active.card.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const stepF = 1 / 30;
    const map = {
      k: () => { v.pause(); v.playbackRate = 1; flash('❚❚'); },
      ' ': () => { if (e.target.closest('button')) return 'skip'; v.paused ? (v.play(), flash('▶')) : (v.pause(), flash('❚❚')); },
      l: () => { if (v.paused) { v.playbackRate = 1; v.play(); flash('▶'); } else { v.playbackRate = v.playbackRate >= 2 ? 1 : v.playbackRate + .5; flash(`▶▶ ${v.playbackRate}×`); } },
      j: () => { v.currentTime = Math.max(0, v.currentTime - 5); flash('◀◀ 5s'); },
      arrowleft: () => { v.currentTime = Math.max(0, v.currentTime - 5); flash('◀◀ 5s'); },
      arrowright: () => { v.currentTime = Math.min(v.duration || 1e9, v.currentTime + 5); flash('5s ▶▶'); },
      ',': () => { v.pause(); v.currentTime = Math.max(0, v.currentTime - stepF); flash('−1 frame'); },
      '.': () => { v.pause(); v.currentTime += stepF; flash('+1 frame'); },
      m: () => { v.muted = !v.muted; flash(v.muted ? 'Muted' : 'Sound on'); },
      f: () => fullscreen(active.card)
    };
    if (e.target.matches('input[type=range]') && (k === 'arrowleft' || k === 'arrowright')) return;
    if (map[k] && map[k]() !== 'skip') e.preventDefault();
  });

  // pause a playing video once it scrolls away
  const offscreen = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) $('video.full', e.target)?.pause();
  }), { threshold: 0 });
  cards.forEach(c => offscreen.observe(c));

  /* ---------- hover previews (desktop) / in-view previews (touch) ---------- */
  const startPreview = card => {
    if (card.classList.contains('playing') || card.hidden) return;
    const frame = $('.frame', card);
    let v = $('video.pv', frame);
    if (!v) {
      v = document.createElement('video');
      v.className = 'pv';
      Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'auto', src: media(card.dataset.id).preview });
      v.setAttribute('aria-hidden', 'true');
      frame.insertBefore(v, $('.dur', frame));
    }
    v.play().then(() => { if (!card.classList.contains('playing')) card.classList.add('previewing'); }).catch(() => {});
  };
  const stopPreview = card => { card.classList.remove('previewing'); $('video.pv', card)?.pause(); };
  if (!reduced) {
    if (finePointer) {
      cards.forEach(c => { const f = $('.frame', c); f.addEventListener('mouseenter', () => startPreview(c)); f.addEventListener('mouseleave', () => stopPreview(c)); });
    } else {
      const io = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting ? startPreview(e.target) : stopPreview(e.target)), { threshold: .75 });
      cards.forEach(c => { if (!c.classList.contains('featured')) io.observe(c); });
    }
  }

  function goTo(p) {
    const card = cards.get(p.id);
    if (card.hidden) { cat = 'all'; expanded = true; $$('#filters .chip').forEach(o => { const on = o.dataset.cat === 'all'; o.classList.toggle('is-on', on); o.setAttribute('aria-selected', on); }); layout(); }
    $('.frame', card).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    play(card, p);
  }

  /* ---------- hero: slow wall of reels ---------- */
  {
    const reels = projects.filter(p => p.format === 'tall' && p.cat !== 'personal');
    const tile = p => `<button type="button" class="tile" data-id="${p.id}" aria-label="Play ${p.title}, ${p.client}">
      <img src="${media(p.id).poster}" alt="" decoding="async">
      <video muted loop playsinline preload="none" data-src="${media(p.id).preview}" aria-hidden="true"></video>
      <span class="tile-cap"><b>${p.title}</b><span>${p.client.split(' · ')[0]}</span></span></button>`;
    const wall = $('#wall');
    // two identical halves scroll seamlessly; the copy is hidden from screen readers
    wall.innerHTML = `<div class="wall-half">${reels.map(tile).join('')}</div><div class="wall-half" aria-hidden="true">${reels.map(tile).join('')}</div>`;
    $$('.wall-half[aria-hidden] .tile', wall).forEach(b => b.tabIndex = -1);
    wall.style.setProperty('--dur', `${reels.length * 6}s`);
    wall.addEventListener('click', e => { const b = e.target.closest('.tile'); if (b) goTo(projects.find(p => p.id === b.dataset.id)); });
    if (!reduced) {
      // only tiles on screen play their loop
      const tio = new IntersectionObserver(entries => entries.forEach(e => {
        const v = $('video', e.target);
        if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().then(() => e.target.classList.add('live')).catch(() => {}); }
        else v.pause();
      }), { threshold: .2 });
      $$('.tile', wall).forEach(t => tio.observe(t));
    }
  }

  /* ---------- animation loops ---------- */
  $('#anim').innerHTML = data.animations.map((a, i) => `
    <figure class="anim reveal" style="--i:${i}">
      <div class="anim-frame"><video muted loop playsinline preload="none" poster="assets/anim/${a.id}.jpg" data-src="assets/anim/${a.id}.mp4" aria-hidden="true"></video></div>
      <figcaption><b>${a.title}</b><span>${a.explains}</span></figcaption>
    </figure>`).join('');
  if (!reduced) {
    const aio = new IntersectionObserver(entries => entries.forEach(e => {
      const v = $('video', e.target);
      if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
    }), { threshold: .35 });
    $$('.anim').forEach(a => aio.observe(a));
  }

  /* ---------- colour compare ---------- */
  const cmp = $('#compare'), raw = $('.cmp-raw', cmp), graded = $('.cmp-graded', cmp), handle = $('.cmp-handle', cmp);
  let pos = 50;
  const setPos = v => {
    pos = Math.min(100, Math.max(0, v));
    cmp.style.setProperty('--pos', `${pos}%`);
    handle.setAttribute('aria-valuenow', Math.round(pos));
    handle.setAttribute('aria-valuetext', `${Math.round(100 - pos)}% graded`);
  };
  const fromX = x => { const r = cmp.getBoundingClientRect(); setPos((x - r.left) / r.width * 100); };
  let dragging = false;
  cmp.addEventListener('pointerdown', e => { dragging = true; cmp.setPointerCapture(e.pointerId); fromX(e.clientX); cmp.classList.add('dragging'); });
  cmp.addEventListener('pointermove', e => { if (dragging) fromX(e.clientX); });
  const endDrag = () => { dragging = false; cmp.classList.remove('dragging'); };
  cmp.addEventListener('pointerup', endDrag); cmp.addEventListener('pointercancel', endDrag);
  handle.addEventListener('keydown', e => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === 'ArrowLeft') setPos(pos - step); else if (e.key === 'ArrowRight') setPos(pos + step);
    else if (e.key === 'Home') setPos(0); else if (e.key === 'End') setPos(100); else return;
    e.preventDefault();
  });
  // keep both videos on the same frame
  graded.addEventListener('timeupdate', () => { if (Math.abs(raw.currentTime - graded.currentTime) > .06) raw.currentTime = graded.currentTime; });
  let cmpInView = false;
  const playBoth = () => { raw.currentTime = graded.currentTime; Promise.all([raw.play(), graded.play()]).catch(() => {}); };
  const tabs = $$('.grade-tabs [role=tab]'), note = $('#grade-note');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    if (tab.classList.contains('is-on')) return;
    tabs.forEach(t => { t.classList.toggle('is-on', t === tab); t.setAttribute('aria-selected', t === tab); });
    Object.assign(raw, { poster: tab.dataset.rawPoster, src: tab.dataset.raw });
    Object.assign(graded, { poster: tab.dataset.gradedPoster, src: tab.dataset.graded });
    note.textContent = tab.dataset.note;
    if (cmpInView && !reduced) playBoth();
  }));
  if (!reduced) {
    new IntersectionObserver(([e]) => {
      cmpInView = e.isIntersecting;
      if (e.isIntersecting) playBoth(); else { raw.pause(); graded.pause(); }
    }, { threshold: .3 }).observe(cmp);
    // a gentle hint that the line moves, once
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      let t0; const sweep = t => { t0 ??= t; const k = Math.min(1, (t - t0) / 1600); if (!dragging) setPos(50 + Math.sin(k * Math.PI * 2) * 14); if (k < 1) requestAnimationFrame(sweep); };
      setTimeout(() => requestAnimationFrame(sweep), 500);
    }, { threshold: .6 }).observe(cmp);
  }

  /* ---------- reveal on scroll + counting numbers ---------- */
  const count = el => {
    const end = +el.dataset.n; if (reduced || !end) return;
    let t0; const step = t => { t0 ??= t; const k = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(end * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
    el.textContent = '0'; requestAnimationFrame(step);
  };
  const reveal = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); reveal.unobserve(e.target);
    const n = $('b[data-n]', e.target); if (n) count(n);
  }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => reveal.observe(el));
  $$('.grid .card').forEach(el => { el.style.transitionDelay = `${([...el.parentNode.children].indexOf(el) % 4) * 60}ms`; el.classList.add('reveal'); reveal.observe(el); });
  $$('#stats li').forEach((el, i) => { el.style.transitionDelay = `${i * 80}ms`; });
  requestAnimationFrame(() => document.documentElement.classList.add('loaded'));
})();
