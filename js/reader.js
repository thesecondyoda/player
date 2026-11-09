(async () => {
  const db = window.kirinClient, $ = id => document.getElementById(id), esc = window.escapeHTML, stage = $('rdStage'), body = document.body;
  const say = t => { const e = $('rdToast'); e.textContent = t; e.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => e.classList.remove('on'), 2400); };
  const fail = t => { stage.innerHTML = `<div class="rd-msg">${esc(t)}</div>`; };
  if (!db) { fail('يرجى إعداد اتصال Supabase.'); return; }
  const cid = new URLSearchParams(location.search).get('chapter'); if (!cid) { fail('لم يتم تحديد الفصل.'); return; }
  let S = { mode: 'scroll', dir: 'rtl', width: 820, dim: 100, speed: 0 };
  try { Object.assign(S, JSON.parse(localStorage.getItem('kirin-rd') || '{}')); } catch (e) {}
  const save = () => localStorage.setItem('kirin-rd', JSON.stringify(S));
  async function pagesOf(id, limit) {
    const { data, error } = await db.from('chapter_pages').select('page_number,storage_path').eq('chapter_id', id).order('page_number', { ascending: true }); if (error) throw error;
    const rows = (data || []).slice(0, limit || 1e9); if (!rows.length) return [];
    const { data: su, error: se } = await db.storage.from('chapter-pages').createSignedUrls(rows.map(r => r.storage_path), 3600); if (se) throw se;
    return rows.map((r, i) => ({ n: r.page_number, path: r.storage_path, url: su[i] && su[i].signedUrl })).filter(p => p.url);
  }
  try {
    const { data: ch, error } = await db.from('chapters').select('id,work_id,title,chapter_number,works(id,title,slug)').eq('id', cid).eq('status', 'published').maybeSingle(); if (error) throw error;
    if (!ch || !ch.works) { fail('الفصل غير موجود أو لم يتم نشره.'); return; }
    const { data: all, error: ae } = await db.from('chapters').select('id,chapter_number').eq('work_id', ch.work_id).eq('status', 'published').order('chapter_number', { ascending: true }); if (ae) throw ae;
    const ix = all.findIndex(c => c.id === cid), prevC = all[ix - 1], nextC = all[ix + 1], url = c => `reader.html?chapter=${c.id}`;
    const label = ch.title || 'الفصل ' + ch.chapter_number; document.title = `${ch.works.title} — ${label}`; $('rdTitle').textContent = label; $('rdWork').textContent = ch.works.title;
    if (prevC) { $('rdPrevCh').hidden = false; $('rdPrevCh').href = url(prevC); } if (nextC) { $('rdNextCh').hidden = false; $('rdNextCh').href = url(nextC); }
    $('rdSel').innerHTML = all.map(c => `<option value="${c.id}"${c.id === cid ? ' selected' : ''}>الفصل ${esc(c.chapter_number)}</option>`).join(''); $('rdSel').onchange = e => { location.href = `reader.html?chapter=${e.target.value}`; };
    const P = await pagesOf(cid); if (!P.length) { fail('لا توجد صفحات مضافة إلى هذا الفصل.'); return; }
    const N = P.length; let cur = 0, pre = 0, io = null, z = { s: 1, x: 0, y: 0 };
    const saved = Number(localStorage.getItem('kirin-pos-' + cid) || 0); if (saved > 0 && saved < N) { cur = saved; say(`استُؤنفت القراءة من صفحة ${cur + 1}`); }
    const endCard = () => { const d = document.createElement('div'); d.className = 'rd-end'; d.innerHTML = `<h2>انتهى ${esc(label)}</h2>` + (nextC ? `<a class="btn primary" href="${url(nextC)}">الفصل ${esc(nextC.chapter_number)}</a>` : '<p class="muted">هذا آخر فصل متاح حالياً.</p>') + '<a class="btn" href="index.html#chapters">كل الفصول</a>'; return d; };
    const groups = () => { if (S.mode !== 'spread') return P.map((_, i) => [i]); const g = [[0]]; for (let i = 1; i < N; i += 2) g.push(i + 1 < N ? [i, i + 1] : [i]); return g; };
    const gi = () => Math.max(0, groups().findIndex(a => a.includes(cur)));
    const wire = (im, i) => { im.onload = () => im.parentNode && im.parentNode.classList.add('ok'); im.onerror = async () => { if (im.dataset.r) { im.parentNode.classList.add('bad'); return; } im.dataset.r = 1; const { data } = await db.storage.from('chapter-pages').createSignedUrl(P[i].path, 3600); if (data) im.src = data.signedUrl; }; };
    function vars() { stage.style.setProperty('--w', S.width + 'px'); document.documentElement.style.setProperty('--dim', S.dim / 100); stage.style.direction = S.dir; $('rdRange').dir = S.dir; document.querySelectorAll('[data-r]').forEach(i => i.value = S[i.dataset.r]); document.querySelectorAll('[data-k]').forEach(b => b.classList.toggle('on', S[b.dataset.k] === b.dataset.v)); }
    function sync() { const n = Math.min(cur + 1, N); $('rdRange').max = N; $('rdRange').value = n; $('rdCount').textContent = `${n} / ${N}`; $('rdBar').style.width = (n / N * 100) + '%'; localStorage.setItem('kirin-pos-' + cid, String(cur)); localStorage.setItem('kirin-progress-' + cid, '1'); localStorage.setItem('kirin-last', cid);
      if (!pre && nextC && cur >= N * .7) { pre = 1; pagesOf(nextC.id, 3).then(a => a.forEach(p => { new Image().src = p.url; })).catch(() => {}); } }
    function show() { const g = groups(), k = cur >= N ? g.length : gi(); stage.innerHTML = ''; z = { s: 1, x: 0, y: 0 }; const zm = document.createElement('div'); zm.className = 'zoom';
      if (k >= g.length) { cur = N; zm.appendChild(endCard()); } else { cur = g[k][0]; g[k].forEach(i => { const im = new Image(); im.src = P[i].url; im.alt = 'صفحة ' + P[i].n; im.draggable = false; wire(im, i); zm.appendChild(im); }); (g[k + 1] || []).concat(g[k + 2] || []).forEach(i => { new Image().src = P[i].url; }); }
      stage.appendChild(zm); }
    function render() { stage.className = 'rd-stage m-' + S.mode; vars(); if (io) io.disconnect();
      if (S.mode === 'scroll') { stage.innerHTML = ''; io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { cur = +e.target.dataset.i; sync(); } }), { rootMargin: '-50% 0px -50% 0px' });
        P.forEach((p, i) => { const f = document.createElement('figure'); f.className = 'pg'; f.dataset.i = i; const im = new Image(); im.alt = 'صفحة ' + p.n; im.draggable = false; if (i > 2) im.loading = 'lazy'; wire(im, i); im.src = p.url; f.appendChild(im); stage.appendChild(f); io.observe(f); });
        stage.appendChild(endCard()); requestAnimationFrame(() => go(cur, false)); } else show(); sync(); }
    function go(i, sm = true) { i = Math.max(0, Math.min(N, i)); cur = i; if (S.mode === 'scroll') { const f = i >= N ? stage.lastElementChild : stage.children[i]; if (f) f.scrollIntoView({ behavior: sm ? 'smooth' : 'auto', block: i >= N ? 'center' : 'start' }); } else show(); sync(); }
    function step(d) { if (S.mode === 'scroll') { scrollBy({ top: d * innerHeight * .85, behavior: 'smooth' }); return; }
      const g = groups(); let k = (cur >= N ? g.length : gi()) + d; if (k < 0) { if (prevC) location.href = url(prevC); else say('هذه بداية الفصل'); return; } if (k > g.length) { if (nextC) location.href = url(nextC); return; }
      cur = k >= g.length ? N : g[k][0]; show(); sync(); }
    const ui = h => body.classList.toggle('rd-hide', h), hidden = () => body.classList.contains('rd-hide');
    const zone = x => { if (z.s > 1) return; const w = innerWidth, r = S.dir === 'rtl'; if (x < w * .3) step(r ? 1 : -1); else if (x > w * .7) step(r ? -1 : 1); else ui(!hidden()); };
    const ptr = new Map(); let g0 = null, t0 = null, lastTap = 0, tapT; const ap = () => { const e = stage.querySelector('.zoom'); if (e) e.style.transform = `translate(${z.x}px,${z.y}px) scale(${z.s})`; };
    stage.addEventListener('pointerdown', e => { if (S.mode === 'scroll') return; ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptr.size === 1) t0 = { x: e.clientX, y: e.clientY, t: Date.now(), moved: 0 }; if (ptr.size === 2 && t0) { const [a, b] = [...ptr.values()]; g0 = { d: Math.hypot(a.x - b.x, a.y - b.y), s: z.s }; t0.pinch = 1; } });
    stage.addEventListener('pointermove', e => { const p = ptr.get(e.pointerId); if (!p || !t0) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; t0.moved += Math.abs(dx) + Math.abs(dy);
      if (ptr.size === 2 && g0) { const [a, b] = [...ptr.values()]; z.s = Math.max(1, Math.min(5, g0.s * Math.hypot(a.x - b.x, a.y - b.y) / g0.d)); ap(); } else if (z.s > 1) { z.x += dx; z.y += dy; ap(); } });
    stage.addEventListener('pointerup', e => { ptr.delete(e.pointerId); if (!t0 || S.mode === 'scroll' || ptr.size) return; g0 = null; const dx = e.clientX - t0.x, dy = e.clientY - t0.y, now = Date.now(), tap = t0.moved < 10 && now - t0.t < 300 && !t0.pinch;
      if (tap && now - lastTap < 300) { clearTimeout(tapT); lastTap = 0; if (z.s > 1) z = { s: 1, x: 0, y: 0 }; else z = { s: 2.5, x: (innerWidth / 2 - e.clientX) * 1.5, y: (innerHeight / 2 - e.clientY) * 1.5 }; ap(); return; }
      if (tap) { lastTap = now; tapT = setTimeout(() => zone(e.clientX), 260); return; }
      if (z.s === 1 && !t0.pinch && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step((dx > 0) === (S.dir === 'rtl') ? 1 : -1); });
    stage.addEventListener('pointercancel', e => ptr.delete(e.pointerId));
    stage.addEventListener('click', () => { $('rdPanel').classList.remove('open'); if (S.mode === 'scroll') ui(!hidden()); });
    $('rdSet').onclick = () => $('rdPanel').classList.toggle('open'); $('rdClose').onclick = () => $('rdPanel').classList.remove('open');
    $('rdPanel').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b) return; S[b.dataset.k] = b.dataset.v; save(); render(); });
    $('rdPanel').addEventListener('input', e => { const k = e.target.dataset.r; if (!k) return; S[k] = +e.target.value; save(); vars(); });
    $('rdRange').oninput = e => go(+e.target.value - 1, false);
    $('rdFs').onclick = async () => { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch (x) { say('المتصفح لا يدعم ملء الشاشة'); } };
    addEventListener('keydown', e => { if (e.target.matches('input,select')) return; const k = e.key, r = S.dir === 'rtl', paged = S.mode !== 'scroll';
      if (paged && k === 'ArrowLeft') step(r ? 1 : -1); else if (paged && k === 'ArrowRight') step(r ? -1 : 1); else if (paged && (k === ' ' || k === 'PageDown' || k === 'ArrowDown')) { e.preventDefault(); step(e.shiftKey ? -1 : 1); } else if (paged && (k === 'PageUp' || k === 'ArrowUp')) step(-1); else if (paged && k === 'Home') go(0); else if (paged && k === 'End') go(N);
      else if (k === 'm') { S.mode = { scroll: 'page', page: 'spread', spread: 'scroll' }[S.mode]; save(); render(); } else if (k === 'f') $('rdFs').click(); else if (k === 's') $('rdSet').click(); else if (k === 'h') ui(!hidden());
      else if (k === '[' && prevC) location.href = url(prevC); else if (k === ']' && nextC) location.href = url(nextC); else if (k === 'Escape') $('rdPanel').classList.remove('open'); });
    let ly = 0; addEventListener('scroll', () => { if (S.mode !== 'scroll') return; const y = scrollY; if (Math.abs(y - ly) > 12) { ui(y > ly && y > 80); ly = y; } if (innerHeight + y >= document.body.scrollHeight - 4) ui(false); }, { passive: true });
    let lt = 0; (function loop(t) { const dt = t - lt; lt = t; if (S.speed > 0 && S.mode === 'scroll' && dt < 100) scrollBy(0, S.speed * dt / 16); requestAnimationFrame(loop); })(0);
    const lock = async () => { try { await navigator.wakeLock.request('screen'); } catch (e) {} }; lock(); document.addEventListener('visibilitychange', () => { if (!document.hidden) lock(); });
    render();
  } catch (err) { console.error(err); fail(err.message || 'حدث خطأ أثناء تحميل الفصل.'); }
})();
