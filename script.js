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
  document.documentElement.classList.add('js');
  // the hero's moving parts only animate while the hero is on screen and the tab is visible (saves battery on phones)
  let heroOn = true;
  new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; }).observe(document.querySelector('.hero'));
  const idle = () => !heroOn || document.hidden;

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
  ['work', 'motion', 'experience', 'services', 'contact'].forEach(id => spy.observe(document.getElementById(id)));

  /* ---------- numbers + clients ---------- */
  $('#stats').innerHTML = data.stats.map(s =>
    `<li class="reveal"><b data-n="${s.n}">${s.n}</b>${s.suffix ? `<b class="suf">${s.suffix}</b>` : ''}${s.plus ? '<sup>+</sup>' : ''}<span>${s.label}</span></li>`).join('');
  $('#clients').innerHTML = data.clients.map(c => `<li><b>${c.name}</b><span>${c.note}</span></li>`).join('');

  /* ---------- work cards ---------- */
  const projects = data.projects;
  const cards = new Map();
  const playIcon = '<svg viewBox="0 0 20 22" aria-hidden="true"><path d="M2 1.5l16.5 9.5L2 20.5z" fill="currentColor"/></svg>';

  const byId = id => projects.find(p => p.id === id);
  const makeCard = (p, eager, mode) => {
    const m = media(p.id);
    const card = document.createElement('article');
    card.className = `card ${mode === 'featured' ? 'featured' : p.format}${mode === 'short' ? ' feat-short' : ''}`;
    card.dataset.id = p.id;
    const frame = `
      <div class="frame" tabindex="0" role="button" aria-label="Play ${p.title}, ${p.client}, ${p.duration}">
        <img src="${m.poster}" alt="" loading="${eager ? 'eager' : 'lazy'}" decoding="async">
        <span class="dur">${p.duration}</span>
        <span class="play lg">${playIcon}</span>
      </div>`;
    const tags = `<ul class="tags">${p.role.split(' · ').map(r => `<li>${r}</li>`).join('')}</ul>`;
    card.innerHTML = mode === 'featured' ? `${frame}
      <div class="feat-info">
        <p class="kicker">Featured · Interviews</p>
        <h3>${p.title}</h3>
        <p class="client">${p.client}</p>
        <p class="summary">${p.summary}</p>
        ${tags}
        <button type="button" class="btn btn-light feat-play"><span class="tri" aria-hidden="true"></span>Play the first minute</button>
        ${p.excerpt ? `<p class="excerpt">${p.excerpt}</p>` : ''}
      </div>` : mode === 'short' ? `${frame}<p class="short-cap">The vertical short cut from it</p>` : `${frame}
      <div class="meta">
        <p class="client">${p.client}${p.sound ? ' · <em>headphones on</em>' : ''}</p>
        <h3>${p.title}</h3>
        <p class="summary">${p.summary}</p>
        ${tags}
      </div>`;
    cards.set(p.id, card);
    const f = $('.frame', card);
    f.addEventListener('click', () => { if (!card.classList.contains('playing')) play(card, p); });
    f.addEventListener('keydown', e => {
      if (e.target !== f || card.classList.contains('playing')) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(card, p); }
    });
    $('.feat-play', card)?.addEventListener('click', () => play(card, p));
    return card;
  };

  // featured interview: the episode, its vertical short, and the story
  {
    const feat = projects.find(p => p.featured), wrap = document.createElement('div');
    wrap.className = 'feat-row reveal';
    const fc = makeCard(feat, true, 'featured'), info = $('.feat-info', fc);
    wrap.append(fc);
    if (data.featuredShort) wrap.append(makeCard(byId(data.featuredShort), true, 'short'));
    wrap.append(info);
    $('#featured').append(wrap);
  }
  // the top 3 per niche
  $('#cats').innerHTML = data.categories.map((c, i) => `
    <div class="cat${c.wide ? ' cat-wide' : ''}">
      <div class="cat-head reveal"><span class="cat-n">${pad(i + 1)}</span><h3>${c.title}</h3><p>${c.note}</p></div>
      <div class="cat-cards"></div>
    </div>`).join('');
  $$('#cats .cat').forEach((el, i) => data.categories[i].ids.forEach((id, k) => $('.cat-cards', el).append(makeCard(byId(id), i === 0, 'grid'))));

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
    $('.frame', card).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    play(card, p);
  }

  /* ---------- hero: slow wall of reels ---------- */
  {
    const reels = projects.filter(p => p.format === 'tall' && cards.has(p.id));
    const tile = p => `<button type="button" class="tile" data-id="${p.id}" aria-label="Play ${p.title}, ${p.client}">
      <img src="${media(p.id).poster}" alt="" decoding="async">
      <video muted loop playsinline preload="none" data-src="${media(p.id).preview}" aria-hidden="true"></video>
      <span class="tile-cap"><b>${p.title}</b><span>${p.client.split(' · ')[0]}</span></span></button>`;
    const wall = $('#wall');
    // two identical halves scroll seamlessly; the copy is hidden from screen readers
    wall.innerHTML = `<div class="wall-half">${reels.map(tile).join('')}</div><div class="wall-half" aria-hidden="true">${reels.map(tile).join('')}</div>`;
    $$('.wall-half[aria-hidden] .tile', wall).forEach(b => b.tabIndex = -1);
    // slow drift; the arrow buttons glide two tiles either way, then the drift carries on
    {
      const view = wall.parentNode, DRIFT = 18; // px per second
      let x = 0, target = null, last = performance.now(), hover = false, half = 0;
      const measure = () => { half = $('.wall-half', wall).offsetWidth; };
      const step = () => { const t = $('.tile', wall); return (t ? t.offsetWidth + 14 : 200) * 2; };
      const tick = now => {
        const dt = Math.min(.05, (now - last) / 1000); last = now;
        if (idle()) { requestAnimationFrame(tick); return; }
        if (target !== null) { const d = target - x; x += d * Math.min(1, dt * 7); if (Math.abs(d) < .5) { x = target; target = null; } }
        else if (!hover && !reduced) x += DRIFT * dt;
        if (half) { if (x >= half) { x -= half; if (target !== null) target -= half; } if (x < 0) { x += half; if (target !== null) target += half; } }
        wall.style.transform = `translate3d(${-x}px,0,0)`;
        requestAnimationFrame(tick);
      };
      const nudge = dir => { if (!half) measure(); target = (target ?? x) + dir * step(); };
      $('.wall-btn.prev').addEventListener('click', () => nudge(-1));
      $('.wall-btn.next').addEventListener('click', () => nudge(1));
      view.addEventListener('mouseenter', () => { hover = true; });
      view.addEventListener('mouseleave', () => { hover = false; });
      // swipe on touch screens
      let sx = null, sx0 = 0;
      view.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sx0 = x; target = null; hover = true; }, { passive: true });
      view.addEventListener('touchmove', e => { if (sx !== null) x = sx0 + (sx - e.touches[0].clientX); }, { passive: true });
      view.addEventListener('touchend', () => { sx = null; hover = false; }, { passive: true });
      addEventListener('resize', measure);
      if (document.readyState === 'complete') measure(); else addEventListener('load', measure);
      requestAnimationFrame(tick);
    }
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

  /* ---------- live edit timeline behind the title ----------
     Tracks scroll under a fixed playhead. The ruler and timecode use the same clock (SPEED px = 1 s),
     so the timecode always matches the ruler under the playhead, and clips light up while it crosses them. */
  {
    const SPEED = 46, FPS = 30;
    let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const vids = projects.filter(p => p.format === 'tall' && cards.has(p.id));
    const titles = ['Hook title', 'Rs 50K card', 'Lower third', 'Budget 01', 'kapada', 'Comment pop', 'Checklist', 'Price card', 'End card', 'Keyword', 'Logo bug', 'CTA'];
    const shortName = p => p.title.replace(/[“”"]/g, '').split(/[,?:]/)[0];
    const wave = n => { let w = ''; for (let k = 0; k < n; k++) { const h = 18 + Math.abs(Math.sin(k * .45 + seed) * 50) + rnd() * 30; w += `<i style="height:${Math.min(96, h) | 0}%"></i>`; } return w; };
    // one "half" of the sequence; it is rendered twice side by side and wraps seamlessly
    const lanes = { t: '', v2: '', v1: '', a1: '', a2: '' };
    vids.forEach((p, i) => {
      const w1 = 150 + rnd() * 120 | 0, w2 = 110 + rnd() * 140 | 0;
      lanes.v1 += `<span class="c v1" style="width:${w1}px;--img:url(${media(p.id).poster})"><b>${shortName(p)}</b></span>`;
      lanes.v2 += `<span class="gap" style="width:${20 + rnd() * 70 | 0}px"></span><span class="c v2" style="width:${w2}px;--img:url(${media(vids[(i + 5) % vids.length].id).poster})"><b>B-roll ${pad(i + 1)}</b>${i % 3 === 1 ? '<em class="x"></em>' : ''}</span>`;
      lanes.t += `<span class="gap" style="width:${30 + rnd() * 90 | 0}px"></span><span class="c t" style="width:${70 + rnd() * 70 | 0}px"><b>${titles[i % titles.length]}</b></span>`;
      lanes.a1 += `<span class="c a1" style="width:${w1}px">${wave(Math.round(w1 / 7))}</span>`;
    });
    const total = vids.length * 400;
    for (let x = 0, k = 0; x < total; k++) { const w = 260 + rnd() * 260 | 0; lanes.a2 += `<span class="c a2" style="width:${w}px">${wave(Math.round(w / 9))}</span>`; x += w; }
    const half = `<div class="tlx-half">${Object.entries(lanes).map(([k, v]) => `<div class="tlx-track k-${k}">${v}</div>`).join('')}</div>`;
    const reel = $('#tlx-reel');
    reel.innerHTML = half + half;
    const halfEl = $('.tlx-half', reel);
    // the shortest lane decides the loop length; each half clips the longer lanes at the seam
    const view = $('.tlx-view'), head = $('.tlx-head'), tcEl = $('#tlx-tc'), ruler = $('#tlx-ruler');
    let loopW = 0, clips = [], headX = 0;
    const measure = () => {
      loopW = Math.min(...$$('.tlx-track', halfEl).map(t => t.scrollWidth));
      $$('.tlx-half', reel).forEach(h => h.style.width = `${loopW}px`);
      clips = $$('.c', reel).map(el => ({ el, l: el.offsetLeft, w: el.offsetWidth })); // offsets are relative to the reel
      headX = head.getBoundingClientRect().left - view.getBoundingClientRect().left;
    };
    // ruler: a small pool of ticks, repositioned each frame
    const ticks = Array.from({ length: 48 }, () => { const i = document.createElement('i'); ruler.append(i); return i; });
    const marks = [3, 9, 14, 22, 31];
    const tc = s => { const f = Math.floor(s * FPS); return `01:${pad(Math.floor(f / 1800) % 60)}:${pad(Math.floor(f / 30) % 60)}:${pad(f % 30)}`; };
    let t0 = null, last = -1;
    let paused = 0, pausedAt = 0;
    const frame = now => {
      if (idle()) { pausedAt ||= now; requestAnimationFrame(frame); return; }
      if (pausedAt) { paused += now - pausedAt; pausedAt = 0; }
      t0 ??= now;
      const t = reduced ? 8 : (now - t0 - paused) / 1000 + 4;    // seconds since the "sequence" started
      const off = t * SPEED;                            // px travelled
      const x = off % loopW;
      reel.style.transform = `translate3d(${-x}px,0,0)`;
      // seconds under the playhead
      const atHead = (off + headX) / SPEED;
      const f = Math.floor(atHead * FPS);
      if (f !== last) { last = f; tcEl.textContent = tc(atHead); }
      // ruler ticks every half second, labels every 2 s, markers on chosen seconds
      const first = Math.floor(off / (SPEED / 2));
      ticks.forEach((el, k) => {
        const n = first + k, px = n * SPEED / 2 - off, sec = n / 2;
        el.style.transform = `translateX(${px}px)`;
        const label = n % 4 === 0 ? `00:${pad(Math.floor(sec) % 60)}` : '';
        if (el.dataset.l !== label) { el.dataset.l = label; el.textContent = label; }
        el.className = (n % 2 === 0 ? 'big' : '') + (n % 2 === 0 && marks.includes(sec % 36) ? ' mk' : '');
      });
      // light up whatever the playhead is crossing
      const c = x + headX;
      clips.forEach(o => o.el.classList.toggle('hot', c >= o.l && c < o.l + o.w));
      if (!reduced) requestAnimationFrame(frame);
    };
    const start = () => { measure(); requestAnimationFrame(frame); };
    if (document.readyState === 'complete') start(); else addEventListener('load', start);
    addEventListener('resize', () => { if (loopW) measure(); });
  }

  /* ---------- animation loops ---------- */
  $('#anim').innerHTML = data.animations.map((a, i) => `
    <figure class="anim reveal" style="--i:${i}">
      <div class="anim-frame"><video muted loop playsinline preload="none" poster="assets/anim/${a.id}.jpg" data-src="assets/anim/${a.id}.mp4" aria-hidden="true"></video></div>
      <figcaption><b>${a.title}</b><span>${a.explains}</span></figcaption>
    </figure>`).join('');
  $('#mg').innerHTML = data.motion.map((m, i) => `
    <figure class="anim mg reveal" style="--i:${i % 5}">
      <div class="anim-frame"><video muted loop playsinline preload="none" poster="assets/mg/${m.id}.jpg" data-src="assets/mg/${m.id}.mp4" aria-hidden="true"></video></div>
      <figcaption><b>${m.title}</b><span>${m.from}</span></figcaption>
    </figure>`).join('');
  if (!reduced) {
    // loops play only while on screen
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

  /* ---------- liquid glass lens ----------
     Each .lg element gets its own SVG displacement map, shaped like the element (pill, circle or
     rounded card): flat in the middle, bending the backdrop more and more towards the rim, like
     Apple's glass. Chromium can run SVG filters in backdrop-filter; other browsers keep the CSS glass. */
  if (window.chrome) {
    const defs = $('#lg-defs'), made = new Map();
    const lensFilter = (w, h, r) => {
      const key = `${w}x${h}r${r}`;
      if (made.has(key)) return made.get(key);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const cx = cv.getContext('2d'), img = cx.createImageData(w, h), d = img.data;
      const hx = w / 2 - r, hy = h / 2 - r, rim = Math.max(6, Math.min(r, h / 2, w / 2) * .9);
      const zoom = .14, bend = Math.min(w, h) * .12;           // 14% magnification + extra pull at the rim
      const off = new Float32Array(w * h * 2); let maxO = 1;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const px = x + .5 - w / 2, py = y + .5 - h / 2, qx = Math.abs(px) - hx, qy = Math.abs(py) - hy;
        const depth = -(Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r);
        let nx = 0, ny = 0;
        if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy) || 1; nx = qx / l; ny = qy / l; } else if (qx > qy) nx = 1; else ny = 1;
        nx *= Math.sign(px) || 1; ny *= Math.sign(py) || 1;
        const m = depth <= 0 ? 1 : depth < rim ? (1 - depth / rim) ** 2 : 0;
        // sample nearer the centre (convex lens = magnified), pulled further inward near the rim
        const ox = -zoom * px - bend * m * nx, oy = -zoom * py - bend * m * ny, i = (y * w + x) * 2;
        off[i] = ox; off[i + 1] = oy; maxO = Math.max(maxO, Math.abs(ox), Math.abs(oy));
      }
      const A = maxO * 2 + 2;
      for (let k = 0, n = w * h; k < n; k++) {
        d[k * 4] = 128 + off[k * 2] / A * 255; d[k * 4 + 1] = 128 + off[k * 2 + 1] / A * 255; d[k * 4 + 2] = 128; d[k * 4 + 3] = 255;
      }
      cx.putImageData(img, 0, 0);
      const id = `lg${made.size}`, map = cv.toDataURL();
      const pass = (s, ch, name) => `<feDisplacementMap in="SourceGraphic" in2="m" scale="${(A * s).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="${name}d"/><feColorMatrix in="${name}d" type="matrix" values="${ch}" result="${name}"/>`;
      defs.insertAdjacentHTML('beforeend', `<filter id="${id}" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feImage href="${map}" x="0" y="0" width="${w}" height="${h}" result="m"/>`
        + pass(1, '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0', 'r') + pass(.975, '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0', 'g') + pass(.95, '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0', 'b')
        + `<feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b" mode="screen"/></filter>`);
      made.set(key, id);
      return id;
    };
    const fit = el => {
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (!w || !h) return;
      const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2);
      el.style.backdropFilter = `url(#${lensFilter(w, h, Math.round(r))}) blur(.5px) saturate(165%) brightness(1.06)`;
    };
    const ro = new ResizeObserver(entries => entries.forEach(e => fit(e.target)));
    $$('.lg').forEach(el => { fit(el); ro.observe(el); });
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
  $$('.cat-cards .card').forEach(el => { el.style.transitionDelay = `${[...el.parentNode.children].indexOf(el) * 70}ms`; el.classList.add('reveal'); reveal.observe(el); });
  $$('#stats li').forEach((el, i) => { el.style.transitionDelay = `${i * 80}ms`; });
  requestAnimationFrame(() => document.documentElement.classList.add('loaded'));
})();
