(() => {
  const data = window.PORTFOLIO;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const groups = { long: 'Long-form', short: 'Reel', film: 'Film' };
  const media = id => ({ poster: `assets/posters/${id}.webp`, preview: `assets/previews/${id}.mp4`, video: `assets/video/${id}.mp4` });
  const pad = n => String(n).padStart(2, '0');
  const fmt = s => (s = Math.max(0, Math.floor(s || 0)), `${Math.floor(s / 60)}:${pad(s % 60)}`);
  const secs = d => d.split(':').reduce((a, n) => a * 60 + +n, 0);
  document.documentElement.classList.add('js');

  /* ---------- contact details ---------- */
  $('#year').textContent = new Date().getFullYear();
  const email = $('#contact-email');
  email.href = `mailto:${data.email}`; email.title = data.email;
  $('#contact-wa').href = data.whatsapp;
  $('#socials').innerHTML = data.socials.map(s =>
    `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} <span>${s.handle} ↗</span></a></li>`).join('');
  const toast = $('#toast');
  const say = msg => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('show'), 1800); };
  $('#copy-email').addEventListener('click', () => {
    (navigator.clipboard ? navigator.clipboard.writeText(data.email) : Promise.reject())
      .then(() => say('Email copied'), () => say(data.email));
  });
  // local time, so clients abroad know when I'll see their message
  const clock = $('#clock');
  const clockFmt = new Intl.DateTimeFormat('en-US', { timeZone: data.timezone, hour: 'numeric', minute: '2-digit' });
  const tickClock = () => { clock.innerHTML = `<i class="dot" aria-hidden="true"></i>It’s ${clockFmt.format(new Date())} in ${data.city} right now (Nepal time).`; };
  tickClock(); setInterval(tickClock, 30000);

  /* ---------- nav ---------- */
  const nav = $('#nav'), links = $('#nav-links'), menuBtn = $('.menu-btn');
  const setMenu = open => { links.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
  menuBtn.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  const bar = $('.progress span');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    nav.classList.toggle('scrolled', scrollY > 40);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // highlight the section in view
  const navLinks = $$('a', links);
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('is-here', a.getAttribute('href') === `#${e.target.id}`));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['work', 'grade', 'services', 'about', 'contact'].forEach(id => spy.observe(document.getElementById(id)));

  /* ---------- work cards ---------- */
  const projects = data.projects;
  const cards = new Map();
  const playIcon = '<svg viewBox="0 0 20 22" aria-hidden="true"><path d="M0 0l20 11L0 22z" fill="currentColor"/></svg>';

  projects.forEach((p, i) => {
    const m = media(p.id);
    const card = document.createElement('article');
    card.className = `card ${p.featured ? 'featured' : p.format}`;
    card.dataset.id = p.id;
    const frame = `
      <div class="frame" tabindex="0" role="button" aria-label="Play ${p.title}, ${p.client}, ${p.duration}">
        <img src="${m.poster}" alt="" loading="${p.featured || i < 4 ? 'eager' : 'lazy'}" decoding="async">
        <span class="glass chip badge">${groups[p.group]}</span>
        <span class="dur">${p.duration}</span>
        <span class="glass play">${playIcon}</span>
      </div>`;
    const tags = `<ul class="tags">${p.role.split(' · ').map(r => `<li>${r}</li>`).join('')}</ul>`;
    card.innerHTML = p.featured ? `${frame}
      <div class="feat-info">
        <p class="label">Featured · ${groups[p.group]}</p>
        <h3>${p.title}</h3>
        <p class="feat-client">${p.client}</p>
        <p class="feat-summary">${p.summary}</p>
        ${tags}
        <button type="button" class="btn glass glass-rose feat-play"><span class="tri" aria-hidden="true"></span>Play the first minute</button>
        ${p.excerpt ? `<p class="feat-excerpt">${p.excerpt}</p>` : ''}
      </div>` : `${frame}
      <div class="meta">
        <h3>${p.title}</h3>
        <p class="client">${p.client}${p.sound ? ' · <span class="sound-note">Headphones on</span>' : ''}</p>
        <p class="summary">${p.summary}</p>
        ${tags}
      </div>`;
    const target = p.featured ? '#featured' : p.group === 'film' ? '#grid-film' : '#grid-short';
    $(target).append(card);
    cards.set(p.id, card);

    const f = $('.frame', card);
    f.addEventListener('click', e => { if (!card.classList.contains('playing')) play(card, p); });
    f.addEventListener('keydown', e => {
      if (e.target !== f || card.classList.contains('playing')) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(card, p); }
    });
    $('.feat-play', card)?.addEventListener('click', () => play(card, p));
  });
  // a contact tile fills the last row of the reel grid
  $('#grid-short').insertAdjacentHTML('beforeend', `<a class="card cta-tile" href="#contact">
    <span class="cta-small">Your project</span>
    <span class="cta-big">Footage sitting on a drive? Let’s turn it into something people finish.</span>
    <span class="cta-go" aria-hidden="true">→</span></a>`);
  $$('[data-count]').forEach(el => el.textContent = projects.filter(p => p.group === el.dataset.count).length);

  /* ---------- in-card player with editor keys ---------- */
  let active = null; // { card, v }
  const heroVideo = $('.hero-video');

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
      heroVideo.pause();
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

  const flash = (text) => {
    if (!active) return;
    const el = $('.pl-flash', active.card);
    el.textContent = text; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  };
  document.addEventListener('keydown', e => {
    if (!active || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('input:not([type=range]), textarea, select')) return;
    const { v } = active, k = e.key.toLowerCase();
    // only steal keys while the video is on screen
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
    if (card.classList.contains('playing')) return;
    const frame = $('.frame', card);
    let v = $('video.pv', frame);
    if (!v) {
      v = document.createElement('video');
      v.className = 'pv';
      Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'auto', src: media(card.dataset.id).preview });
      v.setAttribute('aria-hidden', 'true');
      frame.insertBefore(v, $('.badge', frame));
    }
    v.play().then(() => { if (!card.classList.contains('playing')) card.classList.add('previewing'); }).catch(() => {});
  };
  const stopPreview = card => { card.classList.remove('previewing'); $('video.pv', card)?.pause(); };
  if (!reduced) {
    if (finePointer) {
      cards.forEach(c => { const f = $('.frame', c); f.addEventListener('mouseenter', () => startPreview(c)); f.addEventListener('mouseleave', () => stopPreview(c)); });
    } else {
      const io = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting ? startPreview(e.target) : stopPreview(e.target)), { threshold: .7 });
      cards.forEach(c => { if (!c.classList.contains('featured')) io.observe(c); });
    }
  }

  /* ---------- hero: program monitor + timeline ---------- */
  const tc = $('#hero-tc'), cap = $('#mon-cap'), monitor = $('.monitor');
  const mon = $('.mon-preview'), monImg = $('img', mon), monVid = $('video', mon);
  const tracksEl = $('#tl-tracks'), playhead = $('.tl-playhead'), tlBody = $('.tl-body');
  const tracks = [
    { key: 'long', name: 'V3', label: 'Long-form' },
    { key: 'short', name: 'V2', label: 'Reels' },
    { key: 'film', name: 'V1', label: 'Film' }
  ];
  tracks.forEach(t => {
    const items = projects.filter(p => p.group === t.key);
    const row = document.createElement('div');
    row.className = `tl-track t-${t.key}`;
    row.innerHTML = `<span class="tl-name" title="${t.label}">${t.name}</span><div class="tl-lane"></div>`;
    const lane = $('.tl-lane', row);
    items.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'clip';
      b.style.flexGrow = (1 + Math.log2(1 + secs(p.duration) / 15)).toFixed(2);
      b.style.setProperty('--i', tracks.indexOf(t) * 3 + i);
      b.dataset.id = p.id;
      b.innerHTML = `<span class="clip-thumb" style="background-image:url(${media(p.id).poster})"></span><span class="clip-name">${p.short}</span>`;
      b.setAttribute('aria-label', `${p.title}, ${p.client}. Play it in the work section`);
      lane.append(b);
    });
    // an empty tail keeps the shorter tracks looking like a real timeline
    if (t.key !== 'long') lane.insertAdjacentHTML('beforeend', '<span class="tl-gap"></span>');
    tracksEl.append(row);
  });
  // audio track with a drawn waveform
  const a1 = document.createElement('div');
  a1.className = 'tl-track t-audio';
  a1.setAttribute('aria-hidden', 'true');
  let wave = '';
  for (let i = 0, s = 7; i < 120; i++) { s = (s * 9301 + 49297) % 233280; const h = 18 + Math.abs(Math.sin(i * .37) * 46 + Math.sin(i * 1.7) * 18) + (s / 233280) * 22; wave += `<i style="height:${Math.min(96, h).toFixed(0)}%"></i>`; }
  a1.innerHTML = `<span class="tl-name">A1</span><div class="tl-lane"><div class="wave">${wave}</div></div>`;
  tracksEl.append(a1);
  // ruler ticks
  $('.tl-ruler').innerHTML = Array.from({ length: 21 }, (_, i) => `<i class="${i % 5 ? '' : 'big'}">${i % 5 ? '' : `00:${pad(i)}`}</i>`).join('');

  let hoverClip = null;
  const laneLeft = () => { const lane = $('.tl-lane', tracksEl); return lane.offsetLeft; };
  const placeHead = x => { playhead.style.transform = `translateX(${x}px)`; };
  const tick = () => {
    const t = heroVideo.currentTime || 0;
    tc.textContent = `00:00:${pad(Math.floor(t))}:${pad(Math.floor((t % 1) * 30))}`;
    if (!hoverClip) {
      const lane = $('.tl-lane', tracksEl);
      placeHead(lane.offsetLeft + lane.clientWidth * (t / (heroVideo.duration || 19.7)));
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  if (reduced) heroVideo.pause(); else heroVideo.play?.().catch(() => {});

  const showOnMonitor = b => {
    const p = projects.find(x => x.id === b.dataset.id);
    hoverClip = b;
    $$('.clip', tracksEl).forEach(c => c.classList.toggle('is-on', c === b));
    const br = b.getBoundingClientRect(), tr = tlBody.getBoundingClientRect();
    placeHead(br.left - tr.left + 2);
    mon.classList.toggle('tall', p.format === 'tall');
    monImg.src = media(p.id).poster;
    if (!reduced) { monVid.src = media(p.id).preview; monVid.play().catch(() => {}); }
    monitor.classList.add('source');
    cap.textContent = `Source · ${p.title} · ${p.client}`;
  };
  const backToProgram = () => {
    hoverClip = null;
    $$('.clip', tracksEl).forEach(c => c.classList.remove('is-on'));
    monitor.classList.remove('source');
    monVid.pause();
    cap.textContent = 'Program · shots from the work below';
  };
  tracksEl.addEventListener('pointerover', e => { const b = e.target.closest('.clip'); if (b && b !== hoverClip && e.pointerType === 'mouse') showOnMonitor(b); });
  tracksEl.addEventListener('pointerleave', backToProgram);
  tracksEl.addEventListener('focusin', e => { const b = e.target.closest('.clip'); if (b) showOnMonitor(b); });
  tracksEl.addEventListener('focusout', e => { if (!tracksEl.contains(e.relatedTarget)) backToProgram(); });
  tracksEl.addEventListener('click', e => {
    const b = e.target.closest('.clip'); if (!b) return;
    const p = projects.find(x => x.id === b.dataset.id);
    goTo(p);
  });
  function goTo(p) {
    const card = cards.get(p.id);
    $('.frame', card).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    play(card, p);
  }
  $('#hero-play').addEventListener('click', () => goTo(projects.find(p => p.featured) || projects[0]));

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
  if (!reduced) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { raw.currentTime = graded.currentTime; Promise.all([raw.play(), graded.play()]).catch(() => {}); }
      else { raw.pause(); graded.pause(); }
    }, { threshold: .3 }).observe(cmp);
    // a gentle hint the line moves, once
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      let t0; const sweep = t => { t0 ??= t; const k = Math.min(1, (t - t0) / 1600); if (!dragging) setPos(50 + Math.sin(k * Math.PI * 2) * 14); if (k < 1) requestAnimationFrame(sweep); };
      setTimeout(() => requestAnimationFrame(sweep), 500);
    }, { threshold: .6 }).observe(cmp);
  }

  /* ---------- cursor label over media (mouse only) ---------- */
  if (finePointer && !reduced) {
    const cur = $('.cursor'), label = $('span', cur);
    let x = -100, y = -100, cx = x, cy = y, shown = false;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      const f = e.target.closest('.frame, .clip, .compare');
      let text = '';
      if (f?.classList.contains('frame') && !f.closest('.card').classList.contains('playing')) text = 'Play';
      else if (f?.classList.contains('compare')) text = 'Drag';
      else if (f?.classList.contains('clip')) text = 'Play';
      if (text) label.textContent = text;
      if (!!text !== shown) { shown = !!text; cur.classList.toggle('on', shown); }
    }, { passive: true });
    // the page can scroll under a resting pointer, so re-check what is under it
    addEventListener('scroll', () => { const el = document.elementFromPoint(x, y); el && el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: y })); }, { passive: true });
    const loop = () => { cx += (x - cx) * .22; cy += (y - cy) * .22; cur.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); };
    loop();
  }

  /* ---------- reveal on scroll ---------- */
  const reveal = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); reveal.unobserve(e.target);
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => reveal.observe(el));
  $$('.card').forEach(el => { el.style.transitionDelay = `${([...el.parentNode.children].indexOf(el) % 4) * 70}ms`; reveal.observe(el); });
  requestAnimationFrame(() => document.documentElement.classList.add('loaded'));
})();
